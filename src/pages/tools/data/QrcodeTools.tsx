import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const QrcodeTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.path.startsWith('/tools/data/qr'));

  return (
    <ToolListPage
      title="二维码/条形码工具"
      description="二维码生成、解析和条形码生成工具"
      tools={tools}
    />
  );
};
