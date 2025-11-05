# AI 引导功能使用说明

本文档说明如何使用和部署构属植物基因组数据库的 AI 引导功能。

## 功能概述

AI 引导功能在应用界面右下角提供一个浮动的 AI 助手按钮。用户点击按钮后可以：

- 通过自然语言描述需求
- AI 助手理解并提供相应的操作按钮
- 一键导航到所需的工具或页面

## 架构说明

本系统采用前后端分离架构：

- **前端**：React 单页应用，包含 AI 聊天界面组件
- **后端**：可独立部署的 Express API 服务，提供 AI 查询接口

根据您的部署需求，可以选择：
1. **前后端独立部署**（推荐生产环境）
2. **前后端同项目部署**（开发测试）

## 快速开始

### 情况一：后端在独立项目中（推荐）

#### 前端配置

1. **创建环境配置文件**：
   ```bash
   cp .env.example .env
   ```

2. **设置后端 API 地址**：
   编辑 `.env` 文件：
   ```env
   # 开发环境
   REACT_APP_API_BASE_URL=http://localhost:4000
   
   # 生产环境（示例）
   # REACT_APP_API_BASE_URL=https://api.gpgdb.example.com
   ```

3. **启动前端**：
   ```bash
   npm install  # 首次运行
   npm start
   ```
   前端将在 `http://localhost:3000` 启动。

#### 后端实现

在您的后端项目中，需要实现以下 API 端点：

**1. POST /api/ai-query**

处理 AI 查询请求。

请求体示例：
```json
{
  "messages": [
    {
      "role": "user",
      "content": "我想运行 BLAST"
    }
  ],
  "context": {
    "currentPath": "#/Home"
  }
}
```

响应体示例：
```json
{
  "assistantMessage": "好的，我将为您打开 BLAST 序列比对工具。您可以在这里上传您的序列进行比对分析。",
  "actions": [
    {
      "action": "run_blast",
      "params": {},
      "explanation": "用户请求使用 BLAST 工具",
      "status": "pending"
    }
  ],
  "results": [],
  "meta": {
    "model": "gpt-4o-mini",
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 50
    }
  }
}
```

**2. GET /api/health（可选）**

健康检查端点：
```json
{
  "status": "ok",
  "message": "AI Guidance Backend is running"
}
```

#### 后端实现参考

`backend/` 目录提供了完整的实现示例，包括：

- **OpenAI 集成**：使用 GPT-4o-mini 模型
- **规则回退**：基于关键词匹配的 fallback 机制
- **输入验证**：消息长度限制、类型检查
- **错误处理**：完善的异常处理逻辑

**将参考代码复制到您的后端项目**：

```bash
# 假设您的后端项目路径为 ~/my-backend
cp -r backend/routes ~/my-backend/
cp backend/server.js ~/my-backend/
cp backend/package.json ~/my-backend/
cp backend/.env.example ~/my-backend/
```

然后在后端项目中：
```bash
cd ~/my-backend
npm install
cp .env.example .env
# 编辑 .env 添加 OPENAI_API_KEY（可选）
npm start
```

#### CORS 配置

确保后端正确配置 CORS：

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',           // 本地开发
    'https://your-frontend-domain.com' // 生产环境
  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 情况二：前后端同项目部署

如果要在本地同时运行前后端（开发/测试用）：

#### 使用一键启动脚本

```bash
./start-dev.sh
```

脚本会自动：
1. 安装后端依赖（如需要）
2. 后台启动后端服务（端口 3001）
3. 前台启动前端服务（端口 3000）

> 停止服务时按 `Ctrl+C`，脚本会自动清理后端进程。

#### 手动启动

**终端 1 - 启动后端**：
```bash
cd backend
npm install
npm start
```

**终端 2 - 启动前端**：
```bash
npm start
```

> 注意：使用 proxy 配置时，前端无需设置 `REACT_APP_API_BASE_URL`

## 后端实现详解

### 两种模式

#### 1. OpenAI 集成模式

配置 `.env` 文件：
```env
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
NODE_ENV=development
```

优点：
- 更智能的自然语言理解
- 可处理复杂的语义查询
- 支持上下文对话

缺点：
- 需要 OpenAI API Key
- 有调用成本
- 依赖外部服务

#### 2. 规则回退模式

不设置 `OPENAI_API_KEY`，系统会自动使用关键词匹配。

优点：
- 无需外部服务
- 零成本
- 响应速度快

缺点：
- 仅支持预定义关键词
- 理解能力有限

### 支持的操作（Actions）

后端需要识别并返回以下 action：

| Action | 前端导航 | 触发关键词示例 |
|--------|---------|--------------|
| `run_blast` | `/tools/blash` | blast, 序列比对, 比对 |
| `open_jbrowse_view` | `/tools/jbrowse` | jbrowse, 基因组浏览, 浏览器 |
| `analyze_ssr` | `/tools/ssrfinder` | ssr, 标记分析, 简单重复序列 |
| `run_de_analysis` | `/tools/de` | 差异表达, de, 基因表达 |
| `search_species` | `/Search` | 搜索, 查找, 物种 |
| `fetch_download_links` | `/Download` | 下载, 资源 |
| `fetch_species_overview` | `/Genomes` | 基因组, genomes |

