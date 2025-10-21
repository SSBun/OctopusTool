/**
 * 统一的 AI 服务工具类
 * 提供可复用的 AI 调用接口，支持多配置切换
 */

import { AIConfig, AITestResult } from '../types/ai';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod';

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * 获取配置的 AI 提供商实例
   */
  private getProvider() {
    // 如果是自定义或非默认 base URL，创建自定义客户端
    if (this.config.provider === 'custom' || this.config.baseUrl !== 'https://api.openai.com/v1') {
      return createOpenAI({
        baseURL: this.config.baseUrl,
        apiKey: this.config.apiKey,
      });
    }
    
    // 默认使用 OpenAI
    return openai;
  }

  /**
   * 获取模型实例
   */
  private getModel() {
    const provider = this.getProvider();
    return provider(this.config.model);
  }

  /**
   * 测试配置连接
   */
  async testConnection(): Promise<AITestResult> {
    const startTime = Date.now();
    
    try {
      const model = this.getModel();
      
      // 发送一个简单的测试请求
      await generateText({
        model,
        prompt: 'Hello',
      });

      const latency = Date.now() - startTime;

      return {
        success: true,
        message: `连接成功！延迟：${latency}ms`,
        latency,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败',
      };
    }
  }

  /**
   * 生成文本
   */
  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }) {
    const model = this.getModel();
    
    return generateText({
      model,
      prompt,
      temperature: options?.temperature,
    });
  }

  /**
   * 生成结构化对象
   */
  async generateObject<T extends z.ZodType>(
    prompt: string,
    schema: T,
    options?: {
      temperature?: number;
    }
  ): Promise<z.infer<T>> {
    const model = this.getModel();
    
    const result = await generateObject({
      model,
      schema,
      prompt,
      temperature: options?.temperature,
    });

    return result.object as z.infer<T>;
  }

  /**
   * 流式生成文本
   */
  async streamText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    onChunk?: (chunk: string) => void;
  }) {
    const model = this.getModel();
    
    const stream = await streamText({
      model,
      prompt,
      temperature: options?.temperature,
    });

    // 如果提供了 onChunk 回调，逐块处理
    if (options?.onChunk) {
      for await (const chunk of stream.textStream) {
        options.onChunk(chunk);
      }
    }

    return stream;
  }

  /**
   * 批量生成（用于生成多个候选答案）
   */
  async generateMultiple<T extends z.ZodType>(
    prompts: string[],
    schema: T,
    options?: {
      temperature?: number;
    }
  ): Promise<z.infer<T>[]> {
    const results = await Promise.all(
      prompts.map(prompt => this.generateObject(prompt, schema, options))
    );
    return results;
  }

  /**
   * 获取当前配置信息
   */
  getConfig(): AIConfig {
    return this.config;
  }

  /**
   * 更新配置（通常不建议运行时修改，应该创建新实例）
   */
  updateConfig(config: AIConfig) {
    this.config = config;
  }
}

/**
 * 工厂函数：根据配置创建 AI 服务实例
 */
export function createAIService(config: AIConfig): AIService {
  return new AIService(config);
}

/**
 * 工厂函数：使用激活的配置创建 AI 服务实例
 */
export function createActiveAIService(activeConfig: AIConfig | null): AIService | null {
  if (!activeConfig) {
    return null;
  }
  return new AIService(activeConfig);
}

