import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const EncodingTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '编码转换');

  return (
    <ToolListPage
      title="编码转换"
      description="各种编码格式的相互转换"
      tools={tools}
    />
  );
};