## 使用方法

### 基本对话示例

| 用户输入 | AI 响应 | 操作 |
|---------|---------|------|
| "我想运行 BLAST" | 打开 BLAST 工具页面 | 导航到 `/tools/blash` |
| "查看基因组信息" | 打开基因组概览页面 | 导航到 `/Genomes` |
| "SSR 分析" | 打开 SSR Finder 工具 | 导航到 `/tools/ssrfinder` |
| "下载数据" | 打开下载页面 | 导航到 `/Download` |
| "JBrowse" | 打开基因组浏览器 | 导航到 `/tools/jbrowse` |
| "差异表达分析" | 打开 DE 分析工具 | 导航到 `/tools/de` |

### 高级功能

- **对话历史**：前端会保留最近 10 条消息发送给后端
- **操作按钮**：AI 响应中的 actions 会渲染成可点击按钮
- **错误处理**：连接失败时显示友好的 fallback 提示
- **重置对话**：点击重置按钮清空对话历史

## 部署建议

### 开发环境

1. 前端和后端分别在不同终端运行
2. 使用 `.env` 配置后端地址
3. 启用浏览器开发工具监控网络请求

### 生产环境

#### 选项 1：分离部署（推荐）

**前端**：
```bash
npm run build
# 部署 build/ 目录到 CDN 或静态服务器
```

**后端**：
- 使用 PM2 或 Docker 部署
- 配置环境变量
- 设置 CORS 白名单
- 使用反向代理（Nginx）

**Nginx 配置示例**：
```nginx
server {
  listen 80;
  server_name your-domain.com;

  # 前端静态文件
  location / {
    root /var/www/frontend/build;
    try_files $uri $uri/ /index.html;
  }

  # API 代理到后端
  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

#### 选项 2：统一部署

后端 Express 同时服务前端静态文件：

```javascript
// backend/server.js
const path = require('path');

// API 路由
app.use('/api', aiQueryRouter);

// 静态文件
app.use(express.static(path.join(__dirname, '../build')));

// SPA 路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});
```

## 故障排查

### 问题 1：点击 AI 按钮没有反应

**解决方案**：
1. 检查浏览器控制台是否有 JavaScript 错误
2. 确认 `AIChatToggle` 组件已导入到 `App.jsx`
3. 检查 CSS 样式是否正确加载

### 问题 2：AI 助手显示"服务暂时不可用"

**解决方案**：
1. 确认后端服务正在运行
2. 测试后端健康检查：
   ```bash
   curl http://localhost:3001/api/health
   ```
3. 检查前端 `.env` 中的 `REACT_APP_API_BASE_URL` 配置
4. 查看浏览器控制台的网络请求（F12 → Network 标签）
5. 检查后端 CORS 配置

### 问题 3：后端无法启动

**解决方案**：
1. 确认已安装依赖：`cd backend && npm install`
2. 检查端口占用：`lsof -i :3001`（Mac/Linux）
3. 查看后端日志输出
4. 验证 `.env` 文件格式

### 问题 4：OpenAI API 报错

**解决方案**：
1. 验证 API Key 是否正确且有效
2. 检查网络连接
3. 查看 API 使用额度
4. 系统会自动回退到规则模式，不影响基本功能

### 测试后端连接

在浏览器控制台执行：

```javascript
// 测试健康检查
fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/health`)
  .then(r => r.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Connection failed:', err));

// 测试 AI 查询
fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/ai-query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: '测试' }]
  })
})
  .then(r => r.json())
  .then(data => console.log('AI response:', data))
  .catch(err => console.error('AI query failed:', err));
```

## 成本估算

基于 OpenAI GPT-4o-mini 定价（2024）：
- 输入：$0.15 / 1M tokens
- 输出：$0.60 / 1M tokens

平均每次对话（约 500 tokens）：
- 成本：约 $0.0004
- 100 万次对话成本：约 $400

**成本优化建议**：
1. 使用规则回退模式（零成本）
2. 限制消息历史长度（已设置为 10 条）
3. 添加速率限制
4. 对简单查询使用关键词匹配

## 安全建议

1. ✅ **API Key 保护**：已在 `.gitignore` 中排除 `.env` 文件
2. ✅ **输入验证**：后端已实施消息长度限制（2000 字符）
3. ✅ **CORS 配置**：生产环境应配置白名单
4. ⚠️ **速率限制**：建议在生产环境添加
5. ⚠️ **日志记录**：建议添加访问日志用于监控

### 添加速率限制（推荐）

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 20,                   // 最多 20 次请求
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/ai-query', apiLimiter);
```

## 下一步优化

1. **多语言支持**：添加英文界面选项
2. **会话持久化**：使用 localStorage 或后端存储
3. **语音交互**：集成语音输入和 TTS
4. **上下文增强**：根据当前页面自动提供上下文
5. **个性化**：学习用户偏好，提供个性化建议
6. **协同分析**：支持多步骤复杂任务的自动化执行
7. **数据统计**：记录用户查询，优化关键词和响应

## 参考资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Express.js 文档](https://expressjs.com/)
- [React 文档](https://react.dev/)
- [Ant Design 组件库](https://ant.design/)

---

如有问题或建议，欢迎联系开发团队！
