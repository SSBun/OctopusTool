# 滚动条样式规范

## 📋 概述

本项目所有带滚动条的容器都必须应用主题适配的滚动条样式，确保视觉一致性和良好的用户体验。

---

## 🎨 标准滚动条样式

### 完整代码（复制即用）

```tsx
sx={{
  overflowY: 'auto',
  // 自定义滚动条样式（主题适配）
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: (theme) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.05)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: (theme) => theme.palette.primary.main,
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: (theme) => theme.palette.primary.dark,
    },
  },
}}
```

---

## 📐 样式参数说明

| 属性 | 值 | 说明 |
|------|-----|------|
| **滚动条宽度** | `8px` | 标准尺寸，不过宽不过窄 |
| **轨道背景** | 深色: `rgba(255,255,255,0.05)`<br>浅色: `rgba(0,0,0,0.05)` | 半透明背景，自适应主题 |
| **滑块颜色** | `theme.palette.primary.main` | 使用主题主色 |
| **悬停颜色** | `theme.palette.primary.dark` | 加深效果 |
| **圆角** | `4px` | 柔和美观 |

---

## 🔧 使用场景

### 1. 普通 Box 容器

```tsx
<Box
  sx={{
    height: 400,
    overflowY: 'auto',
    // 自定义滚动条样式（主题适配）
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: (theme) => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: (theme) => theme.palette.primary.main,
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: (theme) => theme.palette.primary.dark,
      },
    },
  }}
>
  {/* 内容 */}
</Box>
```

### 2. Dialog 弹窗

```tsx
<Dialog open={open} onClose={onClose}>
  <DialogTitle>标题</DialogTitle>
  <DialogContent
    sx={{
      // 自定义滚动条样式（主题适配）
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: (theme) => theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.05)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: (theme) => theme.palette.primary.main,
        borderRadius: '4px',
        '&:hover': {
          backgroundColor: (theme) => theme.palette.primary.dark,
        },
      },
    }}
  >
    {/* 内容 */}
  </DialogContent>
</Dialog>
```

### 3. Paper 容器

```tsx
<Paper
  sx={{
    maxHeight: 500,
    overflowY: 'auto',
    // 自定义滚动条样式（主题适配）
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: (theme) => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: (theme) => theme.palette.primary.main,
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: (theme) => theme.palette.primary.dark,
      },
    },
  }}
>
  {/* 内容 */}
</Paper>
```

### 4. 横向滚动

```tsx
<Box
  sx={{
    overflowX: 'auto',
    // 自定义滚动条样式（主题适配）
    '&::-webkit-scrollbar': {
      height: '8px', // 横向滚动条使用 height
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: (theme) => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: (theme) => theme.palette.primary.main,
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: (theme) => theme.palette.primary.dark,
      },
    },
  }}
>
  {/* 内容 */}
</Box>
```

---

## 🎯 最佳实践

### ✅ 必须应用的场景

1. **虚拟滚动容器** - EmojiGrid 等
2. **弹窗内容区** - Dialog、Modal
3. **侧边栏** - Drawer、Sidebar
4. **表格容器** - 长列表、数据表格
5. **代码编辑器** - 代码显示区域

### ❌ 不需要应用的场景

1. **整个页面滚动** - body 滚动（由浏览器控制）
2. **无滚动容器** - 固定高度且内容不溢出
3. **隐藏滚动条** - `overflow: hidden`

---

## 🔍 检查清单

在提交代码前，请检查：

- [ ] 所有 `overflowY: 'auto'` 或 `overflowX: 'auto'` 的容器
- [ ] 所有 Dialog 的 DialogContent
- [ ] 所有带滚动的 Paper、Box 容器
- [ ] 所有自定义滚动区域

---

## 📱 响应式变体（可选）

如需移动端适配更窄的滚动条：

```tsx
sx={{
  overflowY: 'auto',
  // 响应式滚动条宽度
  '&::-webkit-scrollbar': {
    width: {
      xs: '4px',  // 移动端更窄
      sm: '6px',  // 平板
      md: '8px',  // 桌面
    },
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: (theme) => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.05)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: (theme) => theme.palette.primary.main,
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: (theme) => theme.palette.primary.dark,
    },
  },
}}
```

---

## 🎨 视觉效果

### 深色模式
```
┌─────────────────────────┐
│  Content               │
│  Content          [██] │ ← 主题色滚动条
│  Content          [  ] │
│  Content          [  ] │
└─────────────────────────┘
```

### 浅色模式
```
┌─────────────────────────┐
│  Content               │
│  Content          [██] │ ← 主题色滚动条
│  Content          [  ] │
│  Content          [  ] │
└─────────────────────────┘
```

---

## 🐛 故障排除

### 问题1: 滚动条不显示
**解决**: 确保容器有固定高度和 `overflow: auto`

```tsx
sx={{
  height: 400,        // 必须有高度限制
  overflowY: 'auto', // 必须设置 overflow
  // ...滚动条样式
}}
```

### 问题2: 滚动条样式不生效
**解决**: 检查是否在正确的元素上应用样式

```tsx
// ✅ 正确 - 在滚动容器上
<Box sx={{ overflow: 'auto', '&::-webkit-scrollbar': {...} }}>

// ❌ 错误 - 在内部元素上
<Box>
  <Box sx={{ '&::-webkit-scrollbar': {...} }}>
```

### 问题3: 主题色不更新
**解决**: 使用函数形式访问 theme

```tsx
// ✅ 正确
backgroundColor: (theme) => theme.palette.primary.main

// ❌ 错误（无法动态更新）
backgroundColor: '#1976d2'
```

---

## 📚 相关资源

- [MUI sx prop 文档](https://mui.com/system/getting-started/the-sx-prop/)
- [CSS 滚动条样式](https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar)
- [MUI 主题调色板](https://mui.com/material-ui/customization/palette/)

---

## ✅ 实际应用案例

### 1. Emoji 列表网格
文件: `src/pages/tools/text/emoji/EmojiGrid.tsx`

```typescript
<Box
  ref={parentRef}
  sx={{
    height: 'calc(100vh - 400px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    // 自定义滚动条样式（主题适配）
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: (theme) => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: (theme) => theme.palette.primary.main,
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: (theme) => theme.palette.primary.dark,
      },
    },
  }}
>
  {/* 虚拟滚动内容 */}
</Box>
```

### 2. Emoji 详情弹窗
文件: `src/pages/tools/text/emoji/EmojiDetail.tsx`

```typescript
<DialogContent
  sx={{
    // 自定义滚动条样式（主题适配）
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: (theme) => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: (theme) => theme.palette.primary.main,
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: (theme) => theme.palette.primary.dark,
      },
    },
  }}
>
  {/* 弹窗内容 */}
</DialogContent>
```

---

## 🎉 总结

- ✅ **统一标准**: 8px 宽度 + 4px 圆角
- ✅ **主题适配**: 自动跟随深色/浅色模式
- ✅ **视觉一致**: 使用主题主色
- ✅ **交互反馈**: hover 加深效果
- ✅ **必须执行**: 所有滚动容器都要应用

**记住**: 每次添加滚动容器时，复制标准样式代码即可！

