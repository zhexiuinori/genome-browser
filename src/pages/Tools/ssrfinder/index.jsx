import React from 'react';
import { Typography, Card, Form, Input, Button, Select, Upload, Row, Col, Divider } from 'antd';
import { UploadOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const SSRFinder = () => {
  return (
    <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto', backgroundColor: '#fff' }}>
      {/* 头部区域 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2} style={{ color: '#2c3e50', marginBottom: 16 }}>
          SSR Finder 分析工具
        </Title>
        <Paragraph style={{ 
          fontSize: 16, 
          color: '#666', 
          maxWidth: 800, 
          margin: '0 auto' 
        }}>
          用于识别和分析基因组中的简单重复序列（Simple Sequence Repeats）的专业工具
        </Paragraph>
      </div>

      <Row gutter={[32, 32]}>
        {/* 左侧主要操作区 */}
        <Col span={16}>
          <Card
            bordered={false}
            style={{ 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              borderRadius: '8px'
            }}
          >
            {/* 序列输入区域 */}
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 16 }}>序列输入</Title>
              <Input.TextArea
                placeholder="请在此粘贴您的DNA序列..."
                rows={12}
                style={{
                  marginBottom: 16,
                  fontSize: 14,
                  borderRadius: '6px'
                }}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <Upload>
                  <Button icon={<UploadOutlined />}>
                    上传FASTA文件
                  </Button>
                </Upload>
                <Button type="dashed" icon={<ReloadOutlined />}>
                  清空内容
                </Button>
              </div>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            {/* 快速设置区 */}
            <div>
              <Title level={4} style={{ marginBottom: 16 }}>快速设置</Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Button style={{ width: '100%' }}>默认参数</Button>
                </Col>
                <Col span={8}>
                  <Button style={{ width: '100%' }}>加载示例</Button>
                </Col>
                <Col span={8}>
                  <Button type="primary" style={{ width: '100%' }}>
                    开始分析
                  </Button>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* 右侧参数设置区 */}
        <Col span={8}>
          <Card
            title="分析参数"
            bordered={false}
            style={{ 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              borderRadius: '8px'
            }}
          >
            <Form layout="vertical">
              <Form.Item 
                label="重复单位长度范围" 
                tooltip="设置要搜索的重复单位的长度范围"
              >
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item label="最小值">
                      <Select defaultValue={1}>
                        {[1,2,3,4,5,6].map(n => (
                          <Option key={n} value={n}>{n}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="最大值">
                      <Select defaultValue={6}>
                        {[1,2,3,4,5,6].map(n => (
                          <Option key={n} value={n}>{n}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item 
                label="最小重复次数"
                tooltip="重复单位至少需要重复的次数"
              >
                <Select defaultValue={3}>
                  {[3,4,5,6,7,8,9,10].map(n => (
                    <Option key={n} value={n}>{n}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                label="最小串联重复长度"
                tooltip="SSR序列的最小总长度"
              >
                <Select defaultValue={10}>
                  {[...Array(20)].map((_, i) => (
                    <Option key={i+1} value={i+1}>{i+1}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item 
                label="允许的错配百分比"
                tooltip="序列匹配时允许的最大错配比例"
              >
                <Select defaultValue={0}>
                  {[0,1,2,3,4,5].map(n => (
                    <Option key={n} value={n}>{`${n}%`}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                size="large"
                style={{ 
                  width: '100%',
                  marginTop: 16,
                  height: 45
                }}
              >
                开始分析
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SSRFinder;
