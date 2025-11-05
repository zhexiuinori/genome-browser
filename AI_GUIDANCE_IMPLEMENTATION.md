# 构属植物基因组数据库 - AI 引导功能实施指南

## 概述

本文档提供了为构属植物基因组数据库添加 AI 引导功能的完整实施方案。该功能允许用户通过自然语言对话与数据库交互，自动导航到相应的工具和功能页面。

## 架构设计

### 整体架构
```
前端 (React)                后端 (Node.js/Express)          外部服务
┌─────────────────┐        ┌──────────────────────┐       ┌──────────────┐
│  AI Chat        │        │  POST /api/ai-query  │       │   OpenAI /   │
│  Interface      │───────▶│                      │──────▶│   Claude     │
│  Component      │◀───────│  - Prompt Builder    │◀──────│   API        │
└─────────────────┘        │  - Action Executor   │       └──────────────┘
         │                 │  - LLM Client        │
         │                 └──────────────────────┘
         ▼
    现有页面导航
   (Tools/Genomes等)
```

### 数据流
1. 用户在 AI Chat Interface 输入自然语言请求
2. 前端发送请求到 `/api/ai-query` 端点
3. 后端构建 prompt 并调用 LLM API
4. LLM 返回结构化的 JSON 响应（包含 action 和 params）
5. 前端根据 action 导航到相应页面或执行操作
6. 显示 AI 响应给用户

## 实施步骤

### 步骤 1：创建 AI Chat Interface 组件

创建文件：`src/components/AIChatInterface/index.jsx`

```jsx
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
    content: '您好！我是构属植物基因组数据库的智能助手。我可以帮助您：\\n\\n• 🔍 检索物种信息\\n• 🧬 运行 BLAST 序列比对\\n• 📊 进行 SSR 标记分析\\n• 📈 查看差异表达基因分析\\n• 🗺️ 使用 JBrowse 浏览基因组\\n• 📥 获取下载资源\\n\\n请告诉我您需要什么帮助！',
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
          history.push(\`/species/\${params.speciesId}\`);
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
      id: \`user-\${Date.now()}\`,
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
        throw new Error(\`请求失败：\${response.status}\`);
      }

      const data = await response.json();

      const aiMessage = {
        id: \`assistant-\${Date.now()}\`,
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
        id: \`assistant-\${Date.now()}\`,
        role: 'assistant',
        content: '抱歉，我暂时无法处理您的请求。您可以尝试：\\n\\n• 使用顶部菜单导航到相应页面\\n• 访问 Tools 菜单使用各种分析工具\\n• 访问 Genomes 页面浏览物种信息',
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
      <div key={message.id} className={\`ai-message \${isUser ? 'user' : 'assistant'}\`}>
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
```

### 步骤 2：创建样式文件

创建文件：`src/components/AIChatInterface/index.css`

```css
.ai-chat-wrapper {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 400px;
  height: 600px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
              0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
}

.ai-chat-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ai-chat-title {
  font-weight: 600;
  font-size: 16px;
  color: white;
}

.ai-chat-header .ant-btn-text {
  color: white;
}

.ai-chat-header .ant-btn-text:hover {
  background: rgba(255, 255, 255, 0.2);
}

.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f5f5;
}

.ai-message {
  display: flex;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-message.user {
  justify-content: flex-end;
}

.ai-message.assistant {
  justify-content: flex-start;
}

.ai-message-avatar {
  margin: 0 8px;
}

.ai-message.user .ai-message-avatar {
  order: 2;
}

.ai-message-content {
  max-width: 70%;
}

.ai-message-text {
  padding: 12px 16px;
  border-radius: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

.ai-message.user .ai-message-text {
  background: #1890ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message.assistant .ai-message-text {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.ai-message-actions {
  margin-top: 8px;
}

.ai-chat-input {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background: white;
  display: flex;
  align-items: flex-end;
}

.ai-chat-input textarea {
  flex: 1;
}

.ai-chat-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-chat-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.ai-chat-toggle:active {
  transform: scale(0.95);
}

.ai-chat-toggle-icon {
  font-size: 28px;
  color: white;
}

.ai-chat-messages::-webkit-scrollbar {
  width: 6px;
}

.ai-chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.ai-chat-messages::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.ai-chat-messages::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

### 步骤 3：创建浮动按钮组件

创建文件：`src/components/AIChatToggle/index.jsx`

```jsx
import React, { useState } from 'react';
import { RobotOutlined } from '@ant-design/icons';
import AIChatInterface from '../AIChatInterface';
import '../AIChatInterface/index.css';

