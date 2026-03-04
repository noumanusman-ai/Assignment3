declare module "pdf-parse" {
  interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: Record<string, any>;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>;
  export default pdfParse;
}
