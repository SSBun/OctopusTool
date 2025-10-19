import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const CodeFormatTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '代码格式化');

  return (
    <ToolListPage
      title="代码格式化"
      description="SQL、XML、YAML、JavaScript/CSS/HTML 等代码格式化和美化工具"
      tools={tools}
    />
  );
};

