# Octopus 网站图标说明

## 图标文件

### 1. favicon.svg (32x32)
- **位置**: `/public/favicon.svg`
- **用途**: 浏览器标签页图标（favicon）
- **特点**: 简化版章鱼图标，适合小尺寸显示

### 2. octopus.svg (100x100)
- **位置**: `/public/octopus.svg`
- **用途**: 
  - Apple Touch Icon（添加到主屏幕）
  - 高分辨率显示
  - 品牌展示
- **特点**: 完整版章鱼图标，带有工具元素

## 设计理念

### 🐙 章鱼（Octopus）
- **8条触手**: 象征多功能工具集合
- **紫色渐变**: 科技感、专业性
- **工具元素**: 触手持有扳手，体现"开发工具"定位

### 🎨 颜色方案
- **主色**: `#667eea` → `#764ba2` (紫色渐变)
- **辅色**: `#f093fb` → `#f5576c` (粉红色渐变，用于工具元素)
- **主题色**: `#667eea` (浏览器主题色)

## HTML 配置

```html
<!-- 标准 favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<!-- Apple 设备图标 -->
<link rel="apple-touch-icon" sizes="180x180" href="/octopus.svg" />

<!-- 浏览器主题色 -->
<meta name="theme-color" content="#667eea" />
```

## 如何更新图标

### 修改 SVG 图标
1. 编辑 `public/favicon.svg` 或 `public/octopus.svg`
2. 保持 viewBox 比例不变
3. 使用渐变色保持品牌一致性

### 添加其他格式图标

如需添加 PNG 或 ICO 格式：

```bash
# 使用在线工具或 ImageMagick 转换
# https://realfavicongenerator.net/

# 或使用命令行（需要安装 ImageMagick）
convert octopus.svg -resize 32x32 favicon-32x32.png
convert octopus.svg -resize 16x16 favicon-16x16.ico
```

### PWA 图标配置

如果需要 PWA 支持，可添加 `manifest.json`：

```json
{
  "name": "Octopus - 开发者工具",
  "short_name": "Octopus",
  "icons": [
    {
      "src": "/octopus.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ],
  "theme_color": "#667eea",
  "background_color": "#ffffff"
}
```

## 浏览器兼容性

- ✅ Chrome/Edge: 完美支持 SVG favicon
- ✅ Firefox: 完美支持 SVG favicon
- ✅ Safari: 完美支持 SVG favicon
- ✅ iOS Safari: 使用 apple-touch-icon
- ⚠️ IE11: 不支持 SVG，建议添加 `.ico` 格式作为回退

## 测试图标

### 开发环境
```bash
npm run dev
```
访问 `http://localhost:5173`，检查浏览器标签页图标

### 生产环境
```bash
npm run build
npm run preview
```

### 清除缓存
如果图标没有更新，尝试：
1. 硬刷新：`Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows)
2. 清除浏览器缓存
3. 无痕模式测试

## 相关文件

- `public/favicon.svg` - 小尺寸图标
- `public/octopus.svg` - 完整图标
- `index.html` - HTML 配置
- `docs/ICON_GUIDE.md` - 本文档

