import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const HttpTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/network/http-request' || tool.path === '/tools/network/curl'
  );

  return (
    <ToolListPage
      title="HTTP 工具"
      description="HTTP 请求测试和 cURL 命令工具"
      tools={tools}
    />
  );
};
