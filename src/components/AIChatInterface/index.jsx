import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Input, Avatar, Alert, Space, Tooltip } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CloseOutlined, ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import './index.css';

const { TextArea } = Input;

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content: '您好！我是构属植物基因组数据库的智能助手。我可以帮助您：\n\n• 🔍 检索物种信息\n• 🧬 运行 BLAST 序列比对\n• 📊 进行 SSR 标记分析\n• 📈 查看差异表达基因分析\n• 🗺️ 使用 JBrowse 浏览基因组\n• 📥 获取下载资源\n\n请告诉我您需要什么帮助！',
  },
];

function AIChatInterface({ onClose }) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const history = useHistory();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleActionClick = useCallback((action, params) => {
    switch (action) {
      case 'open_jbrowse_view':
        history.push('/tools/jbrowse');
        break;
      case 'run_blast':
        history.push('/tools/blash');
        break;
      case 'analyze_ssr':
        history.push('/tools/ssrfinder');
        break;
      case 'run_de_analysis':
        history.push('/tools/de');
        break;
      case 'search_species':
        history.push('/Search');
        break;
      case 'fetch_download_links':
        history.push('/Download');
        break;
      case 'fetch_species_overview':
        if (params?.speciesId) {
          history.push(`/species/${params.speciesId}`);
        } else {
          history.push('/Genomes');
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, [history]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
    };
    const nextMessages = [...messages, userMessage];

    try {
      setMessages(nextMessages);
      setIsLoading(true);
      setInputValue('');
      setError(null);

      const response = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: nextMessages.slice(-10),
          context: {
            currentPath: window.location.hash,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败：${response.status}`);
      }

      const data = await response.json();

      const aiMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.assistantMessage || data.message || '抱歉，我无法理解您的请求。',
        metadata: {
          actions: data.actions || [],
          results: data.results || [],
        },
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI query error:', err);
      setError(err.message || '服务暂时不可用，请稍后再试');
      
      const fallbackMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，我暂时无法处理您的请求。您可以尝试：\n\n• 使用顶部菜单导航到相应页面\n• 访问 Tools 菜单使用各种分析工具\n• 访问 Genomes 页面浏览物种信息',
        metadata: { actions: [], results: [] },
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages(initialMessages);
    setError(null);
  };

  const getActionLabel = (action) => {
    const labels = {
      search_species: '🔍 搜索物种',
      fetch_species_overview: '📊 查看物种概览',
      run_blast: '🧬 运行 BLAST',
      analyze_ssr: '📈 SSR 分析',
      run_de_analysis: '📉 差异表达分析',
      open_jbrowse_view: '🗺️ 打开 JBrowse',
      fetch_download_links: '📥 下载资源',
    };
    return labels[action] || action;
  };

  const renderMessage = (message) => {
    const isUser = message.role === 'user';
    const actions = message.metadata?.actions || [];

    return (
      <div key={message.id} className={`ai-message ${isUser ? 'user' : 'assistant'}`}>
        <div className="ai-message-avatar">
          <Avatar 
            icon={isUser ? <UserOutlined /> : <RobotOutlined />} 
            style={{ backgroundColor: isUser ? '#1890ff' : '#52c41a' }}
          />
        </div>
        <div className="ai-message-content">
          <div className="ai-message-text">{message.content}</div>
          {actions.length > 0 && (
            <div className="ai-message-actions">
              <Space wrap>
                {actions.map((action, idx) => (
                  <Button
                    key={idx}
                    type="primary"
                    size="small"
                    onClick={() => handleActionClick(action.action, action.params)}
                  >
                    {getActionLabel(action.action)}
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-chat-wrapper">
      <div className="ai-chat-header">
        <Space>
          <RobotOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
          <span className="ai-chat-title">AI 智能助手</span>
        </Space>
        <Space>
          <Tooltip title="重置对话">
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={handleReset}
            />
          </Tooltip>
          <Tooltip title="关闭">
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose}
            />
          </Tooltip>
        </Space>
      </div>

      <div className="ai-chat-messages">
        {messages.map(renderMessage)}
        {isLoading && (
          <div className="ai-message assistant">
            <div className="ai-message-avatar">
              <Avatar 
                icon={<RobotOutlined />} 
                style={{ backgroundColor: '#52c41a' }}
              />
            </div>
            <div className="ai-message-content">
              <LoadingOutlined /> 思考中...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ margin: '8px 12px' }}
        />
      )}

      <div className="ai-chat-input">
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="请描述您的需求... (Shift+Enter 换行)"
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={isLoading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          disabled={isLoading || !inputValue.trim()}
          style={{ marginLeft: '8px' }}
        >
          发送
        </Button>
      </div>
    </div>
  );
}

export default AIChatInterface;
