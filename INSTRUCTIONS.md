# 开发者工具聚合网站 - 开发规范

## 项目概述

这是一个基于现代 Web 技术栈构建的开发者工具聚合网站，旨在为开发者提供一站式的常用工具集合。

## 技术栈

### 核心技术
- **构建工具**: Vite 5.x - 快速的开发构建工具
- **前端框架**: React 18.x - 声明式 UI 库
- **编程语言**: TypeScript 5.x - 类型安全的 JavaScript 超集
- **UI 框架**: Material-UI (MUI) 5.x - React 组件库
- **路由管理**: React Router 6.x - 客户端路由
- **样式方案**: Emotion (MUI 默认) - CSS-in-JS 解决方案

### 开发工具
- **代码检查**: ESLint - JavaScript/TypeScript 代码检查
- **代码格式化**: Prettier - 代码格式化工具
- **版本控制**: Git
- **包管理器**: npm

## 项目结构

```
Octopus/
├── public/                 # 静态资源
│   └── vite.svg
├── src/
│   ├── components/        # 可复用组件
│   │   ├── common/       # 通用组件（按钮、输入框等）
│   │   └── tools/        # 工具相关组件
│   ├── layouts/          # 布局组件
│   │   ├── MainLayout.tsx    # 主布局
│   │   └── Header.tsx        # 头部导航
│   ├── pages/            # 页面组件
│   │   ├── Home.tsx          # 首页
│   │   └── NotFound.tsx      # 404 页面
│   ├── theme/            # MUI 主题配置
│   │   └── theme.ts          # 主题定义
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts          # 通用类型
│   ├── utils/            # 工具函数
│   │   └── helpers.ts        # 辅助函数
│   ├── App.tsx           # 应用根组件
│   ├── main.tsx          # 应用入口
│   └── vite-env.d.ts     # Vite 类型声明
├── .gitignore            # Git 忽略文件
├── .eslintrc.cjs         # ESLint 配置
├── .prettierrc           # Prettier 配置
├── index.html            # HTML 入口
├── package.json          # 项目依赖配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── README.md             # 项目说明
```

## 代码规范

### TypeScript 规范

1. **类型优先**: 优先使用 TypeScript 类型，避免使用 `any`
2. **接口定义**: 对象类型使用 `interface`，联合类型使用 `type`
3. **命名约定**:
   - 接口/类型: PascalCase (如 `UserProfile`, `ToolCategory`)
   - 变量/函数: camelCase (如 `userName`, `getUserData`)
   - 常量: UPPER_SNAKE_CASE (如 `MAX_LENGTH`, `API_URL`)
   - 组件: PascalCase (如 `ToolCard`, `MainLayout`)

### React 组件规范

1. **函数组件**: 统一使用函数组件，不使用类组件
2. **组件结构**:
   ```tsx
   // 导入依赖
   import React from 'react';
   import { Box, Typography } from '@mui/material';
   
   // 类型定义
   interface ComponentProps {
     title: string;
     onAction?: () => void;
   }
   
   // 组件定义
   export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
     // hooks
     const [state, setState] = React.useState(false);
     
     // 事件处理函数
     const handleClick = () => {
       setState(true);
       onAction?.();
     };
     
     // 渲染
     return (
       <Box>
         <Typography>{title}</Typography>
       </Box>
     );
   };
   ```

3. **Hooks 使用顺序**:
   - useState
   - useEffect
   - useContext
   - 自定义 hooks
   - useCallback/useMemo

4. **Props 解构**: 在函数参数中直接解构 props

### MUI 样式规范

1. **优先使用 sx prop**: 简单样式使用 MUI 的 `sx` 属性
   ```tsx
   <Box sx={{ mt: 2, p: 3, bgcolor: 'background.paper' }}>
     Content
   </Box>
   ```

2. **styled 组件**: 复杂或复用的样式使用 `styled` API
   ```tsx
   import { styled } from '@mui/material/styles';
   
   const StyledBox = styled(Box)(({ theme }) => ({
     padding: theme.spacing(2),
     backgroundColor: theme.palette.background.paper,
   }));
   ```

3. **主题使用**: 始终使用主题变量而非硬编码值
   - 颜色: `theme.palette.primary.main`
   - 间距: `theme.spacing(2)`
   - 断点: `theme.breakpoints.up('md')`

### 文件命名规范

- 组件文件: PascalCase (如 `ToolCard.tsx`)
- 工具函数: camelCase (如 `formatDate.ts`)
- 类型定义: camelCase (如 `types.ts` 或与组件同名)
- 常量文件: camelCase (如 `constants.ts`)

## 开发流程

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 类型检查

```bash
npm run type-check  # 需要在 package.json 中添加此脚本
```

## Git 提交规范

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构（既不是新功能也不是 bug 修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD 相关

### 示例

