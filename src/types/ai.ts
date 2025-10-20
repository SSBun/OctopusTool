// AI 配置类型定义

export type AIProvider = 'openai' | 'azure' | 'anthropic' | 'custom';

export interface AIConfig {
  id: string;                    // 唯一标识
  name: string;                  // 配置名称
  provider: AIProvider;          // 服务提供商
  apiKey: string;                // API 密钥
  baseUrl: string;               // API 基础 URL
  model: string;                 // 模型名称
  isActive: boolean;             // 是否为激活配置
  createdAt: number;             // 创建时间戳
  updatedAt: number;             // 更新时间戳
}

export interface AIConfigFormData {
  name: string;
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}

// 默认配置模板
export const DEFAULT_CONFIGS: Record<AIProvider, Partial<AIConfigFormData>> = {
  openai: {
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  azure: {
    provider: 'azure',
    baseUrl: 'https://YOUR_RESOURCE.openai.azure.com',
    model: 'gpt-4',
  },
  anthropic: {
    provider: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-3-sonnet-20240229',
  },
  custom: {
    provider: 'custom',
    baseUrl: '',
    model: '',
  },
};

// 测试连接结果
export interface AITestResult {
  success: boolean;
  message: string;
  latency?: number; // 响应延迟（毫秒）
}

