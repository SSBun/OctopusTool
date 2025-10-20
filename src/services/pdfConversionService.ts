import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';

/**
 * HTML 转 PDF（使用 html2canvas + jsPDF）
 */
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
  container.style.width = '800px'; // 固定宽度以获得一致的渲染
  document.body.appendChild(container);

  try {
    // 使用 html2canvas 将 HTML 转为图片
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: options.includeBackground ? null : '#ffffff',
      logging: false,
    });

    // 创建 PDF
    const imgWidth = options.landscape ? 297 : 210; // A4 宽度（mm）
    const imgHeight = options.landscape ? 210 : 297; // A4 高度（mm）
    const pageHeight = imgHeight;
    
    const pdf = new jsPDF({
      orientation: options.landscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = imgWidth - (options.margin ? 20 : 0);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = options.margin ? 10 : 0;

    // 添加第一页
    pdf.addImage(
      imgData,
      'PNG',
      options.margin ? 10 : 0,
      position,
      pdfWidth,
      pdfHeight
    );
    heightLeft -= pageHeight;

    // 如果内容超过一页，添加更多页面
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        'PNG',
        options.margin ? 10 : 0,
        position,
        pdfWidth,
        pdfHeight
      );
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * 通过 URL 转换为 PDF
 */
export async function convertUrlToPdf(
  _url: string,
  _options: {
    landscape?: boolean;
    includeBackground?: boolean;
    margin?: boolean;
  } = {}
): Promise<Blob> {
  // 在前端环境中，我们需要通过 iframe 加载 URL
  // 但这有跨域限制，所以这个功能需要后端支持或使用 Puppeteer
  throw new Error('URL 转 PDF 需要后端支持。请使用 HTML 内容转换。');
}

/**
 * 合并多个 PDF 文件
 */
export async function mergePdfs(pdfFiles: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * 拆分 PDF 文件
 */
export async function splitPdf(
  pdfFile: File,
  pageRanges: { start: number; end: number }[]
): Promise<Blob[]> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const originalPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = originalPdf.getPageCount();

  const results: Blob[] = [];

  for (const range of pageRanges) {
    // 验证范围
    if (range.start < 0 || range.end >= totalPages || range.start > range.end) {
      throw new Error(`无效的页面范围: ${range.start}-${range.end}`);
    }

    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from(
      { length: range.end - range.start + 1 },
      (_, i) => range.start + i
    );
    const pages = await newPdf.copyPages(originalPdf, pageIndices);
    pages.forEach((page) => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    results.push(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }));
  }

  return results;
}

/**
 * 压缩 PDF（通过降低图片质量）
 */
export async function compressPdf(
  pdfFile: File,
  _quality: number = 0.7
): Promise<Blob> {
  // 注意：pdf-lib 不直接支持图片压缩
  // 这里我们只是重新保存 PDF，实际压缩效果有限
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  // 保存时使用压缩选项
  const pdfBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * 获取 PDF 信息
 */
export async function getPdfInfo(pdfFile: File) {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);

  return {
    pageCount: pdf.getPageCount(),
    title: pdf.getTitle() || '未设置',
    author: pdf.getAuthor() || '未设置',
    subject: pdf.getSubject() || '未设置',
    creator: pdf.getCreator() || '未设置',
    producer: pdf.getProducer() || '未设置',
    creationDate: pdf.getCreationDate()?.toISOString() || '未设置',
    modificationDate: pdf.getModificationDate()?.toISOString() || '未设置',
  };
}

/**
 * 下载 Blob 为文件
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