function AIChatToggle() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen && <AIChatInterface onClose={() => setIsOpen(false)} />}
      {!isOpen && (
        <button 
          className="ai-chat-toggle"
          onClick={handleToggle}
          aria-label="打开 AI 助手"
        >
          <RobotOutlined className="ai-chat-toggle-icon" />
        </button>
      )}
    </>
  );
}

export default AIChatToggle;
```

### 步骤 4：集成到 App.jsx

在 `src/App.jsx` 中添加 AI Chat Toggle：

```jsx
// 在文件顶部添加 import
import AIChatToggle from './components/AIChatToggle';

// 在 return 语句中，在最外层 div 结束前添加
function App() {
  // ... 现有代码 ...

  return (
    <div>
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        {/* ... 现有的 Header, Content, Footer ... */}
      </Layout>
      
      {/* 添加 AI Chat Toggle */}
      <AIChatToggle />
    </div>
  );
}
```

### 步骤 5：创建后端 API（示例）

创建文件夹和文件：`backend/routes/aiQuery.js`（如果后端代码不在此项目中，请在后端项目中创建）

```javascript
const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `你是"构属植物基因组数据库（GPGDB）"的对话式智能助手。你的职责是：
1. 通过自然语言与研究人员互动，理解他们的科研需求。
2. 根据下方提供的工具列表，规划并调用最合适的工具。
3. 严格按照 JSON 格式输出指令，便于系统解析和执行。

以下是你可调用的工具：
- search_species: 根据拉丁名或通用名检索物种基础信息。参数：{ "query": string }
- fetch_species_overview: 获取物种的基因组概览。参数：{ "speciesId": string }
- run_blast: 执行 BLAST 序列比对。参数：{ "sequence": string, "database": "cds"|"genome" }
- analyze_ssr: 运行 SSR 标记分析。参数：{ "speciesId": string, "motifLength": number (2-6) }
- run_de_analysis: 触发差异表达基因分析。参数：{ "experimentId": string }
- open_jbrowse_view: 生成在 JBrowse 中查看的配置。参数：{ "speciesId": string, "locus": string }
- fetch_download_links: 获取可下载数据表。参数：{ "category": "genome"|"transcriptome"|"markers" }

你的输出必须是符合 JSON 规范的对象，包含：
{
  "assistantMessage": string,  // 面向用户的自然语言描述
  "actions": [
    {
      "action": string,         // 工具名称
      "params": object,         // 工具参数
      "explanation": string     // 为什么要调用该工具
    }
  ]
}

如果无需调用任何工具，"actions" 应是空数组。`;

