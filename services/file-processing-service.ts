import { createWorker } from "tesseract.js"

// Function to extract text from an image using OCR
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const worker = await createWorker("eng")

    // Convert the file to a format Tesseract can use
    const imageData = await fileToImageData(imageFile)

    // Recognize text in the image
    const { data } = await worker.recognize(imageData)
    await worker.terminate()

    return data.text
  } catch (error) {
    console.error("OCR error:", error)
    throw new Error("Failed to extract text from image")
  }
}

// Function to extract text from a PDF
export async function extractTextFromPDF(pdfFile: File): Promise<string> {
  try {
    // Import PDF.js dynamically
    const pdfjs = await import("pdfjs-dist")

    // Set the worker source
    const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry")
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

    // Load the PDF file
    const arrayBuffer = await pdfFile.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

    let fullText = ""

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(" ")
      fullText += pageText + "\n"
    }

    return fullText
  } catch (error) {
    console.error("PDF extraction error:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

// Helper function to convert a File to ImageData
async function fileToImageData(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Failed to read file"))
      }

      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = event.target.result as string
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

// Main function to process any file (PDF or image)
export async function processFile(file: File): Promise<string> {
  const fileType = file.type

  if (fileType.includes("pdf")) {
    return extractTextFromPDF(file)
  } else if (fileType.includes("image")) {
    return extractTextFromImage(file)
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or image file.")
  }
}
