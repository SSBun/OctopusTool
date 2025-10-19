import { ReactElement } from 'react';

export interface Tool {
  icon: ReactElement;
  title: string;
  description: string;
  path: string;
  status: '可用' | '即将推出' | '开发中' | '计划中';
  category?: string;
}

export interface ToolCategory {
  title: string;
  description: string;
  tools: Tool[];
}

