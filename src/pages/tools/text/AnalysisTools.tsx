import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const AnalysisTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/text/stats' ||
    tool.path === '/tools/text/diff' ||
    tool.path === '/tools/text/sort'
  );

  return (
    <ToolListPage
      title="文本分析工具"
      description="文本统计、对比和排序"
      tools={tools}
    />
  );
};
