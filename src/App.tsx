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
import { ColorTool } from './pages/tools/data/ColorTool';
import { UnitTool } from './pages/tools/data/UnitTool';
import { QrBarcodeTool } from './pages/tools/data/QrBarcodeTool';
import { NetworkTools } from './pages/tools/NetworkTools';
import { 
  IpTool, 
  PingTool, 
  HttpTool, 
  UrlParserTool, 
  UserAgentTool, 
  StatusCodeTool, 
  PortTool,
  CurlTool 
} from './pages/tools/network';
import { TextTools } from './pages/tools/TextTools';
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
import { ThemeMode } from './types';

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
      <BrowserRouter basename="/OctopusTool">
        <Routes>
          <Route path="/" element={<MainLayout onToggleTheme={toggleTheme} />}>
            <Route index element={<Home />} />
            <Route path="tools" element={<Tools />} />
            {/* JSON 工具 */}
            <Route path="tools/json" element={<JsonTools />} />
            <Route path="tools/json/formatter" element={<JsonFormatter />} />
            <Route path="tools/json/minify" element={<JsonMinify />} />
            <Route path="tools/json/validator" element={<JsonValidator />} />
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
            <Route path="tools/data/timestamp" element={<TimestampTool />} />
            <Route path="tools/data/regex" element={<RegexTool />} />
            <Route path="tools/data/color" element={<ColorTool />} />
            <Route path="tools/data/unit" element={<UnitTool />} />
            <Route path="tools/data/qrbarcode" element={<QrBarcodeTool />} />
            {/* 网络工具 */}
            <Route path="tools/network" element={<NetworkTools />} />
            <Route path="tools/network/ip" element={<IpTool />} />
            <Route path="tools/network/ping" element={<PingTool />} />
            <Route path="tools/network/http" element={<HttpTool />} />
            <Route path="tools/network/url" element={<UrlParserTool />} />
            <Route path="tools/network/ua" element={<UserAgentTool />} />
            <Route path="tools/network/status" element={<StatusCodeTool />} />
            <Route path="tools/network/port" element={<PortTool />} />
            <Route path="tools/network/curl" element={<CurlTool />} />
            {/* 文本处理工具 */}
            <Route path="tools/text" element={<TextTools />} />
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
    </ThemeProvider>
  );
}

export default App;
