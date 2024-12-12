import React from 'react';
import { Typography, Card, Select, Button, Space } from 'antd';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const SyntenyViewer = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Synteny Viewer 共线性分析工具</Title>
      <Paragraph>
        基因组共线性分析与可视化工具，用于比较不同物种间的基因组结构和进化关系。
      </Paragraph>
      
      <Card title="基因组选择" style={{ marginTop: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            placeholder="选择参考基因组"
            style={{ width: '100%' }}
          >
            <Option value="genome1">基因组 1</Option>
            <Option value="genome2">基因组 2</Option>
          </Select>
          
          <Select
            placeholder="选择比较基因组"
            style={{ width: '100%' }}
          >
            <Option value="genome1">基因组 1</Option>
            <Option value="genome2">基因组 2</Option>
          </Select>
          
          <Button type="primary">
            开始分析
          </Button>
        </Space>
      </Card>
      
      <Card title="可视化结果" style={{ marginTop: 20 }}>
        <div style={{ height: '500px', border: '1px solid #ddd' }}>
          共线性分析结果将在这里显示
        </div>
      </Card>
    </div>
  );
};

export default SyntenyViewer;
