# PDF 工具类型错误修复文档

## 问题描述

在使用 `pdf-lib` 库时，TypeScript 会报告类型不兼容错误：

```typescript
// ❌ 错误：Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BlobPart'
const pdfBytes = await pdfDoc.save();
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
```

## 错误原因

- `pdf-lib` 的 `save()` 方法返回 `Uint8Array<ArrayBufferLike>`
- `Blob` 构造函数期望 `BlobPart[]` 类型（严格的 `ArrayBuffer` 或标准 `Uint8Array`）
- TypeScript 严格模式下认为这两种类型不兼容

## 解决方案

### 方案 1：类型断言（推荐）✅

最简单且有效的方法，使用 `as BlobPart` 类型断言：

```typescript
const pdfBytes = await pdfDoc.save();
const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
```

**优点**：
- 代码简洁
- 运行时没有额外开销
- 不改变实际数据

**应用位置**：
- `src/pages/tools/pdf/PdfCompressTool.tsx`
- `src/pages/tools/pdf/ImageToPdfTool.tsx`
- `src/pages/tools/pdf/PdfMergeTool.tsx`
- `src/pages/tools/pdf/PdfSplitTool.tsx`

### 方案 2：使用 .buffer 属性（备选）

访问底层的 ArrayBuffer：

```typescript
const pdfBytes = await pdfDoc.save();
const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
```

**注意**：在某些 TypeScript 配置下可能仍有类型警告。

### 方案 3：创建类型定义文件（长期方案）

创建 `src/types/pdf-lib.d.ts` 扩展类型定义（已实现）。

## 验证

```bash
# TypeScript 类型检查
npx tsc --noEmit

# ESLint 检查
npm run lint

# 构建验证
npm run build
```

## IDE 类型提示

如果 IDE 仍显示红色波浪线：
1. 重启 TypeScript 服务器（VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"）
2. 重新加载窗口（VS Code: `Cmd+Shift+P` → "Developer: Reload Window"）

## 相关文件

- `src/types/pdf-lib.d.ts` - 类型定义扩展
- `docs/PDF_TYPE_FIX.md` - 本文档

## 参考

- [pdf-lib GitHub](https://github.com/Hopding/pdf-lib)
- [TypeScript 类型断言](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [MDN: Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

