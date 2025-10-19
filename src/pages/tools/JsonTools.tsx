import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const JsonTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === 'JSON 工具');

  return (
    <ToolListPage
      title="JSON 工具"
      description="处理和操作 JSON 数据的实用工具"
      tools={tools}
    />
  );
};
