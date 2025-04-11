import React, { useEffect, useState, useRef } from 'react';
import { Table, Collapse, Button, Input, Space, Typography, Card, Row, Col } from 'antd';
import qs from 'qs';
import { SearchOutlined, DownloadOutlined, DatabaseOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import './index.css';

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

// 构属基因组数据
const genomesData = [
  {
    key: '1',
    name: 'Broussonetia monoica',
    version: 'v1.0',
    size: '1.2 GB',
    date: '2023-05-15',
    type: '全基因组',
    download: 'https://example.com/download/broussonetia_monoica_v1.0.tar.gz',
  },
  {
    key: '2',
    name: 'Broussonetia kaempferi',
    version: 'v1.0',
    size: '980 MB',
    date: '2023-04-10',
    type: '全基因组',
    download: 'https://example.com/download/broussonetia_kaempferi_v1.0.tar.gz',
  },
  {
    key: '3',
    name: 'Broussonetia papyrifera',
    version: 'v1.0',
    size: '1.1 GB',
    date: '2023-03-22',
    type: '全基因组',
    download: 'https://example.com/download/broussonetia_papyrifera_v1.0.tar.gz',
  }
];

// 示例数据 - 资源数据
const resourcesData = [
  {
    key: '1',
    name: 'SSR 标记数据集',
    description: '构属植物的简单重复序列标记数据',
    size: '250 MB',
    date: '2023-06-01',
    format: 'CSV, FASTA',
    download: 'https://example.com/download/ssr_markers.tar.gz',
  },
  {
    key: '2',
    name: '基因注释数据',
    description: '构属植物基因组注释信息',
    size: '420 MB',
    date: '2023-05-20',
    format: 'GFF3, BED',
    download: 'https://example.com/download/gene_annotations.tar.gz',
  },
  {
    key: '3',
    name: '蛋白质序列数据',
    description: '构属植物预测的蛋白质序列',
    size: '180 MB',
    date: '2023-04-15',
    format: 'FASTA',
    download: 'https://example.com/download/protein_sequences.tar.gz',
  },
  {
    key: '4',
    name: '转录组数据',
    description: '构属植物的RNA-Seq数据',
    size: '1.5 GB',
    date: '2023-03-10',
    format: 'FASTQ',
    download: 'https://example.com/download/transcriptome_data.tar.gz',
  },
];

const App = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`搜索 ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            搜索
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            重置
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            筛选
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            关闭
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#2b84a0' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  // 基因组数据表格列定义
  const genomesColumns = [
    {
      title: '物种名称',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      ...getColumnSearchProps('name'),
      render: (text) => <span style={{ fontStyle: 'italic' }}>{text}</span>,
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: '10%',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: '10%',
    },
    {
      title: '发布日期',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
    },
    {
      title: '下载',
      key: 'download',
      width: '15%',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          href={record.download}
        >
          下载
        </Button>
      ),
    },
  ];

  // 资源数据表格列定义
  const resourcesColumns = [
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      ...getColumnSearchProps('name'),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: '10%',
    },
    {
      title: '更新日期',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      width: '10%',
    },
    {
      title: '下载',
      key: 'download',
      width: '15%',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          href={record.download}
        >
          下载
        </Button>
      ),
    },
  ];

  return (
    <div className='contend-div-height download-container'>
      <div className="download-header">
        <Title level={2}>数据下载中心</Title>
        <Paragraph>
          本页面提供构属植物基因组数据和相关资源的下载。所有数据均为最新版本，定期更新。
          如需引用数据，请参考各数据集的引用指南。
        </Paragraph>
      </div>

      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Card 
            title={
              <div className="section-title">
                <DatabaseOutlined /> 基因组数据
              </div>
            }
            className="download-card"
          >
            <Table
              columns={genomesColumns}
              dataSource={genomesData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [5, 10, 20],
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              bordered
              className="download-table"
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card 
            title={
              <div className="section-title">
                <DatabaseOutlined /> 其他资源
              </div>
            }
            className="download-card"
          >
            <Table
              columns={resourcesColumns}
              dataSource={resourcesData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [5, 10, 20],
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              bordered
              className="download-table"
            />
          </Card>
        </Col>
      </Row>

      <div className="download-footer">
        <Card className="download-note">
          <Title level={4}>数据使用说明</Title>
          <Paragraph>
            1. 所有数据仅供学术研究使用，请勿用于商业目的。
          </Paragraph>
          <Paragraph>
            2. 使用本数据库的数据进行研究发表论文时，请引用相关文献。
          </Paragraph>
          <Paragraph>
            3. 如有数据相关问题，请通过"联系我们"页面与我们取得联系。
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};

export default App;