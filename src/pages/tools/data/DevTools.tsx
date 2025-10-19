import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const DevTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/data/base-converter' ||
    tool.path === '/tools/data/cron-generator'
  );

  return (
    <ToolListPage
      title="开发工具"
      description="开发者常用的实用小工具"
      tools={tools}
    />
  );
};

