import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const RegexTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/data/regex-tester'
  );

  return (
    <ToolListPage
      title="正则表达式工具"
      description="在线测试和调试正则表达式"
      tools={tools}
    />
  );
};
