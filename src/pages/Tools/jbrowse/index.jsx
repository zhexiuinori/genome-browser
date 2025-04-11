import React, { useState, useEffect, useRef, Component } from 'react';
import { Typography, Card, Select, Button, Space, Row, Col, Input, Divider, Spin, message, Tabs, Tooltip, Alert } from 'antd';
import { SearchOutlined, ZoomInOutlined, ZoomOutOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { createViewState, JBrowseLinearGenomeView } from '@jbrowse/react-linear-genome-view';

// 错误边界组件，用于捕获JBrowse渲染错误
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新状态，下一次渲染将显示错误UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息，便于调试
    console.error('JBrowse组件错误:', error);
    console.error('错误详情:', errorInfo);
    this.setState({ errorInfo });
    
    // 记录更详细的错误信息，特别是轨道相关的错误
    if (error.message && error.message.includes('track')) {
      console.error('轨道相关错误:', error.message);
      // 可以在这里添加特定于轨道错误的处理逻辑
    }
    
    // 可以在这里添加错误上报逻辑
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误UI
      return this.props.fallback || (
        <div style={{ padding: 20 }}>
          <Alert
            message="基因组浏览器加载错误"
            description={
              <div>
                <p>加载基因组浏览器时发生错误，请尝试以下操作：</p>
                <ul>
                  <li>刷新页面</li>
                  <li>选择其他基因组或轨道</li>
                  <li>检查网络连接</li>
                </ul>
                <p><strong>可能的原因：</strong></p>
                <ul>
                  {this.state.error && this.state.error.message && this.state.error.message.includes('track') && (
                    <li>轨道配置错误：您选择的轨道可能不兼容或数据格式有问题</li>
                  )}
                  {this.state.error && this.state.error.message && this.state.error.message.includes('assembly') && (
                    <li>基因组配置错误：所选基因组可能不可用或数据格式有问题</li>
                  )}
                  {this.state.error && this.state.error.message && this.state.error.message.includes('adapter') && (
                    <li>数据适配器错误：无法加载或解析基因组数据</li>
                  )}
                </ul>
                {process.env.NODE_ENV !== 'production' && this.state.error && (
                  <details style={{ whiteSpace: 'pre-wrap' }}>
                    <summary>错误详情</summary>
                    {this.state.error.toString()}
                    <br />
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </details>
                )}
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }

    return this.props.children;
  }
}

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

// 默认配置
const defaultAssembly = {
  name: 'Broussonetia papyrifera',
  sequence: {
    type: 'ReferenceSequenceTrack',
    trackId: 'Broussonetia_papyrifera-ReferenceSequenceTrack',
    adapter: {
      type: 'BgzipFastaAdapter',
      fastaLocation: {
        uri: 'https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz'
      },
      faiLocation: {
        uri: 'https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.fai'
      },
      gziLocation: {
        uri: 'https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.gzi'
      }
    }
  },
  aliases: ['Broussonetia papyrifera', 'Paper mulberry']
};

const defaultTracks = [
  {
    type: 'FeatureTrack',
    trackId: 'genes',
    name: '基因注释',
    assemblyNames: ['Broussonetia_papyrifera'],
    adapter: {
      type: 'Gff3TabixAdapter',
      gffGzLocation: {
        uri: 'https://jbrowse.org/genomes/hg19/ncbi_refseq/GRCh37_latest_genomic.sort.gff.gz'
      },
      index: {
        location: {
          uri: 'https://jbrowse.org/genomes/hg19/ncbi_refseq/GRCh37_latest_genomic.sort.gff.gz.tbi'
        }
      }
    }
  },
  {
    type: 'VariantTrack',
    trackId: 'variants',
    name: '变异位点',
    assemblyNames: ['Broussonetia_papyrifera'],
    adapter: {
      type: 'VcfTabixAdapter',
      vcfGzLocation: {
        uri: 'https://jbrowse.org/genomes/hg19/variants/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5b.20130502.sites.vcf.gz'
      },
      index: {
        location: {
          uri: 'https://jbrowse.org/genomes/hg19/variants/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5b.20130502.sites.vcf.gz.tbi'
        }
      }
    }
  }
];

const defaultLocation = 'chr1:1-100000';

