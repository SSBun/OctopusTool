// 工具分类类型
export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  path: string;
}

// 工具项类型
export interface Tool {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  path: string;
}

// 主题模式类型
export type ThemeMode = 'light' | 'dark';

// 导航菜单项类型
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}
