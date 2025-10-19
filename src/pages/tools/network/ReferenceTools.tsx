import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const ReferenceTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/network/status' ||
    tool.path === '/tools/network/ua'
  );

  return (
    <ToolListPage
      title="网络参考工具"
      description="HTTP 状态码和 User Agent 解析"
      tools={tools}
    />
  );
};
