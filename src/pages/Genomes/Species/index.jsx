import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Spin, Descriptions, Typography, Image, Input, Select, Button, Table } from 'antd';
import { BookOutlined, GlobalOutlined, ExperimentOutlined, DatabaseOutlined, CaretDownOutlined } from '@ant-design/icons';
import './index.css';
import ReactEcharts from 'echarts-for-react';

const { Title, Paragraph } = Typography;

const CollapsibleCard = ({ title, children, defaultExpanded = true }) => {
    const [isCollapsed, setIsCollapsed] = useState(!defaultExpanded);

    return (
        <Card 
            className="species-card"
            style={{ marginBottom: '1px', width: '100%' }}
            title={
                <div className="card-header" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <span>{title}</span>
                    <CaretDownOutlined className={`arrow-icon ${isCollapsed ? 'collapsed' : ''}`} />
                </div>
            }
            headStyle={{ padding: 0, width: '100%' }}
            bodyStyle={{ 
                padding: isCollapsed ? 0 : '24px',
                width: '100%'
            }}
        >
            <div className={`ant-card-body ${isCollapsed ? 'collapsed' : ''}`}>
                {children}
            </div>
        </Card>
    );
};

const SpeciesDetail = () => {
    const { name } = useParams();
    const [speciesData, setSpeciesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ssrStats, setSsrStats] = useState(null);
    const [ssrLengthStats, setSsrLengthStats] = useState(null);
    const [ssrBasicInfo, setSsrBasicInfo] = useState([]); 
    const [tableLoading, setTableLoading] = useState(false);
    const [pageSize, setPageSize] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchSpeciesDetail = async () => {
            try {
                const response = await fetch(`/api/species/species/${name}`);
                const result = await response.json();
                setSpeciesData(result.data);
            } catch (error) {
                console.error('获取物种详情失败:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSSRStats = async () => {
            try {
                setTableLoading(true);
                const shortName = name.toLowerCase().replace('broussonetia ', '');
                const [sequenceResponse, lengthResponse, basicInfoResponse] = await Promise.all([
                    fetch(`/api/ssrmarkers/stats/${shortName}/repeat-sequence`),
                    fetch(`/api/ssrmarkers/stats/${shortName}/repeat-length`),
                    fetch(`/api/ssrmarkers/stats/${shortName}/basic-info`)
                ]);
                
                const [sequenceData, lengthData, basicInfoData] = await Promise.all([
                    sequenceResponse.json(),
                    lengthResponse.json(),
                    basicInfoResponse.json()
                ]);

                setSsrStats(sequenceData);
                setSsrLengthStats(lengthData);
                
                const basicInfoArray = Object.values(basicInfoData || {})
                    .flat()
                    .map((item, index) => ({
                        ...item,
                        key: index,
                        repeat_info: Array.isArray(item.repeat_info) ? item.repeat_info.join(', ') : item.repeat_info
                    }));
                setSsrBasicInfo(basicInfoArray);
            } catch (error) {
                console.error('获取SSR统计数据失败:', error);
            } finally {
                setTableLoading(false);
            }
        };

        fetchSpeciesDetail();
        fetchSSRStats();
    }, [name]);

    const getSSRChartOption = () => {
        if (!ssrStats) return {};
        
        // 获取所有序列类型并排序
        const allSequenceTypes = new Set();
        Object.values(ssrStats).forEach(stats => {
            stats.forEach(item => allSequenceTypes.add(item._id));
        });
        const xAxisData = Array.from(allSequenceTypes).sort();  // 排序序列类型

        // 按染色体编号排序
        const sortedChromosomes = Object.keys(ssrStats).sort((a, b) => {
            const numA = parseInt(a.replace('chr', ''));
            const numB = parseInt(b.replace('chr', ''));
            return numA - numB;
        });

        // 处理每个数据系列
        const series = sortedChromosomes.map(key => {
            const value = ssrStats[key];
            const countMap = Object.fromEntries(value.map(item => [item._id, item.count]));
            
            return {
                name: key,
                type: 'line',
                smooth: true,
                data: xAxisData.map(type => countMap[type] || 0),
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    width: 2
                }
            };
        });

        return {
            title: {
                text: 'SSR序列分布',
                left: 'center',
                top: 10,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    let result = `${params[0].axisValue}<br/>`;
                    params.forEach(param => {
                        result += `${param.seriesName}: ${param.value}<br/>`;
                    });
                    return result;
                },
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                type: 'scroll',
                data: sortedChromosomes,  // 使用排序后的染色体列表
                top: 40,
                right: 10,
                orient: 'vertical',
                textStyle: {
                    fontSize: 12
                }
            },
            grid: {
                left: '5%',
                right: '15%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            dataZoom: [
                {
                    type: 'slider',
                    show: true,
                    xAxisIndex: [0],
                    start: 0,
                    end: 100,
                    bottom: 10
                },
                {
                    type: 'inside',
                    xAxisIndex: [0],
                    start: 0,
                    end: 100
                }
            ],
            xAxis: {
                type: 'category',
                data: xAxisData,
                name: '序列类型',
                nameLocation: 'middle',
                nameGap: 35,
                axisLabel: {
                    rotate: 45,
                    interval: 0,
                    fontSize: 10
                }
            },
            yAxis: {
                type: 'value',
                name: '数量',
                nameLocation: 'middle',
                nameGap: 40,
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            series: series
        };
    };

    const getLengthStatsChartOption = () => {
        if (!ssrLengthStats) return {};

        // 按染色体编号排序
        const sortedChromosomes = Object.keys(ssrLengthStats).sort((a, b) => {
            const numA = parseInt(a.replace('chr', ''));
            const numB = parseInt(b.replace('chr', ''));
            return numA - numB;
        });

        // 定义重复类型的顺序
        const repeatTypes = ['单碱基重复', '双碱基重复', '三碱基重复', '多碱基重复'];

        // 处理每个数据系列
        const series = sortedChromosomes.map(key => {
            const value = ssrLengthStats[key];
            // 创建一个映射以确保数据按正确顺序排列
            const countMap = Object.fromEntries(value.map(item => [item._id, item.count]));
            
            return {
                name: key,
                type: 'bar',
                data: repeatTypes.map(type => ({
                    name: type,
                    value: countMap[type] || 0
                })),
                label: {
                    show: true,
                    position: 'top'
                }
            };
        });

        return {
            title: {
                text: 'SSR重复序列长度分布',
                left: 'center',
                top: 10,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                type: 'scroll',
                data: sortedChromosomes,  // 使用排序后的染色体列表
                top: 40,
                right: 10,
                orient: 'vertical',
                textStyle: {
                    fontSize: 12
                }
            },
            grid: {
                left: '5%',
                right: '15%',
                bottom: '15%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: repeatTypes,  // 使用固定顺序的重复类型
                axisLabel: {
                    interval: 0,
                    fontSize: 12
                }
            },
            yAxis: {
                type: 'value',
                name: '数量',
                nameLocation: 'middle',
                nameGap: 40,
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                }
            },
            series: series
        };
    };

    const columns = React.useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'ID',
            key: 'ID',
            width: 120,
        },
        {
            title: 'Seqid',
            dataIndex: 'seqid',
            key: 'seqid',
            width: 100,
            filters: Array.isArray(ssrBasicInfo) ? 
                [...new Set(ssrBasicInfo.map(item => item.seqid))]
                    .filter(Boolean)
                    .map(seq => ({ 
                        text: seq, 
                        value: seq 
                    })) 
                : [],
            onFilter: (value, record) => record.seqid === value,
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            width: 100,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120,
        },
        {
            title: 'Start',
            dataIndex: 'start',
            key: 'start',
            width: 100,
        },
        {
            title: 'End',
            dataIndex: 'end',
            key: 'end',
            width: 100,
        },
        {
            title: 'Repeat Info',
            dataIndex: 'repeat_info',
            key: 'repeat_info',
            width: 150,
        },
        {
            title: 'Repeat Sequence',
            dataIndex: 'repeat_sequence',
            key: 'repeat_sequence',
            width: 150,
        },
        {
            title: 'Repeat Count',
            dataIndex: 'repeat_count',
            key: 'repeat_count',
            width: 100,
        }
    ], [ssrBasicInfo]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className='contend-div-height' style={{ backgroundColor: 'white', minHeight: '800px', width: '100%' }}>
            <Row style={{ padding: '35px', width: '100%' }}>
                <Col span={24} style={{ width: '100%' }}>
                    <CollapsibleCard title="Overview" defaultExpanded={true}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Image
                                    alt={speciesData?.title}
                                    src={speciesData?.imageUrl}
                                    style={{
                                        width: '100%',
                                        borderRadius: '8px'
                                    }}
                                    fallback="/images/species/default.jpg"
                                />
                            </Col>
                            <Col span={12}>
                            <em><Title level={2}>{speciesData?.title}</Title></em>
                                <Paragraph style={{ marginTop: '20px' }}>
                                    {speciesData?.description}
                                </Paragraph>
                            </Col>
                        </Row>
                    </CollapsibleCard>


                    <CollapsibleCard title={<><DatabaseOutlined />SSR Information </>}>
                        {ssrStats && ssrLengthStats ? (
                            <>
                                <ReactEcharts 
                                    option={getSSRChartOption()} 
                                    style={{ height: '400px', width: '100%' }}
                                    notMerge={true}
                                    lazyUpdate={true}
                                />
                                <ReactEcharts 
                                    option={getLengthStatsChartOption()} 
                                    style={{ height: '400px', width: '100%', marginTop: '20px' }}
                                    notMerge={true}
                                    lazyUpdate={true}
                                />
                                <Paragraph style={{ marginTop: '20px' }}>
                                    上图显示了不同SSR序列的分布情况，下图显示了不同长度SSR序列的分布情况。
                                </Paragraph>
                            </>
                        ) : (
                            <Spin />
                        )}
                    </CollapsibleCard>

                    <CollapsibleCard title={<><GlobalOutlined /> SSR Basic Information</>}>
                        <Table 
                            loading={tableLoading}
                            dataSource={ssrBasicInfo}
                            columns={columns}
                            pagination={{
                                current: currentPage,
                                pageSize: pageSize,
                                total: ssrBasicInfo?.length || 0,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `共 ${total} 条数据`,
                                onChange: (page, size) => {
                                    setCurrentPage(page);
                                    setPageSize(size);
                                },
                                onShowSizeChange: (current, size) => {
                                    setPageSize(size);
                                    setCurrentPage(1);
                                },
                                pageSizeOptions: ['10', '15', '30', '50', '100'],
                                position: ['bottomRight']
                            }}
                            scroll={{ x: 1500, y: 500 }}
                            size="small"
                            bordered={false}
                        />
                    </CollapsibleCard>

                    <CollapsibleCard title={<><ExperimentOutlined /> search </>}>
                    <Row gutter={24}>
                            <Col span={6}>
                                <div style={{ marginBottom: '20px' }}>
                                    <h4>SSR ID/Name</h4>
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Potri.001G000400"
                                        allowClear
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4>Protein ID/Name</h4>
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Search Protein ID..."
                                        allowClear
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4>Product Description</h4>
                                    <Input.Search
                                        placeholder="Search description..."
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4>Position</h4>
                                    <div style={{ marginBottom: '10px' }}>
                                        <Select 
                                            style={{ width: '100%' }}
                                            placeholder="Chr"
                                        />
                                    </div>
                                    <Input 
                                        placeholder="From"
                                        style={{ marginBottom: '10px' }}
                                    />
                                    <Input 
                                        placeholder="To"
                                        style={{ marginBottom: '10px' }}
                                    />
                                    <Row gutter={12}>
                                        <Col span={12}>
                                            <Button type="primary" style={{ width: '100%' }}>Submit</Button>
                                        </Col>
                                        <Col span={12}>
                                            <Button style={{ width: '100%' }}>Reset</Button>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>

                            <Col span={18}>
                                <Card>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th>SSR ID</th>
                                                <th>Gene symbol</th>
                                                <th>Chr</th>
                                                <th>Position</th>
                                                <th>Product</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* 这里可以遍历数据生成表格行 */}
                                            {speciesData?.ssrBasicInfo?.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.geneId}</td>
                                                    <td>{item.geneSymbol}</td>
                                                    <td>{item.chr}</td>
                                                    <td>{item.position}</td>
                                                    <td>{item.product}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Card>
                            </Col>
                        </Row>
                    </CollapsibleCard>

                    <CollapsibleCard title="">

                    </CollapsibleCard>
                </Col>
            </Row>
        </div>
    );
};

export default SpeciesDetail;