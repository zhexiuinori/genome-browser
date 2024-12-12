import React from 'react';
import './index.css';
import { LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { Collapse, Divider, Avatar, List, Space, Row, Col, Input, Card } from 'antd';
const { Search } = Input
const { Panel } = Collapse;
const data = Array.from({
  length: 23,
}).map((_, i) => ({
  href: 'https://ant.design',
  title: `ant design part ${i}`,
  avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
  description:
    'Ant Design, a design language for background applications, is refined by Ant UED Team.',
  content:
    'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
}));

const App = () => (
  <div className="contend-div-height" style={{
    backgroundColor: 'white',
    border: '1px solid #2b84a0'
  }}>
    <Row gutter={70} style={{
      padding: '35px',

    }}> 
      <Col span={5} >
        <Collapse accordion bordered={false}  prefixCls='col-1'>
          <Panel header="Genomes" size="small" style={{ 
            // backgroundColor: '#2b84a0',
            color: 'white',
            header:'',
           }}>
            <div >
                AFSDFSD
            </div>
          </Panel>
        </Collapse>


      </Col>
      <Col span={18} style={{
        // borderLeft:"1px solid #2b84a0"
      }}>
        <List
          split="true"
          itemLayout="vertical"
          size="small"
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            showQuickJumper: true,
            pageSizeOptions: [10, 20, 50],
            showSizeChanger: true,
            position: 'both',
            align: 'center',
          }}
          dataSource={data}
          grid={{
            column: 2,
          }}
          renderItem={(item) => (
            <List.Item
              key={item.title}

            >
              <Card
                title={item.title}
                style={{
                  padding: '25px',
                  // borderColor: '#2b84a0',
                  // backgroundColor: '	#ADD8E6',
                  margin: '10px'
                }}
                cover={
                  <img
                  style={{objectFit:"cover"}}
                    
                    width="100%"
                    height=" 100%"
                    alt="logo"
                    src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                  />
                }
              >
                {item.content}
              </Card>
            </List.Item>
          )}
        />
      </Col>
    </Row>

  </div>

);
export default App;