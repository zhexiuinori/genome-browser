import React, { useState } from 'react';
import { Typography, Card, Input, Select, Button, message, Space, Divider, Spin, Empty } from 'antd';
import './index.less';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Blash = () => {
  const [sequenceType, setSequenceType] = useState('nucleotide');
  const [sequenceText, setSequenceText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 处理文件选择
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.match(/\.(fasta|fa)$/i)) {
        message.error('请选择 FASTA 格式文件 (.fasta 或 .fa)');
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!sequenceText && !selectedFile) {
      message.error('请提供序列数据');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      
      const formData = new FormData();
      formData.append('sequenceType', sequenceType);

      if (selectedFile) {
        formData.append('sequenceFile', selectedFile);
      } else if (sequenceText) {
        formData.append('sequenceText', sequenceText);
      }

      const response = await fetch('/api/blash/align', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '序列比对请求失败');
      }

      setResult(data);
      message.success('序列比对完成');
      
      // 清空文件输入
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('提交错误:', error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 渲染比对结果
  const renderResult = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="正在进行序列比对..." />
        </div>
      );
    }

    if (!result) {
      return <Empty description="暂无比对结果" />;
    }

    return (
      <div className="blast-result">
        <div className="result-header">
          <Title level={4}>比对信息</Title>
          <div className="result-meta">
            <p>序列类型: {sequenceType === 'nucleotide' ? '核苷酸序列' : '蛋白质序列'}</p>
            <p>提交时间: {new Date().toLocaleString()}</p>
          </div>
        </div>

        <Divider />

        <div className="result-content">
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-all',
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="blash-container">
      <Title level={2}>BLASH 序列比对工具</Title>
      <Paragraph>
        BLASH（Basic Local Alignment Search Helper）是一个用于序列比对的工具，支持核苷酸和蛋白质序列的比对分析。
      </Paragraph>

      <Card title="序列输入">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            value={sequenceType}
            onChange={setSequenceType}
            style={{ width: 200 }}
          >
            <Option value="nucleotide">核苷酸序列 (DNA/RNA)</Option>
            <Option value="protein">蛋白质序列</Option>
          </Select>

          <TextArea
            rows={6}
            value={sequenceText}
            onChange={(e) => setSequenceText(e.target.value)}
            placeholder="请输入 FASTA 格式序列，支持FASTA格式"
            disabled={selectedFile !== null}
          />

          <div className="file-upload">
            <input
              type="file"
              accept=".fasta,.fa"
              onChange={handleFileSelect}
              disabled={sequenceText.length > 0}
            />
          </div>

          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={!sequenceText && !selectedFile}
          >
            开始比对
          </Button>
        </Space>
      </Card>

      <Divider />

      <Card title="比对结果">
        {renderResult()}
      </Card>
    </div>
  );
};

export default Blash;
