import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const EditTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/text/case' ||
    tool.path === '/tools/text/replace' ||
    tool.path === '/tools/text/dedupe' ||
    tool.path === '/tools/text/pinyin' ||
    tool.path === '/tools/text/chinese-convert' ||
    tool.path === '/tools/text/markdown-editor'
  );

  return (
    <ToolListPage
      title="文本编辑工具"
      description="大小写转换、查找替换、去重、汉字转拼音、繁简转换和 Markdown 编辑器"
      tools={tools}
    />
  );
};
