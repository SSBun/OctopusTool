# AI 配置系统架构文档

## 📋 概述

Octopus Dev Tools 的 AI 配置系统提供了统一、可扩展的架构，支持多配置管理和跨工具复用。

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    应用层 (UI Components)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │VariableNaming│  │ CodeGenerator│  │  其他AI工具  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
├────────────────────────────┼─────────────────────────────┤
│                    服务层 (Service Layer)                │
│                   ┌────────▼────────┐                    │
│                   │   AIService     │                    │
│                   │  (统一调用接口)  │                    │
│                   └────────┬────────┘                    │
│                            │                             │
├────────────────────────────┼─────────────────────────────┤
│                 上下文层 (Context Layer)                 │
│                   ┌────────▼────────┐                    │
│                   │ AIConfigContext │                    │
│                   │  (配置管理)      │                    │
│                   └────────┬────────┘                    │
│                            │                             │
├────────────────────────────┼─────────────────────────────┤
│                  存储层 (Storage Layer)                  │
│                   ┌────────▼────────┐                    │
│                   │  localStorage   │                    │
│                   │ (本地持久化)     │                    │
│                   └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

## 📁 目录结构

```
src/
├── types/
│   └── ai.ts                    # AI 类型定义
├── contexts/
│   └── AIConfigContext.tsx      # AI 配置上下文
├── services/
│   └── aiService.ts             # 统一 AI 服务
├── components/
│   ├── AIConfigForm.tsx         # 配置表单组件
│   └── SettingsDialog.tsx       # 配置管理界面
└── pages/tools/text/
    └── VariableNamingTool.tsx   # 示例工具实现
```

## 🔧 核心组件

### 1. 类型系统 (`src/types/ai.ts`)

#### AIConfig
完整的 AI 配置数据结构：

```typescript
interface AIConfig {
  id: string;           // 唯一标识（nanoid）
  name: string;         // 配置名称
  provider: AIProvider; // 服务提供商
  apiKey: string;       // API 密钥
  baseUrl: string;      // API 基础 URL
  model: string;        // 模型名称
  isActive: boolean;    // 是否激活
  createdAt: number;    // 创建时间
  updatedAt: number;    // 更新时间
}
```

#### AIProvider
支持的 AI 提供商：

```typescript
type AIProvider = 'openai' | 'azure' | 'anthropic' | 'custom';
```

### 2. 配置管理 (`src/contexts/AIConfigContext.tsx`)

提供全局配置管理的 React Context：

```typescript
interface AIConfigContextType {
  configs: AIConfig[];                              // 所有配置
  activeConfig: AIConfig | null;                    // 激活的配置
  addConfig: (formData: AIConfigFormData) => void;  // 添加配置
  updateConfig: (id: string, data: Partial) => void;// 更新配置
  deleteConfig: (id: string) => void;               // 删除配置
  setActiveConfig: (id: string) => void;            // 设置激活
  getConfigById: (id: string) => AIConfig;          // 获取配置
  isConfigured: boolean;                            // 是否已配置
}
```

**使用方式：**

```typescript
import { useAIConfig } from '@/contexts/AIConfigContext';

const MyComponent = () => {
  const { activeConfig, isConfigured, configs } = useAIConfig();
  
  // 检查是否已配置
  if (!isConfigured) {
    return <div>请先配置 AI</div>;
  }
  
  // 使用激活的配置...
};
```

### 3. AI 服务 (`src/services/aiService.ts`)

统一的 AI 调用服务类：

#### AIService 类

```typescript
class AIService {
  constructor(config: AIConfig)
  
  // 测试连接
  testConnection(): Promise<AITestResult>
  
  // 生成文本
  generateText(prompt: string, options?: {...}): Promise<string>
  
  // 生成结构化对象（推荐）
  generateObject<T>(prompt: string, schema: ZodType): Promise<T>
  
  // 流式生成
  streamText(prompt: string, options?: {...}): Promise<Stream>
  
  // 批量生成
  generateMultiple<T>(prompts: string[], schema: ZodType): Promise<T[]>
}
```

#### 工厂函数

```typescript
// 使用指定配置创建服务
createAIService(config: AIConfig): AIService

// 使用激活配置创建服务（推荐）
createActiveAIService(activeConfig: AIConfig | null): AIService | null
```

## 📖 使用指南

### 基础用法示例

```typescript
import React, { useState } from 'react';
import { useAIConfig } from '@/contexts/AIConfigContext';
import { createActiveAIService } from '@/services/aiService';
import { z } from 'zod';

// 1. 定义响应 schema
const responseSchema = z.object({
  result: z.string(),
  confidence: z.number(),
});

export const MyAITool = () => {
  const { activeConfig, isConfigured } = useAIConfig();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async (prompt: string) => {
    // 2. 创建 AI 服务实例
    const aiService = createActiveAIService(activeConfig);
    if (!aiService) {
      alert('请先配置 AI');
      return;
    }

    setLoading(true);
    try {
      // 3. 调用 AI 服务
      const data = await aiService.generateObject(prompt, responseSchema);
      setResult(data);
    } catch (error) {
      console.error('AI 调用失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* UI 实现... */}
    </div>
  );
};
```

