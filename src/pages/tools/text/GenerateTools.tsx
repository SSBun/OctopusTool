import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const GenerateTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/text/password' ||
    tool.path === '/tools/text/uuid' ||
    tool.path === '/tools/text/lorem' ||
    tool.path === '/tools/text/emoji' ||
    tool.path === '/tools/text/variable-naming' ||
    tool.path === '/tools/text/mock-data'
  );

  return (
    <ToolListPage
      title="文本生成工具"
      description="密码、UUID、Lorem Ipsum、Emoji、AI 变量命名和 Mock 数据生成"
      tools={tools}
    />
  );
};
