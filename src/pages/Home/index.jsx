import React from 'react'

import { Col, Row, Typography, Card, Space, theme, List, Button, Divider } from 'antd';
import { Link } from 'react-router-dom'
import searchImage1 from '../../images/search/search.jpg';
import { MonitorOutlined, DatabaseOutlined, ToolOutlined, DownloadOutlined } from '@ant-design/icons';
import './index.css'
const { Paragraph, Title } = Typography;

// 提取公共样式常量
const commonStyles = {
  titleText: {
    fontSize: '26px', 
    color: '#2b84a0', 
    fontWeight: 'bold',
  },
  sectionDivider: {
    borderBottom: '2px solid transparent',
    borderBottomColor: '#bfdae3', 
    paddingBottom: '10px', 
    marginBottom: '20px',
  }
};

// 优化快捷工具数据结构
const quickTools = [
  {
    title: (
      <>
        <DatabaseOutlined style={{ fontSize: '120%' }} />
        <span className="tool-title">Search</span>
      </>
    ),
    content: "搜索基因组数据",
    link: '/Search'
  },
  {
    title: (
      <>
        <MonitorOutlined style={{ fontSize: '120%' }} />
        <span className="tool-title">Genomes</span>
      </>
    ),
    content: "浏览基因组信息",
    link: '/Genomes'
  },
  {
    title: (
      <>
        <ToolOutlined style={{ fontSize: '120%' }} />
        <span className="tool-title">Tools</span>
      </>
    ),
    content: "基因组分析工具",
    link: '/Tools'
  },
  {
    title: (
      <>
        <DownloadOutlined style={{ fontSize: '120%' }} />
        <span className="tool-title">Download</span>
      </>
    ),
    content: "下载基因组数据",
    link: '/Download'
  },
];

export default function Home() {
  const {
    token: { colorBgContainer }
  } = theme.useToken();

  return (
    <div className='content-wrapper'>
      <Row gutter={60} className="main-content">
        <Col flex={9}>
          <div>
            <div style={commonStyles.sectionDivider}>
              <span style={commonStyles.titleText}>Genome Browser</span>
              <span className="version-tag">v0.1</span>
              <span style={commonStyles.titleText}>: a comprehensive database</span>
            </div>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginTop: '20px' }}>
              Genome Browser是一个关于构属的基因组数据库，提供三种构属基因组数据的浏览、搜索和分析功能。
              本数据库整合了三种构属的基因组序列、注释信息、SSR标记和其他基因组特征，为研究人员提供便捷的基因组数据访问和分析工具。
            </Paragraph>

            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              <strong>主要特点：</strong>
              <ul>
                <li>提供构属基因组数据的浏览和搜索</li>
                <li>支持基于位置、基因ID和关键词的多维度搜索</li>
                <li>集成SSR标记查找和分析工具</li>
                <li>提供基因组序列比对和可视化功能</li>
                <li>支持基因组数据的批量下载</li>
              </ul>
            </Paragraph>
          </div>
          
          <div style={{...commonStyles.sectionDivider, marginTop: '30px'}}>
            <span style={{...commonStyles.titleText, fontSize: '30px'}}>
              Database Construction
            </span>
          </div>
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
            本数据库整合了来自多个公共资源的基因组数据，包括参考基因组序列、基因注释、SSR标记和其他功能元件。
            数据经过严格的质量控制和标准化处理，确保数据的准确性和一致性。数据库定期更新，以纳入最新的基因组数据和分析结果。
          </Paragraph>

          <div style={{...commonStyles.sectionDivider, marginTop: '30px'}}>
            <span style={{...commonStyles.titleText, fontSize: '30px'}}>
              Available Tools
            </span>
          </div>
          <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="BLASH" bordered={true} style={{ height: '100%' }}>
                  序列相似性搜索工具，支持核苷酸和蛋白质序列比对
                  <div style={{ marginTop: '10px' }}>
                    <Link to="/tools/blash">
                      <Button type="primary" size="small">使用工具</Button>
                    </Link>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="SSR Finder" bordered={true} style={{ height: '100%' }}>
                  简单重复序列(SSR)查找和分析工具
                  <div style={{ marginTop: '10px' }}>
                    <Link to="/tools/ssrfinder">
                      <Button type="primary" size="small">使用工具</Button>
                    </Link>
                  </div>
                </Card>
              </Col>
            </Row>
          </Paragraph>
        </Col>

        <Col flex={2} className="quick-tools-section">
          <h2 style={{...commonStyles.titleText, fontSize: '30px'}}>
            Quick Tools
          </h2>
          <Row gutter={[16, 16]}>
            {quickTools.map(({title, content, link}) => (
              <Col span={12} key={link}>
                <Card title={title} className="tool-card" hoverable>
                  <div>
                    {content}
                    <p />
                    <Link to={link}>
                      <Button type="primary">查看详情 &gt;&gt;</Button>
                    </Link>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ marginTop: '30px' }}>
            <h2 style={{...commonStyles.titleText, fontSize: '24px'}}>
              Statistics
            </h2>
            <Card>
              <ul style={{ paddingLeft: '20px' }}>
                <li>物种数量: </li>
                <li>基因组数据: </li>
                <li>SSR标记: </li>
                <li>分析工具: 4</li>
              </ul>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
