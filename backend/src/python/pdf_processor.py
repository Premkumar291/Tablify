import sys
import json
import argparse
import base64
import io
import pandas as pd
import pdfplumber

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

def process_pdf(data, output_format):
    try:
        dfs = extract_tables_from_pdf(data)
        
        if not dfs:
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
    args = parser.parse_args()

    try:
        # Read binary from stdin
        input_data = sys.stdin.buffer.read()
        if not input_data:
            raise ValueError("No input data")

        # Process
        result = process_pdf(input_data, args.format)
        
        # Output JSON to stdout
        print(json.dumps(result))

    except Exception as e:
        # Error handling
        print(json.dumps({"error": str(e)}))
