# 静态网站文件转换实现方案

## 🎯 架构：GitHub Pages + Serverless Functions

由于部署在 GitHub Pages（静态托管），推荐采用以下混合架构：

```
前端 (GitHub Pages)
    ↓
Serverless Functions (Vercel/Netlify)
    ↓
文件转换服务
```

---

## 📦 方案 A：纯浏览器端转换（推荐优先实现）

### 1. HTML 转 PDF ⭐⭐⭐⭐⭐

**技术栈**: jsPDF + html2canvas

```bash
npm install jspdf html2canvas
```

**完整实现**:

```typescript
// src/services/htmlToPdfService.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function convertHtmlToPdf(
  htmlContent: string,
  options: {
    landscape?: boolean;
    includeBackground?: boolean;
    margin?: boolean;
  } = {}
): Promise<Blob> {
  // 创建临时容器
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  try {
    // 使用 html2canvas 将 HTML 转为图片
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: options.includeBackground ? null : '#ffffff',
    });

    // 创建 PDF
    const imgWidth = 210; // A4 宽度（mm）
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: options.landscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    if (options.margin) {
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        10, 10,
        imgWidth - 20, imgHeight - 20
      );
    } else {
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0, 0,
        imgWidth, imgHeight
      );
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}
```

**更新前端组件**:

```typescript
// src/pages/tools/document/HtmlToPdfTool.tsx
import { convertHtmlToPdf } from '../../../services/htmlToPdfService';

const handleConvert = async () => {
  setConverting(true);
  setError('');

  try {
    const pdfBlob = await convertHtmlToPdf(htmlContent, options);
    
    // 下载 PDF
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccess('转换成功！');
  } catch (err) {
    setError('转换失败: ' + err.message);
  } finally {
    setConverting(false);
  }
};
```

**优点**:
- ✅ 完全在浏览器端运行
- ✅ 无需后端
- ✅ 免费
- ✅ 即时转换

**缺点**:
- ❌ 复杂 CSS 可能渲染不完美
- ❌ 大文件可能卡顿

---

### 2. PDF 操作（拆分/合并/压缩）⭐⭐⭐⭐⭐

**技术栈**: pdf-lib (纯浏览器端)

```bash
npm install pdf-lib
```

**实现示例**:

```typescript
// src/services/pdfService.ts
import { PDFDocument } from 'pdf-lib';

// PDF 合并
export async function mergePdfs(pdfFiles: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

// PDF 拆分
export async function splitPdf(
  pdfFile: File,
  pageRanges: { start: number; end: number }[]
): Promise<Blob[]> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const originalPdf = await PDFDocument.load(arrayBuffer);
  
  const results: Blob[] = [];
  
  for (const range of pageRanges) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(
      originalPdf,
      Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i)
    );
    pages.forEach(page => newPdf.addPage(page));
    
    const pdfBytes = await newPdf.save();
    results.push(new Blob([pdfBytes], { type: 'application/pdf' }));
  }
  
  return results;
}
```

**优点**:
- ✅ 完全在浏览器端
- ✅ 功能强大
- ✅ 无需后端

---

## 📡 方案 B：Serverless Functions + 浏览器端

### 架构设计

```
GitHub Pages (前端)
    ↓ AJAX/Fetch
Vercel Functions (后端)
    ↓
LibreOffice/Puppeteer
```

### 1. 使用 Vercel Serverless Functions

**优势**:
- ✅ 免费额度充足
- ✅ 自动部署
- ✅ 可以运行 Puppeteer
- ✅ 可以集成 LibreOffice

**项目结构**:

```
octopus/
├── src/                    # React 前端
├── api/                    # Vercel Serverless Functions
│   ├── html-to-pdf.ts     # HTML 转 PDF
│   ├── office-to-pdf.ts   # Office 转 PDF (需要 Layer)
│   └── pdf-to-word.ts     # PDF 转 Word
├── vercel.json
└── package.json
```

**vercel.json 配置**:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

