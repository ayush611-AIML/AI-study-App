import os
import io
from typing import Optional
from pypdf import PdfReader
from PIL import Image

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from PDF bytes using pypdf.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text.strip())
        
        full_text = "\n\n".join(extracted_pages).strip()
        if len(full_text) < 20:
            raise ValueError(
                "Extracted very little text from this PDF. "
                "The PDF might be a scanned image or empty. Please ensure it contains selectable text."
            )
        return full_text
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Failed to parse PDF document: {str(e)}")

def extract_text_from_image(file_bytes: bytes) -> str:
    """
    Extracts text from images using OCR (pytesseract if installed)
    """
    try:
        image = Image.open(io.BytesIO(file_bytes))
        try:
            import pytesseract
            text = pytesseract.image_to_string(image).strip()
            if len(text) < 15:
                raise ValueError("OCR extracted very little text from the image. Please upload a clearer photo of notes.")
            return text
        except ImportError:
            raise ValueError(
                "Tesseract OCR is not installed on this system. "
                "Please upload a PDF or paste text directly, or install tesseract-ocr."
            )
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Failed to process note image: {str(e)}")

def extract_content(file_bytes: bytes, filename: str) -> str:
    """
    Main extraction dispatcher based on file extension.
    """
    ext = os.path.splitext(filename.lower())[1]
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
        return extract_text_from_image(file_bytes)
    elif ext in [".txt", ".md"]:
        return file_bytes.decode("utf-8", errors="ignore").strip()
    else:
        raise ValueError(f"Unsupported file format '{ext}'. Supported formats: PDF, PNG, JPG, TXT.")
