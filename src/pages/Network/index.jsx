import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Select, Button, Spin, Empty } from 'antd';
import ReactEcharts from 'echarts-for-react';
import './index.css';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const Network = () => {
  const [loading, setLoading] = useState(false);
  const [networkData, setNetworkData] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedNetwork, setSelectedNetwork] = useState('gene');

  // 模拟加载网络数据
  useEffect(() => {
    const fetchNetworkData = async () => {
      setLoading(true);
      try {
        // 这里应该是实际的API调用
        // const response = await fetch(`/api/network/${selectedSpecies}/${selectedNetwork}`);
        // const data = await response.json();
        
        // 模拟数据
        setTimeout(() => {
          const mockData = generateMockNetworkData(selectedSpecies, selectedNetwork);
          setNetworkData(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('获取网络数据失败:', error);
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, [selectedSpecies, selectedNetwork]);

  // 生成模拟网络数据
  const generateMockNetworkData = (species, networkType) => {
    const nodes = [];
    const links = [];
    
    // 根据选择的物种和网络类型生成不同的节点数量
    const nodeCount = species === 'all' ? 50 : 30;
    
    // 生成节点
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: `node${i}`,
        name: `${networkType === 'gene' ? 'Gene' : 'Protein'} ${i}`,
        symbolSize: Math.random() * 20 + 10,
        value: Math.floor(Math.random() * 100),
        category: Math.floor(Math.random() * 3)
      });
    }
    
    // 生成连接
    const linkCount = nodeCount * 1.5;
    for (let i = 0; i < linkCount; i++) {
      const source = Math.floor(Math.random() * nodeCount);
      let target = Math.floor(Math.random() * nodeCount);
      // 确保不自连接
      while (target === source) {
        target = Math.floor(Math.random() * nodeCount);
      }
      
      links.push({
        source: `node${source}`,
        target: `node${target}`,
        value: Math.random()
      });
    }
    
    return { nodes, links };
  };

  // 网络图配置
  const getNetworkOption = () => {
    if (!networkData) return {};
    
    return {
      title: {
        text: `${selectedNetwork === 'gene' ? '基因' : '蛋白质'}互作网络`,
        subtext: selectedSpecies === 'all' ? '所有物种' : `物种: ${selectedSpecies}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          if (params.dataType === 'node') {
            return `${params.data.name}<br/>Value: ${params.data.value}`;
          } else {
            return `${params.data.source} → ${params.data.target}<br/>Strength: ${params.data.value.toFixed(2)}`;
          }
        }
      },
      legend: {
        data: ['类别1', '类别2', '类别3'],
        orient: 'vertical',
        right: 10,
        top: 20
      },
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          name: '网络关系',
          type: 'graph',
          layout: 'force',
          data: networkData.nodes,
          links: networkData.links,
          categories: [
            { name: '类别1' },
            { name: '类别2' },
            { name: '类别3' }
          ],
          roam: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}'
          },
          force: {
            repulsion: 100,
            gravity: 0.1,
            edgeLength: 80
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4
            }
          }
        }
      ]
    };
  };

  return (
    <div className="network-container contend-div-height">
      <div className="network-header">
        <Title level={2}>基因组互作网络</Title>
        <Paragraph>
          本页面提供构属植物基因组中基因和蛋白质的互作网络可视化。通过网络图可以直观地了解基因或蛋白质之间的相互作用关系。
        </Paragraph>
      </div>

      <Card className="network-control-card">
        <Row gutter={16}>
          <Col span={8}>
            <div className="control-item">
              <label>选择物种:</label>
              <Select 
                value={selectedSpecies} 
                onChange={setSelectedSpecies}
                style={{ width: '100%' }}
              >
                <Option value="all">所有物种</Option>
                <Option value="broussonetia_monoica">Broussonetia monoica</Option>
                <Option value="broussonetia_kaempferi">Broussonetia kaempferi</Option>
                <Option value="broussonetia_papyrifera">Broussonetia papyrifera</Option>
              </Select>
            </div>
          </Col>
          <Col span={8}>
            <div className="control-item">
              <label>网络类型:</label>
              <Select 
                value={selectedNetwork} 
                onChange={setSelectedNetwork}
                style={{ width: '100%' }}
              >
                <Option value="gene">基因互作网络</Option>
                <Option value="protein">蛋白质互作网络</Option>
              </Select>
            </div>
          </Col>
          <Col span={8}>
            <div className="control-item">
              <Button 
                type="primary" 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    const mockData = generateMockNetworkData(selectedSpecies, selectedNetwork);
                    setNetworkData(mockData);
                    setLoading(false);
                  }, 1000);
                }}
                style={{ marginTop: 24 }}
              >
                更新网络
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="network-visualization-card">
        {loading ? (
          <div className="loading-container">
            <Spin tip="加载网络数据中..." />
          </div>
        ) : networkData ? (
          <ReactEcharts 
            option={getNetworkOption()} 
            style={{ height: '600px', width: '100%' }}
            className="network-chart"
          />
        ) : (
          <Empty description="暂无网络数据" />
        )}
      </Card>

      <Card className="network-info-card">
        <Title level={4}>网络说明</Title>
        <Paragraph>
          • <strong>节点</strong>: 表示基因或蛋白质，节点大小表示其在网络中的重要性。
        </Paragraph>
        <Paragraph>
          • <strong>连线</strong>: 表示基因或蛋白质之间的相互作用关系，线的粗细表示相互作用的强度。
        </Paragraph>
        <Paragraph>
          • <strong>颜色</strong>: 不同颜色代表不同的功能类别或表达模式。
        </Paragraph>
        <Paragraph>
          您可以通过鼠标拖拽调整网络布局，滚轮缩放查看详情。点击节点可以高亮显示与其直接相连的其他节点。
        </Paragraph>
      </Card>
    </div>
  );
};

export default Network;
