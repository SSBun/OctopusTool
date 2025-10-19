import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const TextTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '文本处理');

  return (
    <ToolListPage
      title="文本处理"
      description="文本处理、分析和转换工具集合"
      tools={tools}
    />
  );
};
