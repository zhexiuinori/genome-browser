import React, { useEffect, useState } from 'react';
import { CarryOutOutlined, FormOutlined } from '@ant-design/icons';
import { Input, Tree, Col, Row, Button, Select, Card, List } from 'antd';
import './index.css'
import { useHistory } from 'react-router-dom';
const { Search } = Input
const { Option } = Select

const treeAllId = [

];

const App = () => {
    const history = useHistory();
    const [expandedKeys, setExpandedKeys] = useState(['']);
    const [disabled, setDisabled] = useState(true);
    const [treeData, setTreeData] = useState([]);
    const [listData, setListData] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [filteredListData, setFilteredListData] = useState([]);

    const fetchSpecies = async () => {
        try {
            const response = await fetch('/api/species');
            const result = await response.json();
            
            const dataWithIcons = result.data.tree.map(item => ({
                ...item,
                icon: <CarryOutOutlined />,
                children: item.children?.map(child => ({
                    ...child,
                    icon: <CarryOutOutlined />
                }))
            }));
            
            setTreeData(dataWithIcons);
            setListData(result.data.listData);
            setFilteredListData(result.data.listData);
        } catch (error) {
            console.error('获取物种数据失败:', error);
        }
    };

    useEffect(() => {
        fetchSpecies();
    }, []);

    const onExpand = (newExpandedKeys) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };
    const onChange = (pageNumber) => {
        console.log('Page: ', pageNumber);
    };
    const map = new Map();

    function calleArr(treeData) {
        for (var i in treeData) {
            var data = treeData[i];
            if (data.children) {
                treeAllId.push(data.key)
                calleArr(data.children) //自己调用自己
            } else {
                treeAllId.push(data.key)
            }
        }
    }

    const ExpandOrCloseAllTree = () => {
        treeAllId.length = 0
        calleArr(treeData)
        if (expandedKeys.length === 1) {
            setExpandedKeys(treeAllId)
            console.log(expandedKeys)
        }
        else {
            setExpandedKeys([''])
            console.log(expandedKeys)
        }
    }

    const onSearch = (value) => {
        const expandedKeys = [];
        const loop = (data) => 
            data.forEach((item) => {
                if (item.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                    expandedKeys.push(item.key);
                }
                if (item.children) {
                    loop(item.children);
                }
            });
        
        loop(treeData);
        setExpandedKeys(expandedKeys);
        setSearchValue(value);
        setAutoExpandParent(true);
    };

    const titleRender = (nodeData) => {
        const index = nodeData.title.toLowerCase().indexOf(searchValue.toLowerCase());
        if (index > -1) {
            const beforeStr = nodeData.title.substring(0, index);
            const searchStr = nodeData.title.substring(index, index + searchValue.length);
            const afterStr = nodeData.title.substring(index + searchValue.length);
            return (
                <span>
                    {beforeStr}
                    <span style={{ color: '#f50' }}>{searchStr}</span>
                    {afterStr}
                </span>
            );
        }
        return <span>{nodeData.title}</span>;
    };

    const onSelect = (selectedKeys, info) => {
        const selectedTitle = info.node.title;
        setSelectedNode(selectedTitle);

        if (selectedTitle === 'Broussonetia') {
            setFilteredListData(listData);
            return;
        }

        const filtered = listData.filter(item => 
            item.title.includes(selectedTitle)
        );
        setFilteredListData(filtered);
    };

    const handleCardClick = (item) => {
        history.push(`/species/${item.title}`);
    };

    return (
        <div className='contend-div-height' 
        style={{
            backgroundColor: 'white',
            minHeight: '800px',
            // border: '1px solid #2b84a0'
        }}
        >
            <Row gutter={70} style={{
                padding: '35px',

            }}
            >
                <Col span={5} style={{

                }}>
                    <div style={{
                        fontSize: '30px',
                        color: '#2b84a0',
                        fontWeight: 'bold',
                        marginBottom: '16px',
                        marginLeft: '16px',
                    }}>
                        Quick Search
                    </div>
                    <Search
                        placeholder="Search.."
                        allowClear
                        enterButton
                        style={{ width: '100%', marginBottom: '20px' }}
                        onSearch={onSearch}
                        onChange={(e) => {
                            if (!e.target.value) {
                                setSearchValue('');
                                setExpandedKeys([]);
                            }
                        }}
                    />
                    <Tree
                        showLine={true}
                        defaultExpandAll={false}
                        treeData={treeData}
                        height={400}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        onExpand={onExpand}
                        onSelect={onSelect}
                        titleRender={titleRender}
                        style={{
                            padding: '10px',
                            border: '1px solid #2b84a0',
                            borderRadius: '8px',
                            fontStyle: 'italic',
                        }}
                    />
                    <Button onClick={ExpandOrCloseAllTree} style={{ marginTop: '20px' }}>Close/Expand all </Button>
                </Col>
                <Col span={19}>
                    <List
                        grid={{ gutter: 16, column: 2 }}
                        dataSource={filteredListData}
                        renderItem={(item) => (
                            <List.Item key={item.key}>
                                <Card
                                    hoverable
                                    prefixCls="Genomers-card"
                                    title={item.title}
                                    style={{
                                        marginTop: '10px'
                                    }}
                                    onClick={() => handleCardClick(item)}
                                    cover={
                                        <img
                                            alt={item.title}
                                            src={item.imageUrl || '/images/species/default.jpg'}
                                            style={{
                                                height: '200px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    }
                                >
                                    <Card.Meta
                                        // title={item.title}
                                        description={item.description}
                                    />
                                    {/* <div style={{ marginTop: '16px' }}>
                                        {item.content}
                                    </div> */}
                                </Card>
                            </List.Item>
                        )}
                        pagination={{
                            onChange: (page) => {
                                console.log(page);
                            },
                            pageSize: 6,
                            showQuickJumper: true,
                            showSizeChanger: true,
                            pageSizeOptions: [6, 12, 24],
                            position: 'both',
                            align: 'center',
                        }}
                    />
                </Col>
            </Row>
        </div >
    );
};
export default App;