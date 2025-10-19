# 🐙 Octopus Dev Tools

一个基于 React + TypeScript + Material-UI 的开发者工具聚合网站。

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

- 🌓 **深色/浅色主题切换** - Material Design Dashboard 风格，点击顶部栏右侧图标切换
- 📱 **响应式设计** - 完美支持移动端和桌面端
- 🚀 **快速的开发体验** - Vite 驱动，毫秒级热更新
- 🔒 **本地运行，保护隐私** - 所有工具在浏览器本地运行
- 🎯 **TypeScript 类型安全** - 全面的类型检查
- ✨ **现代化 UI** - 流畅的动画效果和优雅的卡片设计

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