**HTML 转 PDF Function** (`api/html-to-pdf.ts`):

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, options = {} } = req.body;

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html);

    const pdf = await page.pdf({
      format: 'A4',
      landscape: options.landscape || false,
      printBackground: options.includeBackground !== false,
      margin: options.margin ? {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      } : undefined,
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
    res.send(pdf);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

**package.json 依赖**:

```json
{
  "dependencies": {
    "@sparticuz/chromium": "^119.0.0",
    "puppeteer-core": "^21.0.0"
  }
}
```

**前端调用**:

```typescript
// src/services/api.ts
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://your-app.vercel.app/api'
  : '/api';

export async function convertHtmlToPdf(
  html: string,
  options: any
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/html-to-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ html, options }),
  });

  if (!response.ok) {
    throw new Error('转换失败');
  }

  return await response.blob();
}
```

---

### 2. Office 文档转换（Vercel + LibreOffice Layer）

由于 Vercel 默认不包含 LibreOffice，有两种方案：

**方案 2.1：使用第三方 API（推荐）**

```typescript
// api/office-to-pdf.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import FormData from 'form-data';
import fetch from 'node-fetch';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 使用 CloudConvert API (有免费额度)
  const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDCONVERT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tasks: {
        'import-1': {
          operation: 'import/upload',
        },
        'convert-1': {
          operation: 'convert',
          input: 'import-1',
          output_format: 'pdf',
        },
        'export-1': {
          operation: 'export/url',
          input: 'convert-1',
        },
      },
    }),
  });

  const job = await response.json();
  // ... 处理转换逻辑
}
```

**方案 2.2：使用 Cloudflare Workers（支持 WASM）**

Cloudflare Workers 更适合运行这类转换，因为：
- 更长的执行时间
- 更好的 WASM 支持
- 免费额度更高

---

## 🌐 方案 C：纯第三方 API（最简单）

### 推荐的免费/低成本 API

#### 1. CloudConvert (推荐)

**特点**:
- ✅ 免费：25次/天
- ✅ 支持200+格式
- ✅ 高质量转换

```typescript
// src/services/cloudConvert.ts
export async function convertFile(
  file: File,
  targetFormat: string
): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);

  // 通过 Vercel Function 调用（隐藏 API Key）
  const response = await fetch('/api/convert', {
    method: 'POST',
    body: formData,
  });

  return await response.blob();
}
```

#### 2. ConvertAPI

**特点**:
- ✅ 免费：1500秒/月
- ✅ 简单易用

```typescript
const response = await fetch(
  `https://v2.convertapi.com/convert/${fromFormat}/to/${toFormat}?Secret=${apiKey}`,
  {
    method: 'POST',
    body: formData,
  }
);
```

#### 3. PDF.co (专注 PDF)

**特点**:
- ✅ 免费额度
- ✅ 专门针对 PDF 优化

---

## 🎯 完整推荐方案

### 最佳实践：混合方案

```typescript
// src/services/conversionService.ts

export class ConversionService {
  // 浏览器端转换（免费、快速）
  async convertInBrowser(
    type: 'html-to-pdf' | 'pdf-merge' | 'pdf-split',
    ...args: any[]
  ) {
    switch (type) {
      case 'html-to-pdf':
        return await this.htmlToPdfBrowser(...args);
      case 'pdf-merge':
        return await this.mergePdfBrowser(...args);
      // ...
    }
  }

  // Serverless 转换（中等复杂度）
  async convertViaServerless(
    type: 'office-to-pdf' | 'pdf-to-word',
    ...args: any[]
  ) {
    return await fetch('/api/convert', {
      method: 'POST',
      body: JSON.stringify({ type, args }),
    });
  }

  // 第三方 API（复杂转换）
  async convertViaAPI(
    type: string,
    ...args: any[]
  ) {
    return await fetch('/api/convert-proxy', {
      method: 'POST',
      body: JSON.stringify({ type, args }),
    });
  }

  // 智能路由
  async convert(type: string, ...args: any[]) {
    // 根据转换类型选择最优方案
    if (['html-to-pdf', 'pdf-merge', 'pdf-split'].includes(type)) {
      return await this.convertInBrowser(type, ...args);
    } else if (['office-to-pdf'].includes(type)) {
      return await this.convertViaServerless(type, ...args);
    } else {
      return await this.convertViaAPI(type, ...args);
    }
  }
}
```

---

## 📊 方案对比

| 转换类型 | 浏览器端 | Vercel Function | 第三方 API | 推荐方案 |
|---------|---------|-----------------|-----------|---------|
| HTML → PDF | ✅ jsPDF | ✅ Puppeteer | ✅ CloudConvert | **浏览器端** |
| Word → PDF | ❌ | ⚠️ 需要 Layer | ✅ CloudConvert | **第三方 API** |
| Excel → PDF | ❌ | ⚠️ 需要 Layer | ✅ CloudConvert | **第三方 API** |
| PPT → PDF | ❌ | ⚠️ 需要 Layer | ✅ CloudConvert | **第三方 API** |
| PDF → Word | ❌ | ⚠️ 复杂 | ✅ CloudConvert | **第三方 API** |
| PDF → Excel | ❌ | ⚠️ 复杂 | ✅ CloudConvert | **第三方 API** |
| PDF 合并/拆分 | ✅ pdf-lib | ✅ | ✅ | **浏览器端** |

---

## 🚀 实施步骤

### 第一阶段：纯浏览器端（1-2天）

1. ✅ **HTML 转 PDF** - 使用 jsPDF + html2canvas
2. ✅ **PDF 合并** - 使用 pdf-lib
3. ✅ **PDF 拆分** - 使用 pdf-lib

**安装依赖**:
```bash
npm install jspdf html2canvas pdf-lib
```

### 第二阶段：集成 Serverless（2-3天）

1. 创建 Vercel 项目
2. 实现 HTML 转 PDF Function (Puppeteer)
3. 配置域名和环境变量

### 第三阶段：集成第三方 API（1天）

1. 注册 CloudConvert 账号
2. 创建 API 代理 Function
3. 实现 Office 文档转换

---

## 💰 成本估算

### 免费方案
- **浏览器端**: $0
- **Vercel Functions**: $0 (100GB-Hrs/月)
- **CloudConvert**: $0 (25次/天)
- **总计**: $0/月，足够个人使用

### 轻度使用
- **Vercel Pro**: $20/月
- **CloudConvert**: $9/月 (500次)
- **总计**: $29/月，支持中等流量

---

## 📝 最终建议

**立即实现**（纯前端，0成本）:
1. ✅ HTML 转 PDF - jsPDF
2. ✅ PDF 合并/拆分 - pdf-lib

**短期计划**（Vercel Functions）:
3. ✅ HTML 转 PDF (高质量) - Puppeteer

**长期计划**（按需）:
4. Office 转换 - CloudConvert API
5. PDF 转 Word - CloudConvert API

这样既保证了核心功能免费可用，又为未来扩展预留了空间！

