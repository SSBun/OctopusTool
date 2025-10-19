# 文件转换工具本地实现方案

## 🏗️ 推荐架构

### 技术栈
- **前端**: React (现有)
- **后端**: Node.js + Express
- **文档转换**: LibreOffice (无头模式)
- **PDF操作**: pdf-lib, pdf2json
- **HTML转PDF**: Puppeteer
- **表格提取**: Tabula.js

## 📦 实现方案

### 1. HTML 转 PDF (最简单，优先实现)

**技术**: Puppeteer (纯 Node.js)

```bash
npm install puppeteer
```

**后端实现** (`server/routes/convert.js`):
```javascript
const puppeteer = require('puppeteer');

async function htmlToPdf(htmlContent, options = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  
  const pdf = await page.pdf({
    format: 'A4',
    landscape: options.landscape || false,
    printBackground: options.includeBackground !== false,
    margin: options.margin ? {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    } : {}
  });
  
  await browser.close();
  return pdf;
}
```

**优点**:
- ✅ 完全开源免费
- ✅ 支持现代 Web 特性
- ✅ CSS/JavaScript 完美渲染
- ✅ 易于部署

**缺点**:
- ❌ 启动稍慢（可用池化优化）
- ❌ 内存占用较大

---

### 2. Office 文档转 PDF (Word/Excel/PPT)

**技术**: LibreOffice (无头模式) + Node.js

#### 安装 LibreOffice

**macOS**:
```bash
brew install libreoffice
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get update
sudo apt-get install libreoffice
```

**Windows**:
下载并安装 LibreOffice，配置环境变量

#### Node.js 包装器

```bash
npm install libreoffice-convert
```

**后端实现**:
```javascript
const libre = require('libreoffice-convert');
const fs = require('fs').promises;
const path = require('path');

async function officeToPdf(filePath, fileExtension) {
  const inputBuffer = await fs.readFile(filePath);
  
  return new Promise((resolve, reject) => {
    libre.convert(inputBuffer, '.pdf', undefined, (err, done) => {
      if (err) {
        reject(err);
      } else {
        resolve(done);
      }
    });
  });
}

// 使用示例
app.post('/api/convert/word-to-pdf', upload.single('file'), async (req, res) => {
  try {
    const pdfBuffer = await officeToPdf(req.file.path, '.docx');
    res.contentType('application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**优点**:
- ✅ 完全免费开源
- ✅ 支持所有 Office 格式
- ✅ 格式保留度高
- ✅ 社区支持良好

**缺点**:
- ❌ 需要系统安装 LibreOffice
- ❌ 转换速度中等
- ❌ 需要处理临时文件

---

### 3. PDF 转 Word (复杂)

**推荐方案 1**: pdf2docx (Python) + Python 微服务

```bash
pip install pdf2docx
```

```python
from pdf2docx import Converter
from flask import Flask, request, send_file

app = Flask(__name__)

@app.route('/convert/pdf-to-word', methods=['POST'])
def pdf_to_word():
    pdf_file = request.files['file']
    pdf_path = f'/tmp/{pdf_file.filename}'
    docx_path = pdf_path.replace('.pdf', '.docx')
    
    pdf_file.save(pdf_path)
    
    cv = Converter(pdf_path)
    cv.convert(docx_path)
    cv.close()
    
    return send_file(docx_path, as_attachment=True)
```

**推荐方案 2**: 仅文本 PDF（Node.js）

```bash
npm install pdf-parse docx
```

```javascript
const pdf = require('pdf-parse');
const { Document, Packer, Paragraph } = require('docx');

async function pdfToWord(pdfBuffer) {
  // 提取文本
  const data = await pdf(pdfBuffer);
  const text = data.text;
  
  // 创建 Word 文档
  const doc = new Document({
    sections: [{
      properties: {},
      children: text.split('\n').map(line => 
        new Paragraph({ text: line })
      )
    }]
  });
  
  return await Packer.toBuffer(doc);
}
```

**注意**: 纯 Node.js 方案只能提取文本，无法保留复杂格式。

---

### 4. PDF 转 Excel (表格提取)

**推荐方案**: Tabula + Node.js

```bash
npm install tabula-js
```

```javascript
const tabula = require('tabula-js');
const XLSX = require('xlsx');

