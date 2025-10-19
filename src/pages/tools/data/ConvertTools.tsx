import React from 'react';
import { ToolListPage } from '../../../components/ToolListPage';
import { ALL_TOOLS } from '../../../data/allTools';

export const DataConvertTools: React.FC = () => {
  const tools = ALL_TOOLS.filter((tool) => 
    tool.path === '/tools/data/unit-converter' ||
    tool.path === '/tools/data/base-converter' ||
    tool.path === '/tools/data/color-converter' ||
    tool.path === '/tools/data/json-yaml' ||
    tool.path === '/tools/data/json-xml' ||
    tool.path === '/tools/data/csv-convert'
  );

  return (
    <ToolListPage
      title="数据转换"
      description="单位转换、进制转换、颜色转换、格式转换等"
      tools={tools}
    />
  );
};

