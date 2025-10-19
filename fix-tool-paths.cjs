const fs = require('fs');
const path = require('path');

// 从 allTools.tsx 提取工具路径映射
const allToolsContent = fs.readFileSync('src/data/allTools.tsx', 'utf-8');

// 创建文件名到路径的映射
const pathMap = {
  // Text tools
  '/tools/text/CaseTool': '/tools/text/case',
  '/tools/text/ReplaceTool': '/tools/text/replace',
  '/tools/text/DedupeTool': '/tools/text/dedupe',
  '/tools/text/StatsTool': '/tools/text/stats',
  '/tools/text/DiffTool': '/tools/text/diff',
  '/tools/text/SortTool': '/tools/text/sort',
  '/tools/text/LoremTool': '/tools/text/lorem',
  '/tools/text/PasswordTool': '/tools/text/password',
  '/tools/text/UuidTool': '/tools/text/uuid',
  '/tools/text/CsvTool': '/tools/text/csv',
  
  // Crypto tools
  '/tools/crypto/AesTool': '/tools/crypto/aes',
  '/tools/crypto/Md5Tool': '/tools/crypto/md5',
  '/tools/crypto/HashTool': '/tools/crypto/hash',
  '/tools/crypto/HmacTool': '/tools/crypto/hmac',
  '/tools/crypto/RsaTool': '/tools/crypto/rsa',
  
  // Encoding tools
  '/tools/encoding/Base64Tool': '/tools/encoding/base64',
  '/tools/encoding/UrlTool': '/tools/encoding/url',
  '/tools/encoding/UnicodeTool': '/tools/encoding/unicode',
  
  // Data tools
  '/tools/data/TimestampTool': '/tools/data/timestamp',
  '/tools/data/ColorTool': '/tools/data/color-converter',
  '/tools/data/UnitTool': '/tools/data/unit-converter',
  '/tools/data/RegexTool': '/tools/data/regex-tester',
  '/tools/data/QrBarcodeTool': '/tools/data/qrbarcode',
  
  // Network tools
  '/tools/network/IpTool': '/tools/network/ip',
  '/tools/network/PingTool': '/tools/network/ping',
  '/tools/network/UserAgentTool': '/tools/network/user-agent',
  '/tools/network/StatusCodeTool': '/tools/network/status-code',
  '/tools/network/UrlParserTool': '/tools/network/url-parser',
  '/tools/network/CurlTool': '/tools/network/curl',
  '/tools/network/HttpTool': '/tools/network/http',
  '/tools/network/PortTool': '/tools/network/port',
  
  // Media tools
  '/media/audio/AudioInfoTool': '/media/audio/info',
  '/media/audio/RecorderTool': '/media/audio/recorder',
  '/media/audio/TrimTool': '/media/audio/trim',
  '/media/audio/WaveformTool': '/media/audio/waveform',
  '/media/video/VideoInfoTool': '/media/video/info',
  '/media/video/GifMakerTool': '/media/video/gif-maker',
  '/media/video/FrameExtractTool': '/media/video/frame-extract',
  '/media/video/ScreenshotTool': '/media/video/screenshot',
  '/media/image/InfoTool': '/media/image/info',
  '/media/image/CompressTool': '/media/image/compress',
  '/media/image/ResizeTool': '/media/image/resize',
  '/media/image/CropTool': '/media/image/crop',
  '/media/image/ConvertTool': '/media/image/convert',
  '/media/image/Base64Tool': '/media/image/base64',
  
  // PDF tools
  '/tools/pdf/PdfInfoTool': '/tools/pdf/info',
  '/tools/pdf/PdfToImageTool': '/tools/pdf/to-image',
  '/tools/pdf/ImageToPdfTool': '/tools/pdf/image-to-pdf',
  '/tools/pdf/PdfMergeTool': '/tools/pdf/merge',
  '/tools/pdf/PdfSplitTool': '/tools/pdf/split',
  '/tools/pdf/PdfCompressTool': '/tools/pdf/compress',
};

function getAllToolFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllToolFiles(filePath, fileList);
    } else if (file.endsWith('Tool.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const toolFiles = [
  ...getAllToolFiles('src/pages/tools'),
  ...getAllToolFiles('src/pages/media'),
];

let fixedCount = 0;

toolFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // 查找并替换错误的 toolPath
    for (const [wrongPath, correctPath] of Object.entries(pathMap)) {
      const regex = new RegExp(`toolPath="${wrongPath.replace(/\//g, '\\/')}"`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `toolPath="${correctPath}"`);
        console.log(`✅ 修复: ${filePath}`);
        console.log(`   ${wrongPath} -> ${correctPath}`);
        modified = true;
        fixedCount++;
        break;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  } catch (error) {
    console.log(`❌ 错误: ${filePath} - ${error.message}`);
  }
});

console.log(`\n✨ 完成！修复了 ${fixedCount} 个文件的工具路径`);

