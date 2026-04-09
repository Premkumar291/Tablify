import sys
import json
import argparse
import base64
import io
import pandas as pd
import pdfplumber
from PIL import Image
import numpy as np

# Global OCR reader (lazy-loaded to save RAM if not needed)
_ocr_reader = None

def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        import easyocr
        # Disable GPU if you don't have CUDA installed
        _ocr_reader = easyocr.Reader(['en'], gpu=False)
    return _ocr_reader

def extract_tables_from_image(image_bytes):
    """
    Extracts table structure from an image using local OCR.
    Groups text detection results into rows based on the 'y' coordinate.
    """
    try:
        reader = get_ocr_reader()
        image = Image.open(io.BytesIO(image_bytes))
        img_np = np.array(image)

        # 1. OCR all text with bounding boxes
        # result: [[box, text, confidence], ...]
        results = reader.readtext(img_np)

        if not results:
            return []

        # 2. Sort by Y coordinate first, then X coordinate
        # box format: [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]
        data = []
        for (box, text, prob) in results:
            y_center = (box[0][1] + box[2][1]) / 2
            x_center = (box[0][0] + box[1][0]) / 2
            data.append({'x': x_center, 'y': y_center, 'text': text})

        # 3. Cluster rows based on Y coordinate threshold
        # We use a dynamic threshold based on the average height of detection boxes
        data.sort(key=lambda item: item['y'])
        
        # Estimate average text height from first few results
        avg_h = 20
        if results:
            heights = [abs(res[0][0][1] - res[0][2][1]) for res in results[:10]]
            avg_h = sum(heights) / len(heights) if heights else 20

        rows = []
        if data:
            current_row = [data[0]]
            for i in range(1, len(data)):
                # If the difference in Y is small (within ~70% of text height), it's the same row
                if abs(data[i]['y'] - current_row[0]['y']) < (avg_h * 0.7): 
                    current_row.append(data[i])
                else:
                    rows.append(current_row)
                    current_row = [data[i]]
            rows.append(current_row)

        # 4. Sort each row by X coordinate and convert to list of strings
        table_data = []
        for r in rows:
            r.sort(key=lambda item: item['x'])
            table_data.append([item['text'] for item in r])

        if not table_data:
            return []

        # Convert to DataFrame
        # For simplicity, treat the 1st row as header
        if len(table_data) > 1:
            df = pd.DataFrame(table_data[1:], columns=table_data[0], dtype=str)
        else:
            df = pd.DataFrame(table_data, dtype=str)
        
        return [df]
    except Exception as e:
        print(f"DEBUG: OCR Error: {str(e)}", file=sys.stderr)
        return []


def extract_tables_from_pdf(pdf_bytes):
    """
    Extracts all tables from PDF bytes and returns a list of DataFrames.
    Uses a hybrid strategy: tries 'lattice' (lines) first, then 'stream' (text alignment).
    """
    tables = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            # 1. Try Lattice (graphical lines) first - best for bordered tables
            try:
                extracted = page.extract_tables({
                    "vertical_strategy": "lines",
                    "horizontal_strategy": "lines",
                    "snap_tolerance": 4,
                })
            except Exception:
                extracted = []

            # 2. If Lattice failed to find anything substantial, try Stream (whitespace)
            # This handles borderless tables often found in academic/business docs
            if not extracted:
                try:
                    extracted = page.extract_tables({
                        "vertical_strategy": "text",
                        "horizontal_strategy": "text",
                        "snap_tolerance": 4,
                    })
                except Exception:
                    extracted = []

            for table_data in extracted:
                # Basic cleaning: convert to DataFrame
                if table_data:
                    # Filter out purely empty rows
                    cleaned_table = [row for row in table_data if any(cell and str(cell).strip() for cell in row)]
                    
                    if not cleaned_table:
                        continue

                    # Clean None values in the remaining rows, and replace newlines with spaces
                    # Also prepend \u200B to long numbers to prevent scientific notation in Excel/CSV
                    cleaned_data = []
                    for row in cleaned_table:
                        new_row = []
                        for cell in row:
                            if cell is None:
                                new_row.append("")
                                continue
                            
                            val = str(cell).replace('\n', ' ').strip()
                            
                            # Check if it looks like a long number (10+ digits) or has E notation potential
                            # We prepend a zero-width space to force Excel/CSVs to treat it as text
                            if val.isdigit() and len(val) > 9:
                                val = "\u200B" + val
                            
                            new_row.append(val)
                        cleaned_data.append(new_row)
                    
                    if not cleaned_data:
                        continue

                    # ALIGNMENT LOGIC:
                    # Check if this table aligns with the previous table (master headers)
                    # If column counts match, we assume it's a continuation.
                    
                    current_cols = len(cleaned_data[0])
                    
                    # Try to align with the most recent table's headers if it exists
                    aligned = False
                    if tables:
                        # Get the headers of the last added table (DataFrame)
                        last_df = tables[-1]
                        last_headers = list(last_df.columns)
                        
                        if len(last_headers) == current_cols:
                            # It matches the column count! Treat as continuation.
                            
                            # Check if the first row is just a repetition of headers
                            # We compare a few values or just checking exact match is usually enough
                            # but cleaned_data might have slightly different string format vs headers.
                            # Simple check:
                            if cleaned_data[0] == last_headers:
                                # Skip header row
                                data_rows = cleaned_data[1:]
                            else:
                                # Assume no header repetition, all data
                                data_rows = cleaned_data
                            
                            if data_rows:
                                df = pd.DataFrame(data_rows, columns=last_headers, dtype=str)
                                aligned = True
                            else:
                                continue # Only header meant empty table effectively

                    if not aligned:
                        # Treat as new table
                        if len(cleaned_data) > 1:
                            headers = cleaned_data[0]
                            # Handle duplicate headers
                            seen = {}
                            new_headers = []
                            for col in headers:
                                col_str = str(col).strip() if col else f"Column_{len(new_headers)}"
                                if col_str in seen:
                                    seen[col_str] += 1
                                    new_headers.append(f"{col_str}_{seen[col_str]}")
                                else:
                                    seen[col_str] = 0
                                    new_headers.append(col_str)
                                    
                            df = pd.DataFrame(cleaned_data[1:], columns=new_headers, dtype=str)
                        else:
                            df = pd.DataFrame(cleaned_data, dtype=str)
                    
                    # Heuristic: Drop tables that are likely just text paragraphs detected as 1x1 or 1xN
                    # EXCEPT if it was aligned (then it's definitely part of a table)
                    if not aligned and (df.shape[1] < 2 and df.shape[0] < 3):
                         continue

                    tables.append(df)
                    
    return tables

