import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const NetworkTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '网络工具');

  return (
    <ToolListPage
      title="网络工具"
      description="网络测试、诊断和查询工具集合"
      tools={tools}
    />
  );
};
