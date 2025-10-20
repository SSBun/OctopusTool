import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// AI 配置接口
export interface AIConfig {
  provider: 'openai' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
}

// 默认配置
const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'openai',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
};

interface AIConfigContextType {
  config: AIConfig;
  updateConfig: (newConfig: Partial<AIConfig>) => void;
  isConfigured: boolean;
}

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'octopus-ai-config';

export const AIConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [isConfigured, setIsConfigured] = useState(false);

  // 从 localStorage 加载配置
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        setConfig(parsedConfig);
        setIsConfigured(!!parsedConfig.apiKey);
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
    }
  }, []);

  // 更新配置
  const updateConfig = (newConfig: Partial<AIConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    setIsConfigured(!!updatedConfig.apiKey);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    } catch (error) {
      console.error('Failed to save AI config:', error);
    }
  };

  return (
    <AIConfigContext.Provider value={{ config, updateConfig, isConfigured }}>
      {children}
    </AIConfigContext.Provider>
  );
};

// Hook to use AI config
export const useAIConfig = () => {
  const context = useContext(AIConfigContext);
  if (context === undefined) {
    throw new Error('useAIConfig must be used within an AIConfigProvider');
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { AIConfigContext };

