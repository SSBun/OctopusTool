import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const TimeTools: React.FC = () => {
  // 时间日期工具基于路径过滤
  const tools = ALL_TOOLS.filter((tool) => tool.path.startsWith('/tools/data/timestamp'));

  return (
    <ToolListPage
      title="时间日期工具"
      description="处理时间戳和日期时间的实用工具"
      tools={tools}
    />
  );
};