router.post('/ai-query', async (req, res) => {
  const { messages = [], context = {} } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages 字段必须为非空数组' });
  }

  try {
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: formattedMessages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1200,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('LLM 返回内容为空');
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(502).json({ 
        error: 'AI 返回格式无效', 
        detail: parseError.message 
      });
    }

    const { assistantMessage, actions = [] } = parsed;

    res.json({
      assistantMessage,
      actions: actions.map(a => ({
        action: a.action,
        params: a.params || {},
        explanation: a.explanation,
        status: 'pending'
      })),
      results: [],
      meta: {
        model: completion.model,
        usage: completion.usage,
      },
    });
  } catch (error) {
    console.error('[AI_QUERY_ERROR]', error);
    res.status(500).json({ 
      error: 'AI 服务暂时不可用，请稍后再试',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
```

### 步骤 6：后端主文件集成

在后端主文件（如 `backend/server.js` 或 `backend/app.js`）中：

```javascript
const express = require('express');
const cors = require('cors');
const aiQueryRouter = require('./routes/aiQuery');

const app = express();

app.use(cors());
app.use(express.json());

// 添加 AI query 路由
app.use('/api', aiQueryRouter);

// ... 其他路由和中间件 ...

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 步骤 7：环境变量配置

创建/更新 `backend/.env` 文件：

```env
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
PORT=3001
```

**重要提示**：确保 `.env` 文件已添加到 `.gitignore`。

### 步骤 8：安装后端依赖

```bash
cd backend
npm install openai express cors dotenv
```

### 步骤 9：测试运行

1. 启动后端服务器：
```bash
cd backend
node server.js
```

2. 启动前端开发服务器：
```bash
npm start
```

3. 在浏览器中访问应用，点击右下角的 AI 助手按钮。

## 使用示例

用户可以输入以下类型的请求：

- "我想查看银杏的基因组信息"
- "帮我运行 BLAST 序列比对"
- "展示 SSR 标记分析工具"
- "我需要下载转录组数据"
- "打开 JBrowse 基因组浏览器"

AI 助手将理解请求并提供相应的操作按钮，点击后会自动导航到相应页面。

## 高级功能扩展

### 1. 添加会话持久化

可以使用 localStorage 保存对话历史：

```javascript
// 在 AIChatInterface 中
useEffect(() => {
  const saved = localStorage.getItem('ai-chat-history');
  if (saved) {
    try {
      setMessages(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load chat history');
    }
  }
}, []);

useEffect(() => {
  if (messages.length > 1) {
    localStorage.setItem('ai-chat-history', JSON.stringify(messages));
  }
}, [messages]);
```

### 2. 添加流式响应

使用 OpenAI 的流式 API 实现打字机效果：

```javascript
// 后端
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: formattedMessages,
  stream: true,
});

res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  res.write(`data: ${JSON.stringify({ content })}\\n\\n`);
}

res.write('data: [DONE]\\n\\n');
res.end();
```

### 3. 添加使用统计和成本控制

```javascript
// 后端中间件
const rateLimiter = require('express-rate-limit');

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 20, // 限制 20 次请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/ai-query', apiLimiter);
```

### 4. 添加 Prompt 注入防护

```javascript
// 输入清洗函数
function sanitizeInput(text) {
  // 移除可疑的系统指令
  const forbidden = ['ignore previous', 'system:', 'assistant:', 'you are now'];
  const lower = text.toLowerCase();
  
  for (const phrase of forbidden) {
    if (lower.includes(phrase)) {
      throw new Error('检测到非法输入');
    }
  }
  
  // 限制长度
  if (text.length > 2000) {
    throw new Error('输入内容过长');
  }
  
  return text.trim();
}
```

## 故障排查

### 问题 1：AI 助手无响应

**解决方案**：
1. 检查后端服务器是否正常运行
2. 检查浏览器控制台的网络请求
3. 确认 OpenAI API Key 是否有效
4. 检查 CORS 配置

### 问题 2：JSON 解析错误

**解决方案**：
1. 在 prompt 中更明确地要求 JSON 格式
2. 使用 OpenAI 的 `response_format: { type: 'json_object' }`
3. 添加重试逻辑，让 LLM 修正格式

### 问题 3：导航不工作

**解决方案**：
1. 检查 action 名称是否与 switch case 匹配
2. 确认 React Router 路由配置正确
3. 使用浏览器开发工具调试 history.push 调用

## 安全注意事项

1. **API Key 保护**：永远不要在前端代码中硬编码 API Key
2. **输入验证**：对所有用户输入进行严格验证
3. **速率限制**：实施请求频率限制防止滥用
4. **错误处理**：不要在错误信息中泄露敏感信息
5. **审计日志**：记录所有 AI 交互用于审计和改进

## 成本估算

基于 OpenAI GPT-4o-mini 定价（2024）：
- 输入：$0.15 / 1M tokens
- 输出：$0.60 / 1M tokens

平均每次对话（约 500 tokens）：
- 成本：约 $0.0004
- 100 万次对话成本：约 $400

建议使用成本更低的模型如 gpt-4o-mini 或 Claude 3 Haiku 用于生产环境。

## 下一步优化

1. **多语言支持**：添加英文界面选项
2. **语音交互**：集成语音输入和 TTS
3. **上下文增强**：根据当前页面自动提供上下文
4. **个性化**：学习用户偏好，提供个性化建议
5. **协同分析**：支持多步骤复杂任务的自动化执行

## 参考资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [React Router 文档](https://v5.reactrouter.com/)
- [Ant Design 组件库](https://ant.design/)

---

**实施完成后，您的用户将能够通过自然语言对话轻松访问数据库的所有功能，大大提升用户体验！**