const JBrowse = () => {
  const [loading, setLoading] = useState(true);
  const [assembly, setAssembly] = useState(defaultAssembly);
  const [tracks, setTracks] = useState(defaultTracks);
  const [location, setLocation] = useState(defaultLocation);
  const [availableAssemblies, setAvailableAssemblies] = useState([]);
  const [availableTracks, setAvailableTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const jbrowseViewRef = useRef(null);

  // 创建JBrowse视图状态
  const assemblyId = assembly.name.replace(/ /g, '_');
  
  // 确保tracks有正确的assemblyNames
  const configuredTracks = tracks.map(track => ({
    ...track,
    assemblyNames: [assemblyId]
  }));

  // 创建JBrowse视图状态，使用更符合JBrowse要求的配置格式
  const state = createViewState({
    assembly: {
      name: assemblyId,
      sequence: {
        type: 'ReferenceSequenceTrack',
        trackId: `${assemblyId}-ReferenceSequenceTrack`,
        adapter: {
          type: 'BgzipFastaAdapter',
          fastaLocation: {
            uri: 'https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz'
          },
          faiLocation: {
            uri: 'https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.fai'
          },
          gziLocation: {
            uri: 'https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.gzi'
          }
        }
      }
    },
    tracks: configuredTracks,
    location,
    defaultSession: {
      name: 'My session',
      view: {
        id: 'linearGenomeView',
        type: 'LinearGenomeView',
        tracks: configuredTracks.map(track => {
          // 为每种轨道类型创建正确的显示配置
          const displayType = track.type === 'FeatureTrack' ? 'LinearBasicDisplay' : 
                             track.type === 'VariantTrack' ? 'LinearVariantDisplay' : 
                             track.type === 'QuantitativeTrack' ? 'LinearWiggleDisplay' : 
                             'LinearBasicDisplay';
          
          // 创建配置ID，确保与轨道ID匹配
          const configId = `${track.trackId}-${displayType}`;
          
          return {
            type: track.type,
            trackId: track.trackId,
            displays: [
              {
                type: displayType,
                configuration: configId
              }
            ]
          };
        })
      }
    }
  });

  // 模拟加载可用的基因组和轨道数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 这里应该是实际的API调用
        // 由于后端API尚未实现，使用模拟数据
        setTimeout(() => {
          setAvailableAssemblies([
            { id: 'Broussonetia_papyrifera', name: 'Broussonetia papyrifera' },
            { id: 'Broussonetia_kaempferi', name: 'Broussonetia kaempferi' },
            { id: 'Broussonetia_monoica', name: 'Broussonetia monoica' }
          ]);
          
          setAvailableTracks([
            { id: 'genes', name: '基因注释', type: 'FeatureTrack' },
            { id: 'variants', name: '变异位点', type: 'VariantTrack' },
            { id: 'expression', name: '基因表达', type: 'QuantitativeTrack' },
            { id: 'methylation', name: 'DNA甲基化', type: 'QuantitativeTrack' },
            { id: 'repeats', name: '重复序列', type: 'FeatureTrack' }
          ]);
          
          setSelectedTracks(['genes', 'variants']);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('加载数据失败:', error);
        message.error('加载基因组数据失败');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 处理基因组切换
  const handleAssemblyChange = (value) => {
    setLoading(true);
    console.log(`切换基因组到: ${value}`);
    
    // 这里应该是实际的API调用来获取新的基因组数据
    // 由于后端API尚未实现，使用模拟数据
    setTimeout(() => {
      try {
        // 创建新的assembly对象
        const newAssembly = {
          ...defaultAssembly,
          name: value
        };
        
        // 更新assembly状态
        setAssembly(newAssembly);
        
        // 更新tracks的assemblyNames
        const assemblyId = value.replace(/ /g, '_');
        const updatedTracks = tracks.map(track => ({
          ...track,
          assemblyNames: [assemblyId]
        }));
        
        setTracks(updatedTracks);
        setLoading(false);
        message.success(`已切换到 ${value} 基因组`);
      } catch (error) {
        console.error('切换基因组时出错:', error);
        message.error(`切换基因组失败: ${error.message}`);
        setLoading(false);
      }
    }, 1000);
  };

  // 处理轨道选择
  const handleTrackChange = (selectedTrackIds) => {
    setSelectedTracks(selectedTrackIds);
    const assemblyId = assembly.name.replace(/ /g, '_');
    
    const newTracks = availableTracks
      .filter(track => selectedTrackIds.includes(track.id))
      .map(track => {
        // 根据轨道类型返回不同的配置
        const baseConfig = {
          type: track.type,
          trackId: track.id,
          name: track.name,
          assemblyNames: [assemblyId] // 确保使用正确的assemblyId
        };
        
        // 为不同类型的轨道添加适当的适配器
        if (track.type === 'FeatureTrack') {
          return {
            ...baseConfig,
            adapter: {
              type: 'Gff3TabixAdapter',
              gffGzLocation: {
                uri: 'https://jbrowse.org/genomes/hg19/ncbi_refseq/GRCh37_latest_genomic.sort.gff.gz'
              },
              index: {
                location: {
                  uri: 'https://jbrowse.org/genomes/hg19/ncbi_refseq/GRCh37_latest_genomic.sort.gff.gz.tbi'
                }
              }
            }
          };
        } else if (track.type === 'VariantTrack') {
          return {
            ...baseConfig,
            adapter: {
              type: 'VcfTabixAdapter',
              vcfGzLocation: {
                uri: 'https://jbrowse.org/genomes/hg19/variants/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5b.20130502.sites.vcf.gz'
              },
              index: {
                location: {
                  uri: 'https://jbrowse.org/genomes/hg19/variants/ALL.wgs.phase3_shapeit2_mvncall_integrated_v5b.20130502.sites.vcf.gz.tbi'
                }
              }
            }
          };
        } else if (track.type === 'QuantitativeTrack') {
          return {
            ...baseConfig,
            adapter: {
              type: 'BigWigAdapter',
              bigWigLocation: {
                uri: 'https://jbrowse.org/genomes/hg19/tracks/bigwig/example.bw'
              }
            }
          };
        }
        
        return baseConfig;
      });
    setTracks(newTracks);
    
    // 添加日志，帮助调试轨道变化
    console.log('轨道已更新:', newTracks);
    
    // 强制重新渲染JBrowse组件
    if (jbrowseViewRef.current) {
      try {
        // 尝试使用JBrowse API更新轨道
        jbrowseViewRef.current.setNewView({
          tracks: newTracks.map(track => {
            // 为每种轨道类型创建正确的显示配置
            const displayType = track.type === 'FeatureTrack' ? 'LinearBasicDisplay' : 
                              track.type === 'VariantTrack' ? 'LinearVariantDisplay' : 
                              track.type === 'QuantitativeTrack' ? 'LinearWiggleDisplay' : 
                              'LinearBasicDisplay';
            
            // 创建配置ID，确保与轨道ID和显示类型匹配
            const trackId = track.id || track.trackId;
            const configId = `${trackId}-${displayType}`;
            
            return {
              type: track.type,
              trackId: trackId,
              displays: [
                {
                  type: displayType,
                  configuration: configId
                }
              ]
            };
          })
        });
      } catch (error) {
        console.error('更新轨道时出错:', error);
        message.error('更新轨道失败，请尝试刷新页面');
      }
    }
  };

  // 处理位置搜索
  const handleLocationSearch = (value) => {
    if (!value) return;
    
    try {
      // 简单验证位置格式
      const locationRegex = /^(chr\w+):(\d+)-(\d+)$/;
      if (!locationRegex.test(value)) {
        message.error('位置格式无效，请使用格式: chr1:1000-2000');
        return;
      }
      
      setLocation(value);
      message.success(`已导航到 ${value}`);
      
      // 如果有JBrowse视图引用，可以直接调用其方法
      if (jbrowseViewRef.current) {
        jbrowseViewRef.current.navigateTo(value);
      }
    } catch (error) {
      console.error('导航错误:', error);
      message.error('导航到指定位置失败');
    }
  };

  // 处理缩放
  const handleZoom = (zoomIn) => {
    if (jbrowseViewRef.current) {
      if (zoomIn) {
        jbrowseViewRef.current.zoomIn();
      } else {
        jbrowseViewRef.current.zoomOut();
      }
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin tip="正在加载基因组浏览器..." size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>JBrowse 基因组浏览器</Title>
      <Paragraph>
        JBrowse是一个功能强大的基因组浏览器，可用于可视化基因组数据和注释信息。您可以浏览不同物种的基因组序列、基因注释、变异位点等信息。
      </Paragraph>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="基因组浏览" key="1">
          <Card title="控制面板" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>选择基因组:</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={assembly.name}
                  onChange={handleAssemblyChange}
                >
                  {availableAssemblies.map(item => (
                    <Option key={item.id} value={item.name}>{item.name}</Option>
                  ))}
                </Select>
              </Col>
              
              <Col span={8}>
                <Text strong>选择显示轨道:</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="选择要显示的轨道"
                  value={selectedTracks}
                  onChange={handleTrackChange}
                >
                  {availableTracks.map(track => (
                    <Option key={track.id} value={track.id}>{track.name}</Option>
                  ))}
                </Select>
              </Col>
              
              <Col span={8}>
                <Text strong>导航到位置:</Text>
                <Search
                  placeholder="例如: chr1:1000-2000"
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={handleLocationSearch}
                  style={{ marginTop: 8 }}
                />
              </Col>
            </Row>
            
            <Divider style={{ margin: '16px 0' }} />
            
            <Row>
              <Col span={24}>
                <Space>
                  <Tooltip title="放大">
                    <Button icon={<ZoomInOutlined />} onClick={() => handleZoom(true)} />
                  </Tooltip>
                  <Tooltip title="缩小">
                    <Button icon={<ZoomOutOutlined />} onClick={() => handleZoom(false)} />
                  </Tooltip>
                  <Tooltip title="重置视图">
                    <Button icon={<ReloadOutlined />} onClick={() => setLocation(defaultLocation)} />
                  </Tooltip>
                  <Tooltip title="下载当前视图">
                    <Button icon={<DownloadOutlined />} />
                  </Tooltip>
                </Space>
              </Col>
            </Row>
          </Card>
          
          <Card title="基因组视图" bodyStyle={{ padding: 0, height: '600px' }}>
            <div style={{ height: '100%', border: '1px solid #ddd' }}>
              {/* 使用错误边界捕获JBrowse可能的渲染错误 */}
              <ErrorBoundary>
                {/* 添加key属性，确保在assembly或tracks变化时重新渲染组件 */}
                <JBrowseLinearGenomeView 
                  key={`${assembly.name}-${selectedTracks.join('-')}-${tracks.map(t => t.trackId).join('.')}`}
                  viewState={state} 
                  ref={jbrowseViewRef}
                />
              </ErrorBoundary>
            </div>
          </Card>
        </TabPane>
        
        <TabPane tab="使用帮助" key="2">
          <Card>
            <Title level={4}>JBrowse 基因组浏览器使用指南</Title>
            <Paragraph>
              JBrowse是一个交互式的基因组浏览器，允许您可视化和探索基因组数据。以下是基本使用方法：
            </Paragraph>
            
            <Title level={5}>1. 选择基因组</Title>
            <Paragraph>
              从下拉菜单中选择您想要浏览的基因组。目前支持多个构属物种的基因组。
            </Paragraph>
            
            <Title level={5}>2. 选择数据轨道</Title>
            <Paragraph>
              您可以选择多个数据轨道同时显示，包括：
              <ul>
                <li><strong>基因注释</strong> - 显示基因、转录本和外显子的位置</li>
                <li><strong>变异位点</strong> - 显示SNP、插入和缺失等变异</li>
                <li><strong>基因表达</strong> - 显示不同组织或条件下的基因表达水平</li>
                <li><strong>DNA甲基化</strong> - 显示DNA甲基化位点和水平</li>
                <li><strong>重复序列</strong> - 显示重复序列元件的位置</li>
              </ul>
            </Paragraph>
            
            <Title level={5}>3. 导航和缩放</Title>
            <Paragraph>
              <ul>
                <li>使用搜索框导航到特定位置，格式为：chr1:1000-2000</li>
                <li>使用放大/缩小按钮或鼠标滚轮调整视图比例</li>
                <li>点击并拖动可以平移视图</li>
                <li>双击特定位置可以放大该区域</li>
              </ul>
            </Paragraph>
            
            <Title level={5}>4. 查看特征详情</Title>
            <Paragraph>
              点击任何基因或特征可以查看其详细信息，包括名称、位置、功能注释等。
            </Paragraph>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default JBrowse;
