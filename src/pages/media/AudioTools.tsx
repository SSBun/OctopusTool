import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const AudioTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '音频处理');

  return (
    <ToolListPage
      title="音频处理"
      description="音频处理和转换工具集合"
      tools={tools}
    />
  );
};
