from transformers import AutoTokenizer, AutoModelForMaskedLM, AutoModelForSeq2SeqLM, pipeline
import re

def test_inlegalbert():
    print("Testing InLegalBERT model...")
    
    try:
        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained("law-ai/InLegalBERT")
        model = AutoModelForMaskedLM.from_pretrained("law-ai/InLegalBERT")
        
        # Test text
        text = """
        The plaintiff filed a suit against the defendant for breach of contract. 
        The contract stipulated that the defendant would deliver 100 units of product X by March 1, 2023. 
        However, the defendant failed to deliver any units by the agreed date. 
        The plaintiff is seeking damages for lost business opportunities under Section 73 of the Indian Contract Act.
        """
        
        # Test fill-mask capability
        fill_mask = pipeline("fill-mask", model=model, tokenizer=tokenizer)
        masked_text = "The court ruled in favor of the [MASK]."
        result = fill_mask(masked_text)
        
        print("Fill-mask results:")
        for r in result:
            print(f"Token: {r['token_str']}, Score: {r['score']:.4f}")
        print("\n")
        
        # Test rule-based statute identification
        print("Rule-based statute identification:")
        statute_patterns = [
            (r"Indian Penal Code|IPC|I\.P\.C\.", "Indian Penal Code"),
            (r"Code of Criminal Procedure|CrPC|Cr\.P\.C\.", "Code of Criminal Procedure"),
            (r"Indian Contract Act", "Indian Contract Act"),
            (r"Indian Evidence Act", "Indian Evidence Act")
        ]
        
        section_pattern = r"[Ss]ection\s+(\d+[A-Za-z]*)(?:\s+of\s+the\s+([A-Za-z\s]+))?"
        
        for pattern, name in statute_patterns:
            if re.search(pattern, text):
                print(f"Found statute: {name}")
                for match in re.finditer(section_pattern, text):
                    section_num = match.group(1)
                    print(f"  Section: {section_num}")
        
        print("InLegalBERT test completed successfully!")
        
    except Exception as e:
        print(f"Error testing InLegalBERT: {str(e)}")

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
    test_inlegalbert()
    print("\n" + "-"*50 + "\n")
    test_legal_led()
