import React from 'react'

import { Col, Row, Typography, Card, Space, theme, List, Button } from 'antd';
import { Route, Switch, Redirect, Link, useHistory } from 'react-router-dom'
import searchImage1 from '../../images/search/search.jpg';
import { MonitorOutlined } from '@ant-design/icons';
import './index.css'
const { Paragraph } = Typography;
const data = [
  {
    title: (
      <>
        <MonitorOutlined style={{ fontSize: '120%' }} />&nbsp;&nbsp;&nbsp;
        {/* <img src={searchImage1} width="10%" height="10%" alt="" /> */}
        Search
      </>
    ),
    content: (
      <div>
        Content 1
        <p></p>
        <Link to='/Search'><Button type="primary" >查看详情 &nbsp;&gt;&gt;</Button></Link>
      </div>
    )
  },
  {
    title: (
      <>
        <MonitorOutlined />&nbsp;&nbsp;&nbsp;&nbsp;Genomes
      </>
    ),
    content: (
      <div>
        Content 2
        <p></p>
        <Link to='/Genomes'><Button type="primary" >查看详情 &nbsp;&gt;&gt;</Button></Link>
      </div>
    )
  },
];

export default function Home() {

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()


  return (
    <div className='contend-div-height' style={{
      // marginTop: '50px',
      backgroundColor: 'white',
      padding: '20px',
      paddingLeft: '50px',
      // border: '1px solid #2b84a0'
    }}>
      <Row gutter={60} style={{
        marginTop: '50px'
      }}
      >
        <Col flex={9} style={{
          // borderRight: '1px solid #2b84a0'
        }} >
          <div>
            <div style={{
              borderBottom: '2px solid transparent',
              borderBottomColor: '#bfdae3', paddingBottom: '10px', marginBottom: '20px',
            }} >
              <span style={{
                fontSize: '26px', color: '#2b84a0', fontWeight: 'bold',
                backgroundColor: "none"
              }}>TEST  </span>
              <span style={{ fontSize: '14px', color: '#2b84a0', fontWeight: 'bold' }}>v0.1  </span>
              <span style={{ fontSize: '26px', color: '#2b84a0', fontWeight: 'bold' }}>: a database</span>
            </div>
            <Paragraph>
              &nbsp;&nbsp;
              <span style={{ fontWeight: "bold", fontSize: '30px' }}>
                &nbsp;&nbsp;{}
              </span>

              <span style={{ fontWeight: 'bold' }}>
                &nbsp;&nbsp;
              </span>

              <span style={{ fontWeight: 'bold' }}>
                &nbsp;&nbsp;
              </span>

            </Paragraph>
          </div>
          <div style={{
            marginTop: '30px',
            marginBottom: '16px', borderBottom: '2px solid transparent',
            borderBottomColor: '#bfdae3', paddingBottom: '10px',
          }}>
            <span style={{
              fontSize: '30px', color: '#2b84a0', fontWeight: 'bold',
              backgroundColor: "none"
            }}>Database Construction</span>
          </div>

        </Col>

        <Col flex={2} style={{
          paddingLeft: '70px',
        }}>

          <div style={{
            fontSize: '30px',
            color: '#2b84a0',
            fontWeight: 'bold',
            marginBottom: '16px',
          }}>
            Quick Tools
          </div>
          <List
            dataSource={data}
            renderItem={item => (
              <List.Item>
                <Space direction="vertical" style={{
                  flex: 1,
                }}>
                  <Card
                    title={item.title}
                  >
                    {item.content}
                  </Card>
                </Space>
              </List.Item>
            )}
          />
        </Col>








      </Row>



      {/* <Row style={{ marginTop: '50px' }}>
        <Col span={3} />
        <Col span={13}>
          <div style={{
            marginBottom: '16px', borderBottom: '2px solid transparent',
            borderBottomColor: '#bfdae3', paddingBottom: '10px', marginBottom: '20px',
          }}>
            <span style={{
              fontSize: '30px', color: '#2b84a0', fontWeight: 'bold',
              backgroundColor: "none"
            }}>Database Construction</span>
          </div>
          <Image
            width={900}
            src={homeImage1}
            preview={{ mask: <div style={{ background: 'rgba(0, 0, 0, 0.6)' }} /> }}
          />
        </Col>
        <Col span={3}>
          <div style={{ paddingLeft: '50px' }}>
            <div style={{ fontSize: '30px', color: '#2b84a0', fontWeight: 'bold', marginBottom: '16px' }}>
              News and Updates
            </div>
            <div style={{ marginBottom: '16px' }}>
              <ApiTwoTone /> 2023.08 The database is online
            </div>
            <div style={{ marginBottom: '16px' }}>
              <ApiTwoTone /> 2023.04 Database construction
            </div>
            <div style={{ marginBottom: '16px' }}>
              <ApiTwoTone /> 2022.12 Datasets collection
            </div>

            <div style={{ fontSize: '30px', color: '#2b84a0', fontWeight: 'bold', marginBottom: '16px' }}>
              Citation
            </div>
          </div>
        </Col>
        <Col span={3} />
      </Row> */}
    </div >
  )
}
