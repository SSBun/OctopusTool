import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const DiagnosticTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/network/ip' ||
    tool.path === '/tools/network/ping' ||
    tool.path === '/tools/network/port'
  );

  return (
    <ToolListPage
      title="网络诊断工具"
      description="IP 查询、Ping 测试和端口检查"
      tools={tools}
    />
  );
};
