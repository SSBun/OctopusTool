import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme/theme';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Tools } from './pages/Tools';
import { NotFound } from './pages/NotFound';
import { JsonTools } from './pages/tools/JsonTools';
import { JsonFormatter } from './pages/tools/json/JsonFormatter';
import { JsonMinify } from './pages/tools/json/JsonMinify';
import { JsonValidator } from './pages/tools/json/JsonValidator';
import { EncodingTools } from './pages/tools/EncodingTools';
import { Base64Tool } from './pages/tools/encoding/Base64Tool';
import { UrlTool } from './pages/tools/encoding/UrlTool';
import { UnicodeTool } from './pages/tools/encoding/UnicodeTool';
import { HtmlEntityTool } from './pages/tools/encoding/HtmlEntityTool';
import { CryptoTools } from './pages/tools/CryptoTools';
import { Md5Tool } from './pages/tools/crypto/Md5Tool';
import { HashTool } from './pages/tools/crypto/HashTool';
import { AesTool } from './pages/tools/crypto/AesTool';
import { RsaTool } from './pages/tools/crypto/RsaTool';
import { HmacTool } from './pages/tools/crypto/HmacTool';
import { DataTools } from './pages/tools/DataTools';
import { TimestampTool } from './pages/tools/data/TimestampTool';
import { RegexTool } from './pages/tools/data/RegexTool';
import { ColorTool } from './pages/design/ColorTool';
import { ColorPicker } from './pages/design/ColorPicker';
import { PaletteGenerator } from './pages/design/PaletteGenerator';
import { GradientGenerator } from './pages/design/GradientGenerator';
import { ContrastChecker } from './pages/design/ContrastChecker';
import { ColorSwatches } from './pages/design/ColorSwatches';
import { UnitTool } from './pages/tools/data/UnitTool';
import { QrBarcodeTool } from './pages/tools/data/QrBarcodeTool';
import { TimeTools } from './pages/tools/data/TimeTools';
import { UnitTools } from './pages/tools/data/UnitTools';
import { RegexTools } from './pages/tools/data/RegexTools';
import { QrcodeTools } from './pages/tools/data/QrcodeTools';
import { DevTools } from './pages/tools/data/DevTools';
import { DataConvertTools } from './pages/tools/data/ConvertTools';
import { ColorTools as DesignColorTools } from './pages/design/ColorTools';
import { CssTools } from './pages/design/CssTools';
import { CodeFormatTools } from './pages/tools/dev/CodeFormatTools';
import { NetworkTools } from './pages/tools/NetworkTools';
import { 
  IpTool, 
  PingTool, 
  UserAgentTool, 
  StatusCodeTool, 
  PortTool,
  CurlTool,
  HttpTool,
  UrlParserTool 
} from './pages/tools/network';
import { HttpTools } from './pages/tools/network/HttpTools';
import { UrlTools } from './pages/tools/network/UrlTools';
import { DiagnosticTools } from './pages/tools/network/DiagnosticTools';
import { ReferenceTools } from './pages/tools/network/ReferenceTools';
import { TextTools } from './pages/tools/TextTools';
import { EditTools } from './pages/tools/text/EditTools';
import { AnalysisTools } from './pages/tools/text/AnalysisTools';
import { GenerateTools } from './pages/tools/text/GenerateTools';
import {
  DiffTool,
  CaseTool,
  StatsTool,
  DedupeTool,
  PasswordTool,
  UuidTool,
  ReplaceTool,
  SortTool,
  LoremTool,
  CsvTool,
} from './pages/tools/text';
import { MarkdownEditor } from './pages/tools/text/MarkdownEditor';
import { EmojiTool } from './pages/tools/text/EmojiTool';
import { VideoTools } from './pages/media/VideoTools';
import { AudioTools } from './pages/media/AudioTools';
import { ImageTools } from './pages/media/ImageTools';
import {
  CompressTool,
  ConvertTool,
  CropTool,
  ResizeTool,
  Base64Tool as ImageBase64Tool,
  InfoTool,
} from './pages/media/image';
import {
  ScreenshotTool,
  VideoInfoTool,
  FrameExtractTool,
  GifMakerTool,
} from './pages/media/video';
import {
  AudioInfoTool,
  WaveformTool,
  RecorderTool,
  TrimTool,
} from './pages/media/audio';
import { PdfTools } from './pages/tools/PdfTools';
import { FileConversionTools } from './pages/tools/document/FileConversionTools';
import { WordToPdfTool } from './pages/tools/document/WordToPdfTool';
import { ExcelToPdfTool } from './pages/tools/document/ExcelToPdfTool';
import { PptToPdfTool } from './pages/tools/document/PptToPdfTool';
import { PdfToWordTool } from './pages/tools/document/PdfToWordTool';
import { PdfToExcelTool } from './pages/tools/document/PdfToExcelTool';
import { HtmlToPdfTool } from './pages/tools/document/HtmlToPdfTool';
import {
  PdfInfoTool,
  PdfToImageTool,
  ImageToPdfTool,
  PdfMergeTool,
  PdfSplitTool,
  PdfCompressTool,
} from './pages/tools/pdf';
import { ThemeMode } from './types';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { FavoritesPage } from './pages/FavoritesPage';

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'dark';
  });

  const theme = useMemo(
    () => (themeMode === 'light' ? lightTheme : darkTheme),
    [themeMode]
  );

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FavoritesProvider>
        <BrowserRouter basename="/OctopusTool">
          <Routes>
            <Route path="/" element={<MainLayout onToggleTheme={toggleTheme} />}>
              <Route index element={<Home />} />
              <Route path="favorites" element={<FavoritesPage />} />
            <Route path="tools" element={<Tools />} />
            {/* JSON 工具 */}
            <Route path="tools/json" element={<JsonTools />} />
            <Route path="tools/json/formatter" element={<JsonFormatter />} />
            <Route path="tools/json/minify" element={<JsonMinify />} />
            <Route path="tools/json/validator" element={<JsonValidator />} />
            {/* 代码格式化 */}
            <Route path="tools/dev/format" element={<CodeFormatTools />} />
            {/* 编码转换工具 */}
            <Route path="tools/encoding" element={<EncodingTools />} />
            <Route path="tools/encoding/base64" element={<Base64Tool />} />
            <Route path="tools/encoding/url" element={<UrlTool />} />
            <Route path="tools/encoding/unicode" element={<UnicodeTool />} />
            <Route path="tools/encoding/html" element={<HtmlEntityTool />} />
            {/* 加密解密工具 */}
            <Route path="tools/crypto" element={<CryptoTools />} />
            <Route path="tools/crypto/md5" element={<Md5Tool />} />
            <Route path="tools/crypto/hash" element={<HashTool />} />
            <Route path="tools/crypto/aes" element={<AesTool />} />
            <Route path="tools/crypto/rsa" element={<RsaTool />} />
            <Route path="tools/crypto/hmac" element={<HmacTool />} />
            {/* 数据处理工具 */}
            <Route path="tools/data" element={<DataTools />} />
            {/* 数据处理子分类 */}
            <Route path="tools/data/time" element={<TimeTools />} />
            <Route path="tools/data/unit" element={<UnitTools />} />
            <Route path="tools/data/regex" element={<RegexTools />} />
            <Route path="tools/data/qrcode" element={<QrcodeTools />} />
            <Route path="tools/data/dev" element={<DevTools />} />
            <Route path="tools/data/convert" element={<DataConvertTools />} />
            {/* 数据处理工具详情页 */}
            <Route path="tools/data/timestamp" element={<TimestampTool />} />
            <Route path="tools/data/regex-tester" element={<RegexTool />} />
            <Route path="tools/design/color-converter" element={<ColorTool />} />
            <Route path="tools/design/color-picker" element={<ColorPicker />} />
            <Route path="tools/design/palette-generator" element={<PaletteGenerator />} />
            <Route path="tools/design/gradient-generator" element={<GradientGenerator />} />
            <Route path="tools/design/contrast-checker" element={<ContrastChecker />} />
            <Route path="tools/design/color-swatches" element={<ColorSwatches />} />
            <Route path="tools/data/unit-converter" element={<UnitTool />} />
            <Route path="tools/data/qrbarcode" element={<QrBarcodeTool />} />
            {/* 网络工具 */}
            <Route path="tools/network" element={<NetworkTools />} />
            <Route path="tools/network/http" element={<HttpTools />} />
            <Route path="tools/network/url" element={<UrlTools />} />
            <Route path="tools/network/diagnostic" element={<DiagnosticTools />} />
            <Route path="tools/network/reference" element={<ReferenceTools />} />
            <Route path="tools/network/http-request" element={<HttpTool />} />
            <Route path="tools/network/url-parser" element={<UrlParserTool />} />
            <Route path="tools/network/ip" element={<IpTool />} />
            <Route path="tools/network/ping" element={<PingTool />} />
            <Route path="tools/network/curl" element={<CurlTool />} />
            <Route path="tools/network/ua" element={<UserAgentTool />} />
            <Route path="tools/network/status" element={<StatusCodeTool />} />
            <Route path="tools/network/port" element={<PortTool />} />
            {/* 文本处理工具 */}
            <Route path="tools/text" element={<TextTools />} />
            <Route path="tools/text/edit" element={<EditTools />} />
            <Route path="tools/text/analysis" element={<AnalysisTools />} />
            <Route path="tools/text/generate" element={<GenerateTools />} />
            <Route path="tools/text/diff" element={<DiffTool />} />
            <Route path="tools/text/case" element={<CaseTool />} />
            <Route path="tools/text/stats" element={<StatsTool />} />
            <Route path="tools/text/dedupe" element={<DedupeTool />} />
            <Route path="tools/text/password" element={<PasswordTool />} />
            <Route path="tools/text/uuid" element={<UuidTool />} />
            <Route path="tools/text/replace" element={<ReplaceTool />} />
            <Route path="tools/text/sort" element={<SortTool />} />
            <Route path="tools/text/lorem" element={<LoremTool />} />
            <Route path="tools/text/csv" element={<CsvTool />} />
            <Route path="tools/text/markdown-editor" element={<MarkdownEditor />} />
            <Route path="tools/text/emoji" element={<EmojiTool />} />
            {/* 设计工具 */}
            <Route path="tools/design/color" element={<DesignColorTools />} />
            <Route path="tools/design/css" element={<CssTools />} />
            {/* 文档工具 */}
            <Route path="tools/document/convert" element={<FileConversionTools />} />
            <Route path="tools/document/word-to-pdf" element={<WordToPdfTool />} />
            <Route path="tools/document/excel-to-pdf" element={<ExcelToPdfTool />} />
            <Route path="tools/document/ppt-to-pdf" element={<PptToPdfTool />} />
            <Route path="tools/document/pdf-to-word" element={<PdfToWordTool />} />
            <Route path="tools/document/pdf-to-excel" element={<PdfToExcelTool />} />
            <Route path="tools/document/html-to-pdf" element={<HtmlToPdfTool />} />
            {/* PDF 工具 */}
            <Route path="tools/pdf" element={<PdfTools />} />
            <Route path="tools/pdf/info" element={<PdfInfoTool />} />
            <Route path="tools/pdf/to-image" element={<PdfToImageTool />} />
            <Route path="tools/pdf/from-image" element={<ImageToPdfTool />} />
            <Route path="tools/pdf/merge" element={<PdfMergeTool />} />
            <Route path="tools/pdf/split" element={<PdfSplitTool />} />
            <Route path="tools/pdf/compress" element={<PdfCompressTool />} />
            {/* 音视频工具 */}
            <Route path="media/video" element={<VideoTools />} />
            <Route path="media/video/screenshot" element={<ScreenshotTool />} />
            <Route path="media/video/info" element={<VideoInfoTool />} />
            <Route path="media/video/frames" element={<FrameExtractTool />} />
            <Route path="media/video/gif" element={<GifMakerTool />} />
            <Route path="media/audio" element={<AudioTools />} />
            <Route path="media/audio/info" element={<AudioInfoTool />} />
            <Route path="media/audio/waveform" element={<WaveformTool />} />
            <Route path="media/audio/record" element={<RecorderTool />} />
            <Route path="media/audio/trim" element={<TrimTool />} />
            <Route path="media/image" element={<ImageTools />} />
            <Route path="media/image/compress" element={<CompressTool />} />
            <Route path="media/image/convert" element={<ConvertTool />} />
            <Route path="media/image/crop" element={<CropTool />} />
            <Route path="media/image/resize" element={<ResizeTool />} />
            <Route path="media/image/base64" element={<ImageBase64Tool />} />
            <Route path="media/image/info" element={<InfoTool />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
