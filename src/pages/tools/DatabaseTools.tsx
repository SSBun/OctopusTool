import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const DatabaseTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '数据库工具');

  return (
    <ToolListPage
      title="数据库工具"
      description="SQL 格式化、AI SQL 生成、数据库设计、SQL 转换等数据库相关工具"
      tools={tools}
    />
  );
};

