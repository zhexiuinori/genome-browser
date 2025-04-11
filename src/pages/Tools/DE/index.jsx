import React, { useState } from 'react';
import { Typography, Card, Upload, Button, Form, Input, Select, Slider, Divider, Tabs, Spin, message } from 'antd';
import { UploadOutlined, SettingOutlined, LineChartOutlined, HeatMapOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import './index.css';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Dragger } = Upload;

// 错误边界组件，用于捕获分析过程中的错误
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('差异表达分析错误:', error);
    console.error('错误详情:', errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <Card>
            <Title level={4}>分析过程中发生错误</Title>
            <Paragraph>
              差异表达基因分析过程中发生错误，请检查以下可能的原因：
            </Paragraph>
            <ul>
              <li>输入数据格式不正确</li>
              <li>分析参数设置不合理</li>
              <li>服务器连接问题</li>
            </ul>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details style={{ whiteSpace: 'pre-wrap' }}>
                <summary>错误详情</summary>
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 模拟数据 - 火山图数据
const generateVolcanoData = () => {
  const data = [];
  for (let i = 0; i < 1000; i++) {
    const logFC = (Math.random() - 0.5) * 10;
    const negLogPval = Math.random() * 10;
    let category = 'Not Significant';
    let itemStyle = { color: '#d3d3d3' };
    
    if (Math.abs(logFC) > 2 && negLogPval > 5) {
      category = logFC > 0 ? 'Up-regulated' : 'Down-regulated';
      itemStyle = { color: logFC > 0 ? '#ff4d4f' : '#1890ff' };
    }
    
    data.push([logFC, negLogPval, category, itemStyle]);
  }
  return data;
};

// 模拟数据 - 热图数据
const generateHeatmapData = () => {
  const data = [];
  const xLabels = ['Sample1', 'Sample2', 'Sample3', 'Sample4', 'Sample5', 'Sample6'];
  const yLabels = [];
  
  for (let i = 0; i < 50; i++) {
    yLabels.push(`Gene${i+1}`);
    for (let j = 0; j < xLabels.length; j++) {
      data.push([j, i, (Math.random() * 10 - 5).toFixed(2)]);
    }
  }
  
  return { data, xLabels, yLabels };
};

// 火山图配置
const getVolcanoOption = (data) => {
  return {
    title: {
      text: '差异表达基因火山图',
      left: 'center'
    },
    tooltip: {
      formatter: function(params) {
        return `logFC: ${params.data[0].toFixed(2)}<br/>-log10(p-value): ${params.data[1].toFixed(2)}<br/>状态: ${params.data[2]}`;
      }
    },
    xAxis: {
      name: 'log2(Fold Change)',
      nameLocation: 'middle',
      nameGap: 30,
      type: 'value'
    },
    yAxis: {
      name: '-log10(p-value)',
      nameLocation: 'middle',
      nameGap: 40,
      type: 'value'
    },
    grid: {
      left: '10%',
      right: '10%'
    },
    series: [{
      type: 'scatter',
      symbolSize: 5,
      data: data,
      itemStyle: {
        opacity: 0.7
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
};

// 热图配置
const getHeatmapOption = (data, xLabels, yLabels) => {
  return {
    title: {
      text: '差异表达基因热图',
      left: 'center'
    },
    tooltip: {
      position: 'top',
      formatter: function(params) {
        return `基因: ${yLabels[params.data[1]]}<br/>样本: ${xLabels[params.data[0]]}<br/>表达值: ${params.data[2]}`;
      }
    },
    grid: {
      height: '60%',
      top: '10%',
      left: '15%',
      right: '10%',
      bottom: '20%'
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'category',
      data: yLabels,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: -5,
      max: 5,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#1890ff', '#f7f7f7', '#ff4d4f']
      }
    },
    series: [{
      name: '表达值',
      type: 'heatmap',
      data: data,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
};

// 富集分析气泡图配置
const getEnrichmentOption = () => {
  // 模拟富集分析数据
  const data = [];
  const terms = [
    'DNA复制', '细胞周期', '光合作用', '氧化磷酸化',
    '蛋白质合成', '脂质代谢', '细胞壁合成', '激素信号转导',
    '转录调控', '细胞分裂'
  ];
  
  for (let i = 0; i < terms.length; i++) {
    const geneCount = Math.floor(Math.random() * 100) + 20;
    const pValue = Math.random() * 0.05;
    const enrichmentRatio = Math.random() * 5 + 1;
    
    data.push({
      name: terms[i],
      value: [i, -Math.log10(pValue), enrichmentRatio, geneCount]
    });
  }
  
  return {
    title: {
      text: 'GO/KEGG富集分析',
      left: 'center'
    },
    grid: {
      left: '15%',
      right: '15%',
      top: '10%',
      bottom: '15%'
    },
    tooltip: {
      formatter: function(params) {
        return `${params.data.name}<br/>-log10(p-value): ${params.data.value[1].toFixed(2)}<br/>富集比: ${params.data.value[2].toFixed(2)}<br/>基因数: ${params.data.value[3]}`;
      }
    },
    xAxis: {
      type: 'category',
      data: terms,
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      name: '-log10(p-value)',
      nameLocation: 'middle',
      nameGap: 40,
      type: 'value'
    },
    series: [{
      type: 'scatter',
      symbolSize: function(data) {
        return Math.sqrt(data[3]) * 3;
      },
      data: data.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: `rgba(${Math.floor(Math.random() * 150 + 50)}, ${Math.floor(Math.random() * 150 + 50)}, ${Math.floor(Math.random() * 150 + 50)}, 0.8)`
        }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
};

const DEGeneAnalysis = () => {
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('1');
  
  // 文件上传配置
  const uploadProps = {
    name: 'file',
    multiple: false,
    action: '/api/upload/expression',
    accept: '.csv,.txt,.xlsx,.tsv',
    fileList,
    onChange(info) {
      const { status } = info.file;
      let fileList = [...info.fileList];
      
      // 限制只能上传一个文件
      fileList = fileList.slice(-1);
      
      if (status === 'done') {
        message.success(`${info.file.name} 上传成功`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
      
      setFileList(fileList);
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };
  
  // 提交分析请求
  const handleSubmit = (values) => {
    if (fileList.length === 0) {
      message.error('请先上传表达数据文件');
      return;
    }
    
    setAnalyzing(true);
    setResults(null);
    
    // 这里应该是实际的API调用
    // 由于后端API尚未实现，使用模拟数据
    setTimeout(() => {
      try {
        const volcanoData = generateVolcanoData();
        const { data: heatmapData, xLabels, yLabels } = generateHeatmapData();
        
        setResults({
          volcanoData,
          heatmapData,
          xLabels,
          yLabels,
          deGenes: {
            total: 1000,
            up: 120,
            down: 85,
            notSignificant: 795
          },
          params: values
        });
        
        setAnalyzing(false);
        setActiveTab('2'); // 切换到结果标签页
        message.success('差异表达分析完成');
      } catch (error) {
        console.error('分析过程中出错:', error);
        message.error('分析过程中出错');
        setAnalyzing(false);
      }
    }, 3000);
  };
  
  // 下载结果
  const handleDownload = (type) => {
    message.success(`${type}下载已开始，请稍候...`);
    // 这里应该是实际的下载逻辑
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>差异表达基因分析</Title>
      <Paragraph>
        差异表达基因(DEG)分析是一种用于识别在不同条件下表达水平显著变化的基因的方法。
        本工具支持多种差异表达分析算法，包括DESeq2、edgeR和limma等，并提供丰富的可视化功能。
      </Paragraph>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="数据上传与参数设置" key="1">
          <Card title="数据上传" style={{ marginBottom: 16 }}>
            <Paragraph>
              请上传表达数据文件。支持的格式包括CSV、TXT、XLSX和TSV。
              文件应包含基因ID和各样本的表达值（如counts、FPKM或TPM）。
            </Paragraph>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持单个文件上传。请确保数据格式正确，第一列为基因ID，后续列为样本表达值。
              </p>
            </Dragger>
          </Card>
          
          <Card title="分析参数设置" style={{ marginBottom: 16 }}>
            <Form
              name="degAnalysisForm"
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                algorithm: 'deseq2',
                pValueCutoff: 0.05,
                logFCCutoff: 1,
                groupInfo: 'control: sample1,sample2,sample3\ntreatment: sample4,sample5,sample6',
                normalization: 'tpm'
              }}
            >
              <Form.Item
                label="分析算法"
                name="algorithm"
                rules={[{ required: true, message: '请选择分析算法' }]}
              >
                <Select>
                  <Option value="deseq2">DESeq2</Option>
                  <Option value="edger">edgeR</Option>
                  <Option value="limma">limma-voom</Option>
                  <Option value="noiseq">NOISeq</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                label="P值阈值"
                name="pValueCutoff"
                rules={[{ required: true, message: '请设置P值阈值' }]}
              >
                <Slider
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  marks={{
                    0.001: '0.001',
                    0.01: '0.01',
                    0.05: '0.05',
                    0.1: '0.1'
                  }}
                />
              </Form.Item>
              
              <Form.Item
                label="Log2倍数变化阈值"
                name="logFCCutoff"
                rules={[{ required: true, message: '请设置Log2FC阈值' }]}
              >
                <Slider
                  min={0}
                  max={4}
                  step={0.1}
                  marks={{
                    0: '0',
                    1: '1',
                    2: '2',
                    4: '4'
                  }}
                />
              </Form.Item>
              
              <Form.Item
                label="样本分组信息"
                name="groupInfo"
                rules={[{ required: true, message: '请输入样本分组信息' }]}
                help="每行一个组，格式为'组名: 样本1,样本2,...'，样本名应与上传文件中的列名一致"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
              
              <Form.Item
                label="数据标准化方法"
                name="normalization"
              >
                <Select>
                  <Option value="none">不标准化</Option>
                  <Option value="tpm">TPM</Option>
                  <Option value="fpkm">FPKM</Option>
                  <Option value="cpm">CPM</Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<LineChartOutlined />}
                  loading={analyzing}
                  disabled={fileList.length === 0}
                >
                  {analyzing ? '分析中...' : '开始分析'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="分析结果" key="2" disabled={!results}>
          {results && (
            <ErrorBoundary>
              <Card title="分析概览" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div>
                    <Title level={4}>{results.deGenes.total}</Title>
                    <Text>分析基因总数</Text>
                  </div>
                  <div>
                    <Title level={4} style={{ color: '#ff4d4f' }}>{results.deGenes.up}</Title>
                    <Text>上调基因数</Text>
                  </div>
                  <div>
                    <Title level={4} style={{ color: '#1890ff' }}>{results.deGenes.down}</Title>
                    <Text>下调基因数</Text>
                  </div>
                  <div>
                    <Title level={4}>{results.deGenes.notSignificant}</Title>
                    <Text>无显著变化基因数</Text>
                  </div>
                </div>
                
                <Divider>分析参数</Divider>
                
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <div style={{ margin: '0 16px 8px 0' }}>
                    <Text strong>分析算法: </Text>
                    <Text>{results.params.algorithm.toUpperCase()}</Text>
                  </div>
                  <div style={{ margin: '0 16px 8px 0' }}>
                    <Text strong>P值阈值: </Text>
                    <Text>{results.params.pValueCutoff}</Text>
                  </div>
                  <div style={{ margin: '0 16px 8px 0' }}>
                    <Text strong>Log2FC阈值: </Text>
                    <Text>{results.params.logFCCutoff}</Text>
                  </div>
                  <div style={{ margin: '0 16px 8px 0' }}>
                    <Text strong>标准化方法: </Text>
                    <Text>{results.params.normalization.toUpperCase()}</Text>
                  </div>
                </div>
                
                <Divider>下载结果</Divider>
                
                <div>
                  <Button 
                    icon={<FileExcelOutlined />} 
                    style={{ marginRight: 8 }}
                    onClick={() => handleDownload('差异表达基因列表')}
                  >
                    差异表达基因列表
                  </Button>
                  <Button 
                    icon={<FileExcelOutlined />} 
                    style={{ marginRight: 8 }}
                    onClick={() => handleDownload('富集分析结果')}
                  >
                    富集分析结果
                  </Button>
                  <Button 
                    icon={<FileExcelOutlined />}
                    onClick={() => handleDownload('完整分析报告')}
                  >
                    完整分析报告
                  </Button>
                </div>
              </Card>
              
              <Card title="火山图" style={{ marginBottom: 16 }}>
                <div style={{ height: 500 }}>
                  <ReactECharts 
                    option={getVolcanoOption(results.volcanoData)} 
                    style={{ height: '100%' }} 
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              </Card>
              
              <Card title="差异表达基因热图" style={{ marginBottom: 16 }}>
                <div style={{ height: 600 }}>
                  <ReactECharts 
                    option={getHeatmapOption(results.heatmapData, results.xLabels, results.yLabels)} 
                    style={{ height: '100%' }} 
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              </Card>
              
              <Card title="功能富集分析">
                <div style={{ height: 500 }}>
                  <ReactECharts 
                    option={getEnrichmentOption()} 
                    style={{ height: '100%' }} 
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              </Card>
            </ErrorBoundary>
          )}
          
          {!results && (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin tip="加载结果中..." />
            </div>
          )}
        </TabPane>
        
        <TabPane tab="使用帮助" key="3">
          <Card>
            <Title level={4}>差异表达基因分析使用指南</Title>
            <Paragraph>
              差异表达基因(DEG)分析是转录组学研究中的重要步骤，用于识别在不同条件下表达水平显著变化的基因。
              本工具提供了用户友好的界面，支持多种分析算法和可视化方法。
            </Paragraph>
            
            <Title level={5}>1. 数据准备</Title>
            <Paragraph>
              上传表达数据文件，支持的格式包括CSV、TXT、XLSX和TSV。文件应包含以下内容：
              <ul>
                <li>第一列：基因ID或基因名称</li>
                <li>后续列：各样本的表达值（如counts、FPKM或TPM）</li>
              </ul>
              示例数据格式：
              <pre style={{ backgroundColor: '#f5f5f5', padding: 10 }}>
                gene_id,sample1,sample2,sample3,sample4,sample5,sample6
                AT1G01010,1025,1100,980,1500,1600,1450
                AT1G01020,380,400,360,100,120,90
                ...
              </pre>
            </Paragraph>
            
            <Title level={5}>2. 参数设置</Title>
            <Paragraph>
              <ul>
                <li><strong>分析算法</strong>：选择适合您数据的差异表达分析算法</li>
                <li><strong>P值阈值</strong>：设置统计显著性阈值，通常为0.05或0.01</li>
                <li><strong>Log2倍数变化阈值</strong>：设置生物学显著性阈值，通常为1或2</li>
                <li><strong>样本分组信息</strong>：指定各样本所属的实验组，格式为'组名: 样本1,样本2,...'</li>
                <li><strong>数据标准化方法</strong>：选择适合您数据的标准化方法</li>
              </ul>
            </Paragraph>
            
            <Title level={5}>3. 结果解读</Title>
            <Paragraph>
              <ul>
                <li><strong>火山图</strong>：直观展示基因表达变化的统计显著性和生物学显著性</li>
                <li><strong>热图</strong>：展示差异表达基因在各样本中的表达模式</li>
                <li><strong>富集分析</strong>：展示差异表达基因富集的功能类别或通路</li>
              </ul>
            </Paragraph>
            
            <Title level={5}>4. 结果下载</Title>
            <Paragraph>
              分析完成后，您可以下载以下结果文件：
              <ul>
                <li><strong>差异表达基因列表</strong>：包含基因ID、表达值、倍数变化、P值等信息</li>
                <li><strong>富集分析结果</strong>：包含富集的GO术语、KEGG通路等信息</li>
                <li><strong>完整分析报告</strong>：包含所有分析结果和图表</li>
              </ul>
            </Paragraph>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DEGeneAnalysis;