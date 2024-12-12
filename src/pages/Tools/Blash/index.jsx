import React from 'react';
import { Typography, Card, Input, Button, Select, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Blash = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>BLASH 序列比对工具</Title>
      <Paragraph>
        BLASH（Basic Local Alignment Search Helper）是一个用于序列比对的工具，支持核苷酸和蛋白质序列的比对分析。
      </Paragraph>
      
      <Card title="序列输入" style={{ marginTop: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select defaultValue="nucleotide" style={{ width: 200 }}>
            <Option value="nucleotide">核苷酸序列 (DNA/RNA)</Option>
            <Option value="protein">蛋白质序列</Option>
          </Select>
          
          <TextArea
            rows={6}
            placeholder="请输入序列，支持FASTA格式"
          />
          
          <Upload>
            <Button icon={<UploadOutlined />}>上传序列文件</Button>
          </Upload>
          
          <Button type="primary" style={{ marginTop: 16 }}>
            开始比对
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Blash;
