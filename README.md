# LAWGIC

## Project Structure

- `app/`: Next.js frontend application
- `python-backend/`: Python backend using Flask and Hugging Face transformers

## Setup Instructions

### Python Backend

1. Navigate to the python-backend directory:
   \`\`\`bash
   cd python-backend
   \`\`\`

2. Create a virtual environment:
   \`\`\`bash
   python -m venv venv
   \`\`\`

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

5. Run the Flask server:
   \`\`\`bash
   python app.py
   \`\`\`

   The Python backend will run on http://localhost:5000

### Next.js Frontend

1. Navigate to the root directory of the project.

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file with the following content:
   \`\`\`
   PYTHON_BACKEND_URL=http://localhost:5000
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

   The frontend will run on http://localhost:3000 

## Using Docker

You can also run the Python backend using Docker:

1. Build the Docker image:
   \`\`\`bash
   cd python-backend
   docker build -t legal-ai-backend .
   \`\`\`

2. Run the Docker container:
   \`\`\`bash
   docker run -p 5000:5000 legal-ai-backend
   \`\`\`

## Features

- **Document Summarization**: Generate concise summaries of legal documents using Legal-PEGASUS or Legal-LED models.
- **Judgment Prediction**: Predict potential legal outcomes based on case facts.
- **Statute Identification**: Identify relevant statutes and legal provisions from case descriptions.

## Models Used

- **Legal-PEGASUS**: Optimized for documents under 1,024 tokens
- **Legal-LED**: Handles documents up to 16,384 tokens

## Technical Details

- The frontend is built with Next.js and uses the App Router.
- The backend is built with Flask and uses Hugging Face's transformers library.
- The models are loaded directly in the Python backend, which allows for more control over the inference process.
\`\`\`

Python script to test the models locally:

```python file="python-backend/test_models.py" type="code"
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

def test_legal_pegasus():
    print("Testing Legal-PEGASUS model...")
    
    try:
        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained("nsi319/legal-pegasus")
        model = AutoModelForSeq2SeqLM.from_pretrained("nsi319/legal-pegasus")
        
        # Test text
        text = """
        The plaintiff filed a suit against the defendant for breach of contract. 
        The contract stipulated that the defendant would deliver 100 units of product X by March 1, 2023. 
        However, the defendant failed to deliver any units by the agreed date. 
        The plaintiff is seeking damages for lost business opportunities.
        """
        
        # Using the pipeline
        summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)
        result = summarizer(text, max_length=100, min_length=30, do_sample=False)
        
        print("Summary using pipeline:")
        print(result[0]['summary_text'])
        print("\n")
        
        # Manual approach
        inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=100,
            min_length=30,
            length_penalty=2.0,
            num_beams=4,
            early_stopping=True
        )
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        print("Summary using manual approach:")
        print(summary)
        
        print("Legal-PEGASUS test completed successfully!")
        
    except Exception as e:
        print(f"Error testing Legal-PEGASUS: {str(e)}")

def test_legal_led():
    print("Testing Legal-LED model...")
    
    try:
        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained("nsi319/legal-led-base-16384")
        model = AutoModelForSeq2SeqLM.from_pretrained("nsi319/legal-led-base-16384")
        
        # Test text (longer for LED)
        text = """
        The plaintiff filed a suit against the defendant for breach of contract. 
        The contract stipulated that the defendant would deliver 100 units of product X by March 1, 2023. 
        However, the defendant failed to deliver any units by the agreed date. 
        The plaintiff is seeking damages for lost business opportunities.
        
        The contract was signed on January 15, 2023, and included a clause specifying liquidated damages of $1,000 per day for late delivery.
        The defendant claims that they were unable to deliver due to supply chain issues caused by a natural disaster, which they argue constitutes force majeure.
        The contract does contain a force majeure clause, but it specifically excludes "foreseeable supply chain disruptions."
        The plaintiff argues that the supply chain issues were foreseeable and that the defendant should have maintained adequate inventory.
        
        Prior to the contract, the parties had engaged in similar transactions for three years without incident.
        The plaintiff had relied on the timely delivery to fulfill obligations to their own customers, resulting in penalties and lost future business estimated at $50,000.
        """
        
        # Manual approach (LED doesn't have a standard pipeline)
        inputs = tokenizer(text, return_tensors="pt", max_length=4096, truncation=True)
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=150,
            min_length=40,
            length_penalty=2.0,
            num_beams=4,
            early_stopping=True
        )
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        print("Summary using Legal-LED:")
        print(summary)
        
        print("Legal-LED test completed successfully!")
        
    except Exception as e:
        print(f"Error testing Legal-LED: {str(e)}")

if __name__ == "__main__":
    test_legal_pegasus()
    print("\n" + "-"*50 + "\n")
    test_legal_led()
