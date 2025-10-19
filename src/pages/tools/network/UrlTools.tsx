import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const UrlTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.path === '/tools/network/url-parser');

  return (
    <ToolListPage
      title="URL 工具"
      description="解析 URL 各个组成部分和参数"
      tools={tools}
    />
  );
};
