import React, { useState, useEffect } from 'react';
import { Typography, Card, Select, Button, Space, Row, Col, Form, Divider, Spin, Empty, Tabs, Upload, message } from 'antd';
import { UploadOutlined, DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import './index.css';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const SyntenyViewer = () => {
  // 状态管理
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [speciesList, setSpeciesList] = useState([]);
  const [syntenyData, setSyntenyData] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  const [fileList, setFileList] = useState([]);

  // 加载物种列表
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch('/api/species');
        if (response.ok) {
          const data = await response.json();
          setSpeciesList(data.data.listData || []);
        }
      } catch (error) {
        console.error('获取物种列表失败:', error);
        // 使用模拟数据
        setSpeciesList([
          { key: 'species-0', title: 'Broussonetia papyrifera' },
          { key: 'species-1', title: 'Broussonetia kaempferi' },
          { key: 'species-2', title: 'Broussonetia monoica' }
        ]);
      }
    };

    fetchSpecies();
  }, []);

  // 文件上传配置
  const uploadProps = {
    beforeUpload: (file) => {
      if (!file.name.endsWith('.gff') && !file.name.endsWith('.gff3')) {
        message.error('请上传GFF格式文件!');
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

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      // 验证表单
      const values = await form.validateFields();
      setLoading(true);
      
      // 这里应该是实际的API调用
      // 由于后端API尚未实现，使用模拟数据
      setTimeout(() => {
        const mockData = generateMockSyntenyData(values.referenceGenome, values.queryGenome);
        setSyntenyData(mockData);
        setActiveTab('2'); // 切换到结果标签页
        setLoading(false);
        message.success('共线性分析完成');
      }, 1500);
    } catch (error) {
      console.error('分析错误:', error);
      message.error(error.message || '分析过程中发生错误');
      setLoading(false);
    }
  };

  // 生成模拟共线性数据
  const generateMockSyntenyData = (referenceGenome, queryGenome) => {
    // 模拟染色体数据
    const referenceChromosomes = [];
    const queryChromosomes = [];
    
    // 生成参考基因组染色体
    for (let i = 1; i <= 7; i++) {
      referenceChromosomes.push({
        id: `ref_chr${i}`,
        name: `Chr${i}`,
        length: Math.floor(Math.random() * 50000000) + 10000000,
        genes: Math.floor(Math.random() * 5000) + 1000
      });
    }
    
    // 生成查询基因组染色体
    for (let i = 1; i <= 7; i++) {
      queryChromosomes.push({
        id: `query_chr${i}`,
        name: `Chr${i}`,
        length: Math.floor(Math.random() * 50000000) + 10000000,
        genes: Math.floor(Math.random() * 5000) + 1000
      });
    }
    
    // 生成共线性区块
    const syntenyBlocks = [];
    for (let i = 0; i < 30; i++) {
      const refChrIndex = Math.floor(Math.random() * referenceChromosomes.length);
      const queryChrIndex = Math.floor(Math.random() * queryChromosomes.length);
      
      const refChr = referenceChromosomes[refChrIndex];
      const queryChr = queryChromosomes[queryChrIndex];
      
      const refStart = Math.floor(Math.random() * (refChr.length - 1000000));
      const refEnd = refStart + Math.floor(Math.random() * 1000000) + 500000;
      
      const queryStart = Math.floor(Math.random() * (queryChr.length - 1000000));
      const queryEnd = queryStart + Math.floor(Math.random() * 1000000) + 500000;
      
      syntenyBlocks.push({
        id: `block${i}`,
        referenceChromosome: refChr.id,
        referenceStart: refStart,
        referenceEnd: refEnd,
        queryChromosome: queryChr.id,
        queryStart: queryStart,
        queryEnd: queryEnd,
        similarity: Math.random() * 30 + 70, // 70-100% 相似度
        orientation: Math.random() > 0.5 ? 'forward' : 'reverse'
      });
    }
    
    return {
      referenceGenome: {
        name: referenceGenome,
        chromosomes: referenceChromosomes
      },
      queryGenome: {
        name: queryGenome,
        chromosomes: queryChromosomes
      },
      syntenyBlocks: syntenyBlocks
    };
  };

  // 清空输入
  const handleClearInput = () => {
    form.resetFields();
    setFileList([]);
    setSyntenyData(null);
  };

  // 下载结果
  const handleDownloadResults = () => {
    if (!syntenyData) return;
    
    // 创建CSV内容
    let csvContent = 'Block ID,Reference Chromosome,Reference Start,Reference End,Query Chromosome,Query Start,Query End,Similarity(%),Orientation\n';
    syntenyData.syntenyBlocks.forEach(block => {
      csvContent += `${block.id},${block.referenceChromosome},${block.referenceStart},${block.referenceEnd},${block.queryChromosome},${block.queryStart},${block.queryEnd},${block.similarity.toFixed(2)},${block.orientation}\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'synteny_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    message.success('结果已下载');
  };

  // 共线性图表配置
  const getSyntenyChartOption = () => {
    if (!syntenyData) return {};
    
    const { referenceGenome, queryGenome, syntenyBlocks } = syntenyData;
    
    // 准备染色体数据
    const referenceChromosomes = referenceGenome.chromosomes;
    const queryChromosomes = queryGenome.chromosomes;
    
    // 计算染色体位置
    let refOffset = 0;
    const refChromosomePositions = {};
    referenceChromosomes.forEach(chr => {
      refChromosomePositions[chr.id] = {
        start: refOffset,
        end: refOffset + chr.length,
        name: chr.name
      };
      refOffset += chr.length + 5000000; // 添加间隔
    });
    
    let queryOffset = 0;
    const queryChromosomePositions = {};
    queryChromosomes.forEach(chr => {
      queryChromosomePositions[chr.id] = {
        start: queryOffset,
        end: queryOffset + chr.length,
        name: chr.name
      };
      queryOffset += chr.length + 5000000; // 添加间隔
    });
    
    // 准备图表数据
    const refChromosomeData = [];
    const queryChromosomeData = [];
    const linksData = [];
    
    // 添加染色体数据
    Object.values(refChromosomePositions).forEach(pos => {
      refChromosomeData.push([pos.start, 1, pos.end - pos.start, pos.name]);
    });
    
    Object.values(queryChromosomePositions).forEach(pos => {
      queryChromosomeData.push([pos.start, 0, pos.end - pos.start, pos.name]);
    });
    
    // 添加共线性连接
    syntenyBlocks.forEach(block => {
      const refPos = refChromosomePositions[block.referenceChromosome];
      const queryPos = queryChromosomePositions[block.queryChromosome];
      
      if (refPos && queryPos) {
        const refStart = refPos.start + block.referenceStart;
        const refEnd = refPos.start + block.referenceEnd;
        const queryStart = queryPos.start + block.queryStart;
        const queryEnd = queryPos.start + block.queryEnd;
        
        // 计算连接颜色，基于相似度
        const similarity = block.similarity;
        let color;
        if (similarity >= 90) {
          color = '#1890ff'; // 高相似度
        } else if (similarity >= 80) {
          color = '#52c41a'; // 中等相似度
        } else {
          color = '#faad14'; // 低相似度
        }
        
        // 添加连接线
        linksData.push({
          coords: [
            [refStart, 1],
            [queryStart, 0]
          ],
          lineStyle: {
            color: color,
            opacity: 0.6,
            width: 1
          }
        });
        
        linksData.push({
          coords: [
            [refEnd, 1],
            [queryEnd, 0]
          ],
          lineStyle: {
            color: color,
            opacity: 0.6,
            width: 1
          }
        });
      }
    });
    
    return {
      title: {
        text: `${referenceGenome.name} vs ${queryGenome.name} 共线性分析`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          if (params.seriesIndex === 0) {
            return `${params.data[3]}<br/>长度: ${(params.data[2]/1000000).toFixed(2)}Mb`;
          } else if (params.seriesIndex === 1) {
            return `${params.data[3]}<br/>长度: ${(params.data[2]/1000000).toFixed(2)}Mb`;
          }
          return '';
        }
      },
      grid: {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
        min: 0,
        max: Math.max(refOffset, queryOffset)
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
        min: -0.1,
        max: 1.1
      },
      series: [
        {
          name: referenceGenome.name,
          type: 'custom',
          renderItem: function(params, api) {
            const start = api.value(0);
            const y = api.value(1);
            const width = api.value(2);
            const name = api.value(3);
            
            const x = api.coord([start, y])[0];
            const height = 20;
            const rectY = api.coord([0, y])[1] - height / 2;
            
            // 绘制染色体
            const rectShape = {
              type: 'rect',
              shape: {
                x: x,
                y: rectY,
                width: api.size([width, 0])[0],
                height: height
              },
              style: {
                fill: '#5470c6',
                stroke: '#333'
              }
            };
            
            // 添加染色体名称
            const textConfig = {
              type: 'text',
              style: {
                text: name,
                textAlign: 'center',
                textVerticalAlign: 'middle',
                fontSize: 12,
                fill: '#333'
              },
              position: [
                x + api.size([width, 0])[0] / 2,
                rectY - 10
              ]
            };
            
            return {
              type: 'group',
              children: [rectShape, textConfig]
            };
          },
          data: refChromosomeData
        },
        {
          name: queryGenome.name,
          type: 'custom',
          renderItem: function(params, api) {
            const start = api.value(0);
            const y = api.value(1);
            const width = api.value(2);
            const name = api.value(3);
            
            const x = api.coord([start, y])[0];
            const height = 20;
            const rectY = api.coord([0, y])[1] - height / 2;
            
            // 绘制染色体
            const rectShape = {
              type: 'rect',
              shape: {
                x: x,
                y: rectY,
                width: api.size([width, 0])[0],
                height: height
              },
              style: {
                fill: '#91cc75',
                stroke: '#333'
              }
            };
            
            // 添加染色体名称
            const textConfig = {
              type: 'text',
              style: {
                text: name,
                textAlign: 'center',
                textVerticalAlign: 'middle',
                fontSize: 12,
                fill: '#333'
              },
              position: [
                x + api.size([width, 0])[0] / 2,
                rectY + height + 10
              ]
            };
            
            return {
              type: 'group',
              children: [rectShape, textConfig]
            };
          },
          data: queryChromosomeData
        },
        {
          name: '共线性连接',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 1,
          effect: {
            show: false
          },
          lineStyle: {
            width: 1,
            opacity: 0.6,
            curveness: 0.3
          },
          data: linksData
        }
      ]
    };
  };

  // 渲染统计信息
  const renderStatistics = () => {
    if (!syntenyData) return null;
    
    const { referenceGenome, queryGenome, syntenyBlocks } = syntenyData;
    
    // 计算统计信息
    const totalBlocks = syntenyBlocks.length;
    const forwardBlocks = syntenyBlocks.filter(block => block.orientation === 'forward').length;
    const reverseBlocks = totalBlocks - forwardBlocks;
    const avgSimilarity = syntenyBlocks.reduce((sum, block) => sum + block.similarity, 0) / totalBlocks;
    
    return (
      <Card title="分析统计" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Paragraph>
              <Text strong>共线性区块总数:</Text> {totalBlocks}
            </Paragraph>
          </Col>
          <Col span={6}>
            <Paragraph>
              <Text strong>正向区块:</Text> {forwardBlocks}
            </Paragraph>
          </Col>
          <Col span={6}>
            <Paragraph>
              <Text strong>反向区块:</Text> {reverseBlocks}
            </Paragraph>
          </Col>
          <Col span={6}>
            <Paragraph>
              <Text strong>平均相似度:</Text> {avgSimilarity.toFixed(2)}%
            </Paragraph>
          </Col>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadResults}
            >
              下载结果
            </Button>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div className="synteny-container">
      {/* 头部区域 */}
      <div className="synteny-header">
        <Title level={2} style={{ color: '#2c3e50', marginBottom: 16 }}>
          Synteny Viewer 共线性分析工具
        </Title>
        <Paragraph style={{ 
          fontSize: 16, 
          color: '#666', 
          maxWidth: 800, 
          margin: '0 auto' 
        }}>
          基因组共线性分析与可视化工具，用于比较不同物种间的基因组结构和进化关系。
        </Paragraph>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="参数设置" key="1">
          <Row gutter={[32, 32]}>
            {/* 左侧主要操作区 */}
            <Col span={16}>
              <Card
                bordered={false}
                className="synteny-control-card"
              >
                {/* 基因组选择区域 */}
                <div style={{ marginBottom: 24 }}>
                  <Title level={4} style={{ marginBottom: 16 }}>基因组选择</Title>
                  <Form form={form} layout="vertical" initialValues={{
                    referenceGenome: 'Broussonetia papyrifera',
                    queryGenome: 'Broussonetia kaempferi',
                    minBlockLength: 10000,
                    minSimilarity: 70
                  }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="referenceGenome"
                          label="参考基因组"
                          rules={[{ required: true, message: '请选择参考基因组' }]}
                        >
                          <Select placeholder="选择参考基因组">
                            {speciesList.map(species => (
                              <Option key={species.key} value={species.title}>{species.title}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="queryGenome"
                          label="查询基因组"
                          rules={[{ required: true, message: '请选择查询基因组' }]}
                        >
                          <Select placeholder="选择查询基因组">
                            {speciesList.map(species => (
                              <Option key={species.key} value={species.title}>{species.title}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>

                <Divider style={{ margin: '24px 0' }} />

                {/* 文件上传区域 */}
                <div style={{ marginBottom: 24 }}>
                  <Title level={4} style={{ marginBottom: 16 }}>自定义基因组文件</Title>
                  <Paragraph style={{ marginBottom: 16 }}>
                    如果您想使用自定义基因组数据进行分析，可以上传GFF格式的基因组注释文件。
                  </Paragraph>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>上传GFF文件</Button>
                  </Upload>
                </div>

                <Divider style={{ margin: '24px 0' }} />

                {/* 快速设置区 */}
                <div>
                  <Title level={4} style={{ marginBottom: 16 }}>操作</Title>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Button 
                        style={{ width: '100%' }}
                        onClick={handleClearInput}
                        icon={<SyncOutlined />}
                      >
                        重置参数
                      </Button>
                    </Col>
                    <Col span={16}>
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
                className="synteny-control-card"
              >
                <Form form={form} layout="vertical">
                  <Form.Item 
                    name="minBlockLength" 
                    label="最小共线性区块长度 (bp)" 
                    tooltip="共线性区块的最小长度，单位为碱基对"
                  >
                    <Select>
                      <Option value={5000}>5,000</Option>
                      <Option value={10000}>10,000</Option>
                      <Option value={20000}>20,000</Option>
                      <Option value={50000}>50,000</Option>
                      <Option value={100000}>100,000</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item 
                    name="minSimilarity" 
                    label="最小相似度 (%)" 
                    tooltip="共线性区块的最小序列相似度百分比"
                  >
                    <Select>
                      <Option value={50}>50%</Option>
                      <Option value={60}>60%</Option>
                      <Option value={70}>70%</Option>
                      <Option value={80}>80%</Option>
                      <Option value={90}>90%</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item 
                    name="algorithm" 
                    label="分析算法" 
                    tooltip="用于共线性分析的算法"
                    initialValue="MCScanX"
                  >
                    <Select>
                      <Option value="MCScanX">MCScanX</Option>
                      <Option value="SynMap">SynMap</Option>
                      <Option value="DAGchainer">DAGchainer</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item 
                    name="gapSize" 
                    label="最大间隙大小" 
                    tooltip="共线性区块中允许的最大间隙大小"
                    initialValue={5}
                  >
                    <Select>
                      <Option value={1}>1</Option>
                      <Option value={2}>2</Option>
                      <Option value={5}>5</Option>
                      <Option value={10}>10</Option>
                      <Option value={20}>20</Option>
                    </Select>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="分析结果" key="2">
          {loading ? (
            <div className="loading-container">
              <Spin tip="正在进行共线性分析..." size="large" />
            </div>
          ) : syntenyData ? (
            <div>
              {renderStatistics()}
              
              <Card title="共线性可视化" className="synteny-visualization-card">
                <ReactEcharts 
                  option={getSyntenyChartOption()} 
                  className="synteny-chart"
                />
              </Card>
              
              <Card title="共线性区块详情">
                <div className="table-container">
                  <table className="synteny-table">
                    <thead>
                      <tr>
                        <th>区块ID</th>
                        <th>参考染色体</th>
                        <th>起始位置</th>
                        <th>终止位置</th>
                        <th>查询染色体</th>
                        <th>起始位置</th>
                        <th>终止位置</th>
                        <th>相似度</th>
                        <th>方向</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syntenyData.syntenyBlocks.map(block => (
                        <tr key={block.id}>
                          <td>{block.id}</td>
                          <td>{block.referenceChromosome.replace('ref_', '')}</td>
                          <td>{block.referenceStart.toLocaleString()}</td>
                          <td>{block.referenceEnd.toLocaleString()}</td>
                          <td>{block.queryChromosome.replace('query_', '')}</td>
                          <td>{block.queryStart.toLocaleString()}</td>
                          <td>{block.queryEnd.toLocaleString()}</td>
                          <td>{block.similarity.toFixed(2)}%</td>
                          <td>{block.orientation === 'forward' ? '正向' : '反向'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          ) : (
            <Empty description="暂无分析结果，请在参数设置页面进行分析" />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SyntenyViewer;
