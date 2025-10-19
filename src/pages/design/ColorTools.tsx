import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const ColorTools: React.FC = () => {
  // 筛选所有设计工具分类中的颜色相关工具
  const tools = ALL_TOOLS.filter((tool) => 
    tool.category === '设计工具' && (
      tool.path.includes('/color') || 
      tool.path.includes('/gradient') ||
      tool.path.includes('/palette') ||
      tool.path.includes('/contrast') ||
      tool.path.includes('/swatch')
    )
  );

  return (
    <ToolListPage
      title="颜色工具"
      description="颜色选择、转换、调色板生成、渐变、对比度检查等工具"
      tools={tools}
    />
  );
};

