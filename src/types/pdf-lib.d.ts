/**
 * pdf-lib 类型扩展
 * 
 * 解决 pdf-lib 返回的 Uint8Array<ArrayBufferLike> 
 * 与 Blob 构造函数期望的 BlobPart 类型不兼容的问题
 */

declare module 'pdf-lib' {
  // 重新导出所有原始类型
  export * from 'pdf-lib';
}

// 全局类型扩展：使 Uint8Array 兼容 BlobPart
declare global {
  interface Uint8Array {
    // 确保 Uint8Array 可以被用作 BlobPart
    readonly [Symbol.toStringTag]: 'Uint8Array';
  }
}

export {};

