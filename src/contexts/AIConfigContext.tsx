import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIConfig, AIConfigFormData } from '../types/ai';
import { nanoid } from 'nanoid';

interface AIConfigContextType {
  configs: AIConfig[];
  activeConfig: AIConfig | null;
  addConfig: (formData: AIConfigFormData) => AIConfig;
  updateConfig: (id: string, formData: Partial<AIConfigFormData>) => void;
  deleteConfig: (id: string) => void;
  setActiveConfig: (id: string) => void;
  getConfigById: (id: string) => AIConfig | undefined;
  isConfigured: boolean;
}

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'octopus-ai-configs';

export const AIConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [activeConfig, setActiveConfigState] = useState<AIConfig | null>(null);

  // 从 localStorage 加载配置
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConfigs: AIConfig[] = JSON.parse(stored);
        setConfigs(parsedConfigs);
        
        // 设置激活的配置
        const active = parsedConfigs.find(c => c.isActive);
        setActiveConfigState(active || null);
      }
    } catch (error) {
      console.error('Failed to load AI configs:', error);
    }
  }, []);

  // 保存配置到 localStorage
  const saveConfigs = (newConfigs: AIConfig[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfigs));
      setConfigs(newConfigs);
      
      // 更新激活配置
      const active = newConfigs.find(c => c.isActive);
      setActiveConfigState(active || null);
    } catch (error) {
      console.error('Failed to save AI configs:', error);
    }
  };

  // 添加新配置
  const addConfig = (formData: AIConfigFormData): AIConfig => {
    const now = Date.now();
    const newConfig: AIConfig = {
      id: nanoid(),
      ...formData,
      isActive: configs.length === 0, // 第一个配置自动激活
      createdAt: now,
      updatedAt: now,
    };

    const newConfigs = [...configs, newConfig];
    saveConfigs(newConfigs);
    return newConfig;
  };

  // 更新配置
  const updateConfig = (id: string, formData: Partial<AIConfigFormData>) => {
    const newConfigs = configs.map(config =>
      config.id === id
        ? { ...config, ...formData, updatedAt: Date.now() }
        : config
    );
    saveConfigs(newConfigs);
  };

  // 删除配置
  const deleteConfig = (id: string) => {
    const config = configs.find(c => c.id === id);
    if (!config) return;

    let newConfigs = configs.filter(c => c.id !== id);
    
    // 如果删除的是激活配置，激活第一个配置
    if (config.isActive && newConfigs.length > 0) {
      newConfigs = newConfigs.map((c, index) => ({
        ...c,
        isActive: index === 0,
      }));
    }
    
    saveConfigs(newConfigs);
  };

  // 设置激活配置
  const setActiveConfig = (id: string) => {
    const newConfigs = configs.map(config => ({
      ...config,
      isActive: config.id === id,
    }));
    saveConfigs(newConfigs);
  };

  // 根据 ID 获取配置
  const getConfigById = (id: string) => {
    return configs.find(c => c.id === id);
  };

  const isConfigured = configs.length > 0 && activeConfig !== null;

  return (
    <AIConfigContext.Provider
      value={{
        configs,
        activeConfig,
        addConfig,
        updateConfig,
        deleteConfig,
        setActiveConfig,
        getConfigById,
        isConfigured,
      }}
    >
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
