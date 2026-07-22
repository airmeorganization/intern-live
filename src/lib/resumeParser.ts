import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const parseResumeFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    const arrayBuffer = await file.arrayBuffer();

    if (extension === 'pdf') {
      return await parsePDF(arrayBuffer);
    } else if (extension === 'docx' || extension === 'doc') {
      return await parseDOCX(arrayBuffer);
    } else if (extension === 'txt') {
        const textDecoder = new TextDecoder('utf-8');
        return textDecoder.decode(arrayBuffer);
    } else {
      throw new Error("Unsupported file format. Please upload PDF or DOCX.");
    }
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to extract text from the file.");
  }
};

const parsePDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + ' \n';
        }

        return fullText;
    } catch (e) {
        console.error("PDF Parsing error:", e);
        throw new Error("Could not parse PDF. It might be encrypted or scanned.");
    }
};

const parseDOCX = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
        // mammoth.extractRawText takes an ArrayBuffer
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (e) {
        console.error("DOCX Parsing error:", e);
        throw new Error("Could not parse DOCX file.");
    }
};
