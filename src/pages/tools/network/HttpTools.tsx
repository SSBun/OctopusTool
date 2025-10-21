import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const HttpTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/network/http-request' || 
    tool.path === '/tools/network/curl' ||
    tool.path === '/tools/network/mqtt'
  );

  return (
    <ToolListPage
      title="请求测试"
      description="HTTP、MQTT 等协议的请求测试和调试工具"
      tools={tools}
    />
  );
};
