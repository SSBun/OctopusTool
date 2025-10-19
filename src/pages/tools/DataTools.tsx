import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const DataTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '数据处理');

  return (
    <ToolListPage
      title="数据处理"
      description="数据处理和转换工具集合"
      tools={tools}
    />
  );
};