### 高级用法：流式生成

```typescript
const handleStream = async (prompt: string) => {
  const aiService = createActiveAIService(activeConfig);
  if (!aiService) return;

  const stream = await aiService.streamText(prompt, {
    onChunk: (chunk) => {
      // 逐块处理返回的文本
      setContent(prev => prev + chunk);
    },
  });
};
```

### 多配置管理示例

```typescript
const ToolWithConfigSelector = () => {
  const { configs, activeConfig, setActiveConfig } = useAIConfig();
  const [selectedConfigId, setSelectedConfigId] = useState(activeConfig?.id);

  const handleConfigChange = (configId: string) => {
    setSelectedConfigId(configId);
    setActiveConfig(configId);
  };

  return (
    <Select value={selectedConfigId} onChange={(e) => handleConfigChange(e.target.value)}>
      {configs.map(config => (
        <MenuItem key={config.id} value={config.id}>
          {config.name} ({config.provider})
        </MenuItem>
      ))}
    </Select>
  );
};
```

## 🎨 UI 组件

### AIConfigForm

配置表单组件，用于添加/编辑配置：

```typescript
<AIConfigForm
  initialData={existingConfig}  // 可选：编辑时传入
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  submitLabel="保存"             // 可选：按钮文字
/>
```

**功能：**
- ✅ 自动根据提供商设置默认值
- ✅ API Key 显示/隐藏切换
- ✅ 测试连接功能
- ✅ 实时表单验证

### SettingsDialog

配置管理主界面：

```typescript
<SettingsDialog
  open={open}
  onClose={handleClose}
/>
```

**功能：**
- ✅ 配置列表展示
- ✅ 添加新配置
- ✅ 编辑现有配置
- ✅ 删除配置（带确认）
- ✅ 切换激活配置
- ✅ 配置状态显示

## 🔐 安全性

### 数据存储
- 所有配置存储在浏览器的 `localStorage`
- API Key 不会上传到服务器
- 仅在客户端直接调用 AI API

### 最佳实践
1. 定期轮换 API Key
2. 为不同环境创建不同配置
3. 不要在代码中硬编码 API Key
4. 使用环境变量管理测试配置

## 🚀 扩展新工具

### 步骤 1: 引入依赖

```typescript
import { useAIConfig } from '@/contexts/AIConfigContext';
import { createActiveAIService } from '@/services/aiService';
import { z } from 'zod';
```

### 步骤 2: 定义 Schema

```typescript
const mySchema = z.object({
  // 定义你期望的响应结构
  data: z.array(z.string()),
  metadata: z.object({
    count: z.number(),
  }),
});
```

### 步骤 3: 调用服务

```typescript
const { activeConfig, isConfigured } = useAIConfig();

const generateData = async () => {
  const aiService = createActiveAIService(activeConfig);
  if (!aiService) {
    // 提示用户配置
    return;
  }

  const result = await aiService.generateObject(
    "your prompt here",
    mySchema
  );
  
  // 使用结果...
};
```

## 📊 配置示例

### OpenAI
```json
{
  "name": "OpenAI GPT-4",
  "provider": "openai",
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-...",
  "model": "gpt-4o-mini"
}
```

### Azure OpenAI
```json
{
  "name": "Azure OpenAI",
  "provider": "azure",
  "baseUrl": "https://YOUR_RESOURCE.openai.azure.com",
  "apiKey": "your-azure-key",
  "model": "gpt-4"
}
```

### 自定义 (OpenAI 兼容)
```json
{
  "name": "本地模型",
  "provider": "custom",
  "baseUrl": "http://localhost:11434/v1",
  "apiKey": "dummy",
  "model": "llama2"
}
```

## ⚠️ 注意事项

1. **配置验证**
   - 添加配置后建议先测试连接
   - 确保 API Key 有效且有足够额度

2. **错误处理**
   - 始终使用 try-catch 包裹 AI 调用
   - 提供友好的错误提示

3. **性能优化**
   - 避免频繁创建 AIService 实例
   - 考虑缓存生成结果
   - 使用流式生成改善用户体验

4. **成本控制**
   - 显示 token 使用情况
   - 设置最大 token 限制
   - 提供本地模型选项

## 🔄 迁移指南

### 从旧版本迁移

如果你的工具使用旧的 AI 配置系统：

**之前：**
```typescript
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';

const { object } = await generateObject({
  model: openai(config.model, {
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
  }),
  schema,
  prompt,
});
```

**现在：**
```typescript
import { createActiveAIService } from '@/services/aiService';

const aiService = createActiveAIService(activeConfig);
const result = await aiService.generateObject(prompt, schema);
```

## 📝 总结

- ✅ **统一接口**：所有 AI 工具使用相同的服务层
- ✅ **多配置支持**：灵活切换不同的 AI 提供商和模型
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **易于扩展**：添加新工具只需几行代码
- ✅ **本地优先**：所有配置安全存储在本地

## 🤝 贡献

如果你需要添加新的 AI 提供商支持或改进现有功能，请参考：
- `src/types/ai.ts` - 添加新的提供商类型
- `src/services/aiService.ts` - 实现提供商特定逻辑
- `DEFAULT_CONFIGS` - 添加默认配置模板