```bash
feat(tools): 添加 JSON 格式化工具

- 实现 JSON 输入和格式化输出
- 添加语法高亮显示
- 支持压缩和美化切换

Closes #123
```

## GitHub Pages 部署

### 自动部署

项目配置了 GitHub Actions 自动部署流程：
1. 推送到 `main` 分支触发构建
2. 自动构建并部署到 `gh-pages` 分支
3. 访问 `https://<username>.github.io/Octopus/`

### 手动部署

```bash
npm run deploy
```

### 配置要点

1. `vite.config.ts` 中设置 `base: '/Octopus/'`（仓库名）
2. `package.json` 中添加 homepage 字段
3. 确保 GitHub 仓库设置中启用了 GitHub Pages

## 最佳实践

### 性能优化

1. **代码分割**: 使用 React.lazy 和 Suspense 进行路由级别的代码分割
   ```tsx
   const Home = React.lazy(() => import('./pages/Home'));
   ```

2. **图片优化**: 使用适当的图片格式和大小
3. **Tree Shaking**: Vite 自动支持，确保正确导入 MUI 组件

### 可访问性 (a11y)

1. 使用语义化 HTML 标签
2. 添加适当的 ARIA 属性
3. 确保键盘导航可用
4. 保持足够的颜色对比度

### 状态管理

1. **局部状态**: 使用 useState
2. **跨组件状态**: 使用 Context API
3. **复杂状态**: 考虑引入 Zustand 或 Redux Toolkit

### 错误处理

1. 使用 Error Boundary 捕获组件错误
2. 网络请求使用 try-catch
3. 提供友好的错误提示

## 组件复用架构

### 核心可复用组件

项目采用高度可复用的组件设计：

1. **ToolCard** (`src/components/ToolCard.tsx`)
   - 统一的工具卡片UI，包含收藏功能
   - 自动处理可用/不可用状态
   - 统一样式和动画

2. **ToolListPage** (`src/components/ToolListPage.tsx`)
   - 统一的工具列表页面布局
   - 响应式网格布局
   - 自动使用 ToolCard 渲染

3. **FavoriteButton** (`src/components/FavoriteButton.tsx`)
   - 详情页收藏按钮
   - 支持不同尺寸

4. **FavoritesContext** (`src/contexts/FavoritesContext.tsx`)
   - 全局收藏状态管理
   - localStorage 持久化

### 工具数据管理

**集中式数据管理** (`src/data/allTools.tsx`)
- 所有工具的配置信息集中管理
- 统一的 Tool 类型定义
- 便于维护和更新

**Tool 类型定义** (`src/types/tool.ts`)
```tsx
interface Tool {
  icon: ReactElement;
  title: string;
  description: string;
  path: string;
  status: '可用' | '即将推出' | '开发中' | '计划中';
  category?: string;
}
```

## 添加新工具的流程（简化版）

### 1. 在 allTools.tsx 添加工具配置

```tsx
// src/data/allTools.tsx
{
  icon: <NewIcon sx={{ fontSize: 40 }} />,
  title: '新工具名称',
  description: '工具描述',
  path: '/tools/category/new-tool',
  status: '可用',
  category: '工具分类',
}
```

### 2. 创建工具详情页

```tsx
// src/pages/tools/category/NewTool.tsx
import { FavoriteButton } from '../../../components/FavoriteButton';

export const NewTool: React.FC = () => (
  <Container maxWidth="xl">
    <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 4 }}>
      <Box>
        <Typography variant="h4">新工具</Typography>
        <Typography color="text.secondary">描述</Typography>
      </Box>
      <FavoriteButton toolPath="/tools/category/new-tool" />
    </Box>
    {/* 工具功能实现 */}
  </Container>
);
```

### 3. 添加路由

```tsx
// src/App.tsx
<Route path="tools/category/new-tool" element={<NewTool />} />
```

### 4. （可选）创建或更新分类页面

使用 ToolListPage 组件：

```tsx
// src/pages/tools/CategoryTools.tsx
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const CategoryTools: React.FC = () => {
  const tools = ALL_TOOLS.filter(tool => tool.category === '工具分类');
  
  return (
    <ToolListPage
      title="工具分类"
      description="分类描述"
      tools={tools}
    />
  );
};
```

**优势**: 
- 列表页和收藏功能自动生效
- 无需手动实现卡片UI
- 修改卡片样式只需改 ToolCard.tsx 一处

## 注意事项

1. **不要直接修改 node_modules**
2. **提交前运行 lint 检查**
3. **保持组件的单一职责**
4. **避免过度优化，保持代码可读性**
5. **及时更新依赖版本**（注意破坏性更新）
6. **敏感信息不要提交到代码库**

## 资源链接

- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [MUI 文档](https://mui.com/)
- [React Router 文档](https://reactrouter.com/)

## 更新日志

- 2025-10-17: 初始化项目，创建开发规范文档

