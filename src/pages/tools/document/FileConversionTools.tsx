import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const FileConversionTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '文件转换');

  return (
    <ToolListPage
      title="文件转换工具"
      description="Word、Excel、PPT 等文档格式与 PDF 互相转换"
      tools={tools}
    />
  );
};

