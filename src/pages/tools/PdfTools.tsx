import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const PdfTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === 'PDF 工具');

  return (
    <ToolListPage
      title="PDF 工具"
      description="PDF 文件处理和转换工具集合"
      tools={tools}
    />
  );
};
