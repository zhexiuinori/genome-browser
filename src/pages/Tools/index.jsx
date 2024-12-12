import React from 'react';
import { Card } from 'antd';
import { useHistory } from 'react-router-dom';
import './index.css';

// 工具列表配置
const toolsList = [
  {
    title: 'BLASH',
    description: '序列相似性搜索工具，支持核苷酸和蛋白质序列比对',
    icon: '🧬',
    path: '/tools/blash'
  },
  {
    title: 'JBrowse',
    description: '基因组浏览器，查看基因组序列和注释信息',
    icon: '🔍',
    path: '/tools/jbrowse'
  },
  {
    title: 'SSR Finder',
    description: '简单重复序列(SSR)查找工具',
    icon: '📊',
    path: '/tools/ssrfinder'
  },
  {
    title: 'Synteny Viewer',
    description: '基因组共线性分析与可视化工具',
    icon: '📈',
    path: '/tools/synteny'
  }
];

const Tools = () => {
  const history = useHistory();

  const handleToolClick = (path) => {
    console.log('Tool clicked:', path); // 添加调试日志
    history.push(path);
  };

  return (
    <div className="tools-container">
      <h1>分析工具</h1>
      <div className="tools-grid">
        {toolsList.map((tool, index) => (
          <Card 
            key={index} 
            className="tool-card" 
            hoverable
            onClick={() => handleToolClick(tool.path)}
          >
            <div className="tool-content">
              <div className="tool-icon">{tool.icon}</div>
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
              <button 
                className="try-button"
                onClick={(e) => {
                  e.stopPropagation(); // 防止事件冒泡
                  handleToolClick(tool.path);
                }}
              >
                使用{tool.title}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tools;
