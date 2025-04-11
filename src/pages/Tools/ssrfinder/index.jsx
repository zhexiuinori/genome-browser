import React, { useState } from 'react';
import { Typography, Card, Form, Input, Button, Select, Upload, Row, Col, Divider, message, Spin, Table, Tabs, Alert } from 'antd';
import { UploadOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { analyzeSSR } from './ssrAnalyzer';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const SSRFinder = () => {
  // 状态管理
  const [form] = Form.useForm();
  const [sequenceInput, setSequenceInput] = useState('');
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  // 文件上传配置
  const uploadProps = {
    beforeUpload: (file) => {
      if (file.type !== 'application/fasta' && !file.name.endsWith('.fa') && !file.name.endsWith('.fasta')) {
        message.error('请上传FASTA格式文件!');
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
    },
    maxCount: 1,
  };

  // 清空输入
  const handleClearInput = () => {
    setSequenceInput('');
    setFileList([]);
    form.resetFields();
    setResults(null);
  };

  // 加载示例数据
  const handleLoadExample = () => {
    const exampleSequence = `>Example_DNA_Sequence
GATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC
GATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
CGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCG
TAGTAGTAGTAGTAGTAGTAGTAGTAGTAGTAGTAGTAGTAGTAGTAGTAGT
ATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGC
GATTACGATTACGATTACGATTACGATTACGATTACGATTACGATTACGATT
CGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGAT

>Example_DNA_Sequence_2
ATATATATATATATATATATATATATATATATATATATATATATATATAT
CGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGCG
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT`;
    setSequenceInput(exampleSequence);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      // 验证输入
      if (!sequenceInput && fileList.length === 0) {
        message.error('请输入序列或上传FASTA文件');
        return;
      }

      // 获取表单值
      const values = await form.validateFields();
      setLoading(true);
      
      // 准备分析参数
      const analysisParams = {
        minRepeatLength: values.minRepeatLength,
        maxRepeatLength: values.maxRepeatLength,
        minRepeatCount: values.minRepeatCount,
        minTandemLength: values.minTandemLength,
        mismatchPercentage: values.mismatchPercentage
      };
      
      let sequenceData = '';
      
      // 处理文件上传或文本输入
      if (fileList.length > 0) {
        try {
          // 读取上传的文件内容
          const file = fileList[0];
          const reader = new FileReader();
          
          sequenceData = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file);
          });
        } catch (error) {
          throw new Error(`文件读取错误: ${error.message}`);
        }
      } else {
        sequenceData = sequenceInput;
      }
      
      // 使用SSR分析器分析序列
      setTimeout(() => {
        try {
          const results = analyzeSSR(sequenceData, analysisParams);
          setResults(results);
          setActiveTab('2'); // 切换到结果标签页
          message.success('SSR分析完成');
        } catch (error) {
          message.error(`分析错误: ${error.message}`);
          console.error('SSR分析错误:', error);
        } finally {
          setLoading(false);
        }
      }, 100); // 短暂延迟以显示加载状态

    } catch (error) {
      console.error('分析错误:', error);
      message.error(error.message || '分析过程中发生错误');
      setLoading(false);
    }
  };



  // 下载结果
  const handleDownloadResults = () => {
    if (!results) return;
    
    // 创建CSV内容
    let csvContent = 'ID,序列ID,类型,基序,起始位置,终止位置,长度,重复次数\n';
    results.ssrData.forEach(item => {
      csvContent += `${item.id},${item.sequenceId || 'Sequence'},${item.type},${item.motif},${item.start},${item.end},${item.length},${item.repeatCount}\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ssr_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    message.success('结果已下载');
  };

  // 结果表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '序列ID',
      dataIndex: 'sequenceId',
      key: 'sequenceId',
      render: (text) => text || 'Sequence',
      filters: results?.ssrData ? Array.from(new Set(results.ssrData.map(item => item.sequenceId || 'Sequence')))
        .map(id => ({ text: id, value: id })) : [],
      onFilter: (value, record) => (record.sequenceId || 'Sequence') === value,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: '单核苷酸', value: '单核苷酸' },
        { text: '二核苷酸', value: '二核苷酸' },
        { text: '三核苷酸', value: '三核苷酸' },
        { text: '四核苷酸', value: '四核苷酸' },
        { text: '五核苷酸', value: '五核苷酸' },
        { text: '六核苷酸', value: '六核苷酸' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '基序',
      dataIndex: 'motif',
      key: 'motif',
    },
    {
      title: '起始位置',
      dataIndex: 'start',
      key: 'start',
      sorter: (a, b) => a.start - b.start,
    },
    {
      title: '终止位置',
      dataIndex: 'end',
      key: 'end',
      sorter: (a, b) => a.end - b.end,
    },
    {
      title: '长度(bp)',
      dataIndex: 'length',
      key: 'length',
      sorter: (a, b) => a.length - b.length,
    },
    {
      title: '重复次数',
      dataIndex: 'repeatCount',
      key: 'repeatCount',
      sorter: (a, b) => a.repeatCount - b.repeatCount,
    },
  ];

  // 渲染统计信息
  const renderStatistics = () => {
    if (!results) return null;
    
    const { statistics } = results;
    return (
      <Card title="分析统计" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Paragraph>
              <Text strong>总SSR数量:</Text> {statistics.totalSSRs}
            </Paragraph>
          </Col>
          <Col span={6}>
            <Paragraph>
              <Text strong>序列长度:</Text> {statistics.sequenceLength} bp
            </Paragraph>
          </Col>
          <Col span={6}>
            <Paragraph>
              <Text strong>SSR密度:</Text> {statistics.density} 个/kb
            </Paragraph>
          </Col>
          <Col span={6}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadResults}
            >
              下载结果
            </Button>
          </Col>
        </Row>
        
        <Divider orientation="left">SSR类型分布</Divider>
        
        <Row gutter={[16, 16]}>
          {Object.entries(statistics.typeCounts).map(([type, count]) => (
            <Col span={4} key={type}>
              <Card size="small">
                <Paragraph style={{ textAlign: 'center', margin: 0 }}>
                  <Text strong>{type}</Text>
                  <br />
                  <Text>{count} 个</Text>
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

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

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="序列输入" key="1">
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
                    value={sequenceInput}
                    onChange={(e) => setSequenceInput(e.target.value)}
                    disabled={fileList.length > 0}
                  />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Upload {...uploadProps}>
                      <Button 
                        icon={<UploadOutlined />}
                        disabled={sequenceInput.length > 0}
                      >
                        上传FASTA文件
                      </Button>
                    </Upload>
                    <Button 
                      type="dashed" 
                      icon={<ReloadOutlined />}
                      onClick={handleClearInput}
                    >
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
                      <Button 
                        style={{ width: '100%' }}
                        onClick={() => form.resetFields()}
                      >
                        默认参数
                      </Button>
                    </Col>
                    <Col span={8}>
                      <Button 
                        style={{ width: '100%' }}
                        onClick={handleLoadExample}
                      >
                        加载示例
                      </Button>
                    </Col>
                    <Col span={8}>
                      <Button 
                        type="primary" 
                        style={{ width: '100%' }}
                        onClick={handleSubmit}
                        loading={loading}
                      >
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
                <Form form={form} layout="vertical" initialValues={{
                  minRepeatLength: 1,
                  maxRepeatLength: 6,
                  minRepeatCount: 3,
                  minTandemLength: 10,
                  mismatchPercentage: 0
                }}>
                  <Form.Item 
                    label="重复单位长度范围" 
                    tooltip="设置要搜索的重复单位的长度范围"
                  >
                    <Row gutter={8}>
                      <Col span={12}>
                        <Form.Item name="minRepeatLength" label="最小值" noStyle>
                          <Select>
                            {[1,2,3,4,5,6].map(n => (
                              <Option key={n} value={n}>{n}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="maxRepeatLength" label="最大值" noStyle>
                          <Select>
                            {[1,2,3,4,5,6].map(n => (
                              <Option key={n} value={n}>{n}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>

                  <Form.Item 
                    name="minRepeatCount"
                    label="最小重复次数"
                    tooltip="重复单位至少需要重复的次数"
                  >
                    <Select>
                      {[3,4,5,6,7,8,9,10].map(n => (
                        <Option key={n} value={n}>{n}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item 
                    name="minTandemLength"
                    label="最小串联重复长度"
                    tooltip="SSR序列的最小总长度"
                  >
                    <Select>
                      {[...Array(20)].map((_, i) => (
                        <Option key={i+1} value={i+1}>{i+1}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item 
                    name="mismatchPercentage"
                    label="允许的错配百分比"
                    tooltip="序列匹配时允许的最大错配比例"
                  >
                    <Select>
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
                    onClick={handleSubmit}
                    loading={loading}
                  >
                    开始分析
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="分析结果" key="2" disabled={!results}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" tip="正在分析SSR序列..." />
            </div>
          ) : results ? (
            <>
              {renderStatistics()}
              
              <Card title="SSR详细列表" bordered={false}>
                <Table 
                  dataSource={results.ssrData} 
                  columns={columns} 
                  rowKey="key"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content' }}
                />
              </Card>
            </>
          ) : (
            <Alert
              message="暂无分析结果"
              description="请在序列输入页面提交序列进行分析"
              type="info"
              showIcon
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SSRFinder;
