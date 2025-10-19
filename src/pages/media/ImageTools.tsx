import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const ImageTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '图片处理');

  return (
    <ToolListPage
      title="图片处理"
      description="图片处理和转换工具集合"
      tools={tools}
    />
  );
};
