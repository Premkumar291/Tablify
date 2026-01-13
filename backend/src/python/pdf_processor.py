import sys
import json
import argparse
import base64

def process_pdf(data, output_format):
    # Mock conversion logic
    # In production, use libraries like pdfplumber, pandas, etc.
    mock_data = [
        {"Name": "Alice", "Age": 30, "Role": "Engineer"},
        {"Name": "Bob", "Age": 25, "Role": "Designer"},
        {"Name": "Charlie", "Age": 35, "Role": "Manager"}
    ]
    
    if output_format == 'json':
        return {
            "file_content": json.dumps(mock_data, indent=2), 
            "content_type": "application/json",
            "filename": "output.json"
        }
    elif output_format == 'csv':
        csv_content = "Name,Age,Role\nAlice,30,Engineer\nBob,25,Designer\nCharlie,35,Manager"
        return {
            "file_content": csv_content, 
            "content_type": "text/csv",
            "filename": "output.csv"
        }
    elif output_format == 'text':
        text_content = "Extracted Text:\nAlice (30) - Engineer\nBob (25) - Designer\nCharlie (35) - Manager"
        return {
            "file_content": text_content, 
            "content_type": "text/plain",
            "filename": "output.txt"
        }
    elif output_format == 'excel':
        # Return a simple mock message or base64 if we had real libraries
        # Using a dummy string for now
        return {
            "file_content": "MOCKED_EXCEL_BINARY_CONTENT", 
            "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "filename": "output.xlsx",
            "is_base64": False
        }
    
    return {"error": "Unsupported format"}

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