async function pdfToExcel(pdfPath) {
  // 使用 Tabula 提取表格
  const tables = await tabula(pdfPath, {
    pages: 'all',
    guess: true,
    lattice: true
  });
  
  // 转换为 Excel
  const workbook = XLSX.utils.book_new();
  
  tables.forEach((table, index) => {
    const worksheet = XLSX.utils.aoa_to_sheet(table);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Sheet${index + 1}`);
  });
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
```

**前提条件**: 需要安装 Java（Tabula 基于 Java）

**替代方案**: 使用云 API
- Adobe PDF Services API
- AWS Textract (OCR + 表格识别)

---

## 🏢 完整后端架构

### 项目结构

```
octopus-backend/
├── src/
│   ├── routes/
│   │   ├── convert.js         # 转换路由
│   │   └── health.js          # 健康检查
│   ├── services/
│   │   ├── htmlToPdf.js       # HTML 转 PDF
│   │   ├── officeToPdf.js     # Office 转 PDF
│   │   ├── pdfToOffice.js     # PDF 转 Office
│   │   └── browserPool.js     # Puppeteer 连接池
│   ├── middleware/
│   │   ├── upload.js          # 文件上传
│   │   ├── validate.js        # 验证中间件
│   │   └── error.js           # 错误处理
│   └── app.js                 # Express 应用
├── temp/                       # 临时文件
├── package.json
└── Dockerfile
```

### 核心代码 (`src/app.js`)

```javascript
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const htmlToPdfService = require('./services/htmlToPdf');
const officeToPdfService = require('./services/officeToPdf');

const app = express();
const upload = multer({ dest: 'temp/' });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// HTML 转 PDF
app.post('/api/convert/html-to-pdf', async (req, res) => {
  try {
    const { html, options } = req.body;
    const pdfBuffer = await htmlToPdfService.convert(html, options);
    
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Word 转 PDF
app.post('/api/convert/word-to-pdf', upload.single('file'), async (req, res) => {
  try {
    const pdfBuffer = await officeToPdfService.convertWordToPdf(req.file.path);
    
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
    res.send(pdfBuffer);
    
    // 清理临时文件
    await fs.unlink(req.file.path);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excel 转 PDF
app.post('/api/convert/excel-to-pdf', upload.single('file'), async (req, res) => {
  try {
    const options = JSON.parse(req.body.options || '{}');
    const pdfBuffer = await officeToPdfService.convertExcelToPdf(
      req.file.path,
      options
    );
    
    res.contentType('application/pdf');
    res.send(pdfBuffer);
    
    await fs.unlink(req.file.path);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Conversion server running on port ${PORT}`);
});
```

---

## 🐳 Docker 部署

### Dockerfile

```dockerfile
FROM node:18-slim

# 安装 LibreOffice 和依赖
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# 安装 Chromium (Puppeteer)
RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "src/app.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  conversion-api:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./temp:/app/temp
    environment:
      - NODE_ENV=production
      - MAX_FILE_SIZE=50mb
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 🚀 部署建议

### 本地开发
```bash
# 1. 安装 LibreOffice
brew install libreoffice  # macOS

# 2. 启动后端
cd octopus-backend
npm install
npm run dev

# 3. 前端连接
# 在 React 中配置 API_URL=http://localhost:3001
```

### 生产部署

**选项 1: 单服务器**
```bash
docker-compose up -d
```

**选项 2: 分离服务**
- HTML 转 PDF: Vercel Serverless Function + Puppeteer
- Office 转换: 独立 Docker 容器（需要 LibreOffice）
- 前端: Vercel/Netlify 静态托管

**选项 3: 云服务（免运维）**
- Cloudflare Workers + Puppeteer
- AWS Lambda + LibreOffice Layer
- Google Cloud Functions

---

## 💰 成本对比

| 方案 | 初始成本 | 运行成本 | 维护难度 | 转换质量 |
|------|---------|---------|---------|---------|
| 自建 Node.js + LibreOffice | $0 | 服务器费用 | 中等 | 良好 |
| Docker 容器 | $0 | 服务器费用 | 低 | 良好 |
| Serverless | $0 | 按使用量 | 低 | 良好 |
| 商业 API (Adobe, Aspose) | $0 | $500-2000/月 | 极低 | 优秀 |
| 开源 + 云服务混合 | $0 | $50-200/月 | 中 | 良好 |

---

## 🎯 实施建议

### 阶段 1: 快速验证 (1-2天)
1. 实现 **HTML 转 PDF**（最简单）
2. 验证 Puppeteer 在你的环境中运行
3. 测试文件上传和下载流程

### 阶段 2: 核心功能 (3-5天)
1. 集成 LibreOffice
2. 实现 Word/Excel/PPT 转 PDF
3. 添加队列系统处理大文件

### 阶段 3: 高级功能 (可选)
1. PDF 转 Word（如果需要）
2. PDF 表格提取
3. 批量转换
4. 转换进度追踪

---

## ⚡ 性能优化

1. **Puppeteer 连接池**
```javascript
const genericPool = require('generic-pool');

const browserPool = genericPool.createPool({
  create: () => puppeteer.launch(),
  destroy: (browser) => browser.close()
}, {
  max: 5,
  min: 1
});
```

2. **Redis 队列** (大文件)
```bash
npm install bull
```

3. **文件清理定时任务**
```javascript
const cron = require('node-cron');

// 每小时清理超过1小时的临时文件
cron.schedule('0 * * * *', async () => {
  // 清理逻辑
});
```

---

## 📚 推荐库

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "puppeteer": "^21.0.0",
    "libreoffice-convert": "^1.6.0",
    "pdf-lib": "^1.17.1",
    "pdf-parse": "^1.1.1",
    "docx": "^8.5.0",
    "xlsx": "^0.18.5",
    "bull": "^4.11.4",
    "node-cron": "^3.0.2"
  }
}
```

---

## 🔒 安全考虑

1. **文件大小限制**: 50MB
2. **文件类型验证**: 使用 magic number 检测
3. **沙箱隔离**: Docker 容器
4. **临时文件清理**: 自动清理机制
5. **速率限制**: 防止滥用
6. **文件扫描**: 可选病毒扫描

---

## 📝 总结

**最小可行方案** (MVP):
- HTML 转 PDF: Puppeteer ✅
- Office 转 PDF: LibreOffice ✅
- 部署: Docker 容器 ✅

**推荐起步**:
1. 先实现 HTML 转 PDF（最简单且最实用）
2. 再添加 Office 转 PDF
3. PDF 转 Word/Excel 可以暂时标记为"即将推出"或使用第三方 API

**长期方案**:
考虑混合方案：简单转换自建，复杂转换使用商业 API

