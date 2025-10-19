import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const UnitTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/data/unit-converter'
  );

  return (
    <ToolListPage
      title="单位转换工具"
      description="长度、重量、温度等单位转换"
      tools={tools}
    />
  );
};
