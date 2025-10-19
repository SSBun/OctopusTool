import React from 'react';
import { ToolListPage } from '../../components/ToolListPage';
import { ALL_TOOLS } from '../../data/allTools';

export const CryptoTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => tool.category === '加密解密');

  return (
    <ToolListPage
      title="加密解密"
      description="各种加密、解密、哈希和签名工具"
      tools={tools}
    />
  );
};
