import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

const JBrowse = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>JBrowse 基因组浏览器</Title>
      <Paragraph>
        JBrowse是一个功能强大的基因组浏览器，可用于可视化基因组数据和注释信息。
      </Paragraph>
      
      <Card title="基因组浏览" style={{ marginTop: 20 }}>
        {/* JBrowse组件将在这里集成 */}
        <div style={{ height: '600px', border: '1px solid #ddd' }}>
          JBrowse 视图将在这里加载
        </div>
      </Card>
    </div>
  );
};

export default JBrowse;
