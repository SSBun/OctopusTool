declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    debug?: boolean;
    repeat?: number;
    transparent?: string | null;
    dither?: boolean | string;
  }

  interface GIFFrame {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  class GIF {
    constructor(options: GIFOptions);
    
    addFrame(
      image: HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D | ImageData,
      options?: GIFFrame
    ): void;
    
    render(): void;
    
    abort(): void;
    
    on(event: 'start' | 'progress' | 'abort' | 'finished', callback: (data?: any) => void): void;
  }

  export = GIF;
}

