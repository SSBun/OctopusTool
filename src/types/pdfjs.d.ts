declare module 'pdfjs-dist' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
    getMetadata(): Promise<{ info: any; metadata: any }>;
  }

  export interface PDFPageProxy {
    getViewport(params: { scale: number; rotation?: number }): PDFPageViewport;
    render(params: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PDFPageViewport;
    }): PDFRenderTask;
  }

  export interface PDFPageViewport {
    width: number;
    height: number;
    scale: number;
    rotation: number;
  }

  export interface PDFRenderTask {
    promise: Promise<void>;
  }

  export function getDocument(src: string | Uint8Array | ArrayBuffer): {
    promise: Promise<PDFDocumentProxy>;
  };

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
}

