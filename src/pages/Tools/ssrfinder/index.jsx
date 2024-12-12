import React from 'react';
import { Typography, Card, Form, Input, Button, Select, InputNumber } from 'antd';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const SSRFinder = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>SSR Finder 工具</Title>
      <Paragraph>
        SSR（Simple Sequence Repeats）查找工具，用于识别和分析基因组中的简单重复序列。
      </Paragraph>
      
      <Card title="SSR 参数设置" style={{ marginTop: 20 }}>
        <Form layout="vertical">
          <Form.Item label="最小重复单位长度">
            <InputNumber min={1} defaultValue={2} />
          </Form.Item>
          
          <Form.Item label="最大重复单位长度">
            <InputNumber min={2} defaultValue={6} />
          </Form.Item>
          
          <Form.Item label="最小重复次数">
            <InputNumber min={3} defaultValue={5} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary">开始分析</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SSRFinder;
