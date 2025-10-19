# 🐙 Octopus Dev Tools

[![Deploy to GitHub Pages](https://github.com/SSBun/OctopusTool/actions/workflows/deploy.yml/badge.svg)](https://github.com/SSBun/OctopusTool/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

一个基于 React + TypeScript + Material-UI 的开发者工具聚合网站。

**🌐 在线访问：[https://ssbun.github.io/OctopusTool/](https://ssbun.github.io/OctopusTool/)**

## 技术栈

- ⚡️ **Vite** - 下一代前端构建工具
- ⚛️ **React 18** - 用户界面库
- 🔷 **TypeScript** - 类型安全的 JavaScript
- 🎨 **Material-UI** - React 组件库
- 🔀 **React Router** - 路由管理
- 💅 **Emotion** - CSS-in-JS

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)

### 构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 项目结构

```
Octopus/
├── public/              # 静态资源
├── src/
│   ├── components/      # 可复用组件
│   ├── layouts/         # 布局组件
│   ├── pages/           # 页面组件
│   ├── theme/           # MUI 主题配置
│   ├── types/           # TypeScript 类型
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 应用根组件
│   └── main.tsx         # 应用入口
├── index.html           # HTML 入口
├── vite.config.ts       # Vite 配置
└── tsconfig.json        # TypeScript 配置
```

## 功能特性

- 🌓 **深色/浅色主题切换** - Material Design Dashboard 风格
- 📱 **响应式设计** - 完美支持移动端和桌面端
- 🔍 **全局搜索** - Cmd/Ctrl + K 快捷键快速查找工具
- 🚀 **快速的开发体验** - Vite 驱动，毫秒级热更新
- 🔒 **本地运行，保护隐私** - 所有工具在浏览器本地运行
- 🎯 **TypeScript 类型安全** - 全面的类型检查
- ✨ **现代化 UI** - 流畅的动画效果和优雅的卡片设计

## 🛠️ 工具列表

### 开发工具

#### 📋 JSON 工具
- JSON 格式化 - 美化 JSON，支持语法高亮
- JSON 压缩 - 移除空格和换行
- JSON 验证 - 检查 JSON 语法并显示详细信息

#### 🔤 编码转换
- Base64 编解码 - 文本与 Base64 互转
- URL 编解码 - URL 安全字符转换
- Unicode 转换 - Unicode 与文本互转
- HTML 实体 - HTML 特殊字符编解码

#### 🔐 加密工具
- MD5 加密 - MD5 哈希生成
- SHA 加密 - SHA-1/256/384/512
- AES 加解密 - 专业级对称加密
- RSA 加解密 - 非对称加密，支持密钥生成
- HMAC 签名 - 消息认证码生成与验证

#### 📊 数据处理
- 时间戳转换 - Unix 时间戳与日期互转
- 正则表达式 - 正则测试与匹配
- 颜色转换 - HEX/RGB/HSL 互转
- 单位转换 - 常用单位换算
- 二维码/条形码 - 生成与解析

#### 🌐 网络工具
- IP 地址查询 - 查看 IP 详细信息
- Ping 测试 - 测试网站连通性
- HTTP 请求 - 发送自定义 HTTP 请求
- URL 解析 - 解析 URL 各部分
- User Agent 解析 - 浏览器信息识别
- HTTP 状态码 - 状态码查询
- 端口检测 - 检查端口开放状态
- Curl 命令 - 生成和执行 curl 命令

#### 📝 文本处理
- 文本对比 - 高亮显示差异
- 大小写转换 - 多种格式转换
- 文本统计 - 字数、行数统计
- 去重工具 - 删除重复行
- 密码生成器 - 安全密码生成
- UUID 生成器 - 批量生成 UUID
- 查找替换 - 支持正则表达式
- 文本排序 - 多种排序方式
- Lorem Ipsum - 占位文本生成
- CSV 转换 - CSV 与 JSON 互转

### 音视频工具

#### 🎬 视频处理
- 视频截图 - 从视频提取任意帧
- 视频信息 - 查看分辨率、时长等
- 帧提取 - 批量提取关键帧
- GIF 制作 - 视频片段转 GIF

#### 🎵 音频处理
- 音频信息 - 查看音频详细信息
- 波形可视化 - 实时波形和频谱分析
- 音频录制 - 麦克风录音
- 音频裁剪 - 裁剪音频片段

#### 🖼️ 图片处理
- 图片压缩 - 自定义质量压缩
- 格式转换 - JPG/PNG/WebP 互转
- 图片裁剪 - 自定义尺寸裁剪
- 图片缩放 - 调整图片大小
- Base64 转换 - 图片与 Base64 互转
- 图片信息 - 查看图片详细信息

## 部署

本项目配置了 GitHub Pages 部署：

### 方式一：手动部署

```bash
npm run deploy
```

### 方式二：GitHub Actions（推荐）

推送到 `main` 分支会自动触发部署。

## 开发指南

请查看 [INSTRUCTIONS.md](./INSTRUCTIONS.md) 了解详细的开发规范和最佳实践。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

Made with ❤️ by Octopus Team