def process_file(data, output_format, mode='tables'):
    try:
        # 1. Detect if it's a PDF or Image
        is_pdf = data.startswith(b'%PDF-')
        
        dfs = []
        if is_pdf:
            if mode == 'text':
                with pdfplumber.open(io.BytesIO(data)) as pdf:
                    text_content = [p.extract_text() for p in pdf.pages if p.extract_text()]
                    return {
                        "file_content": "\n\n".join(text_content), 
                        "content_type": "text/plain",
                        "filename": "output.txt",
                        "is_base64": False
                    }
            dfs = extract_tables_from_pdf(data)
        else:
            # Try Image processing via OCR
            dfs = extract_tables_from_image(data)
        
        if not dfs:
            # Final fallback: text extraction from PDF if no tables found
            if is_pdf and output_format == 'text':
             if output_format == 'text':
                # Fallback: Extract raw text if no tables found and user asked for text
                 with pdfplumber.open(io.BytesIO(data)) as pdf:
                    text_content = []
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            text_content.append(text)
                    
                    full_text = "\n\n".join(text_content)
                    
                    return {
                        "file_content": full_text, 
                        "content_type": "text/plain",
                        "filename": "output.txt",
                        "is_base64": False
                    }
             else:
                return {"error": "No tables found in PDF"}

        # For simplicity, merge all found tables or take the first one
        # In a real app, you might want to return multiple sheets or a merged big table
        # Let's clean empty columns/rows
        final_df = pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()
        
        # Remove empty columns/rows
        final_df.dropna(how='all', inplace=True)
        final_df.dropna(axis=1, how='all', inplace=True)

        if output_format == 'json':
            return {
                "file_content": final_df.to_json(orient='records', indent=2), 
                "content_type": "application/json",
                "filename": "output.json",
                "is_base64": False
            }
        elif output_format == 'csv':
            return {
                "file_content": final_df.to_csv(index=False), 
                "content_type": "text/csv",
                "filename": "output.csv",
                "is_base64": False
            }
        elif output_format == 'text':
            return {
                "file_content": final_df.to_string(index=False), 
                "content_type": "text/plain",
                "filename": "output.txt",
                "is_base64": False
            }
        elif output_format == 'excel':
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # Write each table to a separate sheet if we didn't concat, 
                # but we concatenated for simplicity. 
                final_df.to_excel(writer, index=False, sheet_name='Extracted_Data')
            
            output.seek(0)
            b64_data = base64.b64encode(output.read()).decode('utf-8')
            
            return {
                "file_content": b64_data, 
                "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "filename": "output.xlsx",
                "is_base64": True
            }
        
        return {"error": "Unsupported format"}

    except Exception as e:
        return {"error": f"Extraction Failed: {str(e)}"}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--format', default='json')
    parser.add_argument('--mode', default='tables')
    args = parser.parse_args()

    try:
        # Read binary from stdin
        input_data = sys.stdin.buffer.read()
        if not input_data:
            raise ValueError("No input data")

        # Process
        result = process_file(input_data, args.format, args.mode)
        
        # Output JSON to stdout
        print(json.dumps(result))

    except Exception as e:
        # Error handling
        print(json.dumps({"error": str(e)}))
