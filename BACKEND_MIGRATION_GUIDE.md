# 后端迁移指南

本文档说明如何将 AI 引导功能的后端代码迁移到独立的后端项目中。

## 概览

当前仓库的 `backend/` 目录提供了完整的参考实现，包括：
- Express 服务器配置
- AI 查询路由（OpenAI 集成 + 关键词回退）
- 环境变量配置
- 依赖管理

## 迁移步骤

### 1. 复制后端代码到您的后端项目

假设您的后端项目路径为 `~/my-backend-project`：

```bash
# 创建 AI 相关目录（如果不存在）
mkdir -p ~/my-backend-project/routes

# 复制 AI 查询路由
cp backend/routes/aiQuery.js ~/my-backend-project/routes/

# 复制配置文件参考
cp backend/.env.example ~/my-backend-project/
cp backend/package.json ~/my-backend-project/backend-ai-deps.json
```

### 2. 安装依赖

在您的后端项目中安装所需的 npm 包：

```bash
cd ~/my-backend-project
npm install express cors dotenv
npm install openai  # 可选，用于 OpenAI 集成
```

或将以下内容添加到您的 `package.json`：

```json
{
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  },
  "optionalDependencies": {
    "openai": "^4.52.3"
  }
}
```

### 3. 集成到现有的 Express 应用

#### 方式一：直接挂载路由

在您的主服务器文件（如 `server.js` 或 `app.js`）中：

```javascript
const express = require('express');
const cors = require('cors');
const aiQueryRouter = require('./routes/aiQuery');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors({
  origin: [
    'http://localhost:3000',           // 本地开发
    'https://your-frontend-domain.com' // 生产环境
  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

// 挂载 AI 路由
app.use('/api', aiQueryRouter);

// 健康检查（可选）
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI Guidance Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ... 您的其他路由 ...

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenAI configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No (fallback mode)'}`);
});
```

#### 方式二：作为子应用挂载

如果您使用模块化路由结构：

```javascript
// routes/index.js
const express = require('express');
const router = express.Router();
const aiQueryRouter = require('./aiQuery');

// 挂载 AI 查询路由
router.use('/ai', aiQueryRouter);

// ... 其他路由 ...

module.exports = router;
```

然后在主文件中：

```javascript
const routes = require('./routes');
app.use('/api', routes);
```

这样 AI 查询端点将变为 `/api/ai/ai-query`。

**注意**：如果改变了路由路径，需要同步更新前端的 API 调用。

### 4. 配置环境变量

创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置必要的环境变量：

```env
# OpenAI API Key（可选 - 留空将使用关键词回退模式）
OPENAI_API_KEY=sk-your-api-key-here

# 服务器端口
PORT=4000

# 运行环境
NODE_ENV=production

# CORS 允许的来源（逗号分隔）
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### 5. 自定义 CORS 配置（可选）

如果需要动态 CORS 配置，修改您的服务器文件：

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如 Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true,
}));
```

### 6. 自定义 AI 响应逻辑（可选）

如果需要修改 AI 行为或添加新的关键词规则，编辑 `routes/aiQuery.js`：

#### 添加新的关键词规则

找到 `buildFallbackResponse` 函数中的 `fallbackRules` 数组：

```javascript
const fallbackRules = [
  // 现有规则...
  
  // 添加新规则
  {
    keywords: ['您的关键词', 'alternative', 'keyword'],
    assistantMessage: '这里是给用户的提示信息',
    action: {
      action: 'your_custom_action',
      params: { /* 可选参数 */ },
      explanation: '说明为什么调用这个操作',
    },
  },
];
```

#### 修改 System Prompt

修改 `SYSTEM_PROMPT` 常量来调整 AI 的行为：

```javascript
const SYSTEM_PROMPT = `你是"构属植物基因组数据库（GPGDB）"的对话式智能助手。

[在这里自定义 AI 的角色、能力和输出格式]

...
`;
```

### 7. 测试后端 API

启动后端服务器：

```bash
npm start
# 或
node server.js
```

测试健康检查：

```bash
curl http://localhost:4000/api/health
```

测试 AI 查询：

```bash
curl -X POST http://localhost:4000/api/ai-query \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "测试 BLAST"}
    ]
  }'
```

预期响应：

```json
{
  "assistantMessage": "好的，我将为您打开 BLAST 序列比对工具...",
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
    "model": "rule-based-mock",
    "usage": {"prompt_tokens": 0, "completion_tokens": 0}
  }
}
```

## 前端配置

迁移后端后，需要配置前端连接到新的后端地址。

### 1. 创建前端环境配置

在前端项目根目录：

```bash
cp .env.example .env
```

### 2. 设置后端 API 地址

编辑 `.env` 文件：

```env
# 开发环境
REACT_APP_API_BASE_URL=http://localhost:4000

# 生产环境（部署时修改）
# REACT_APP_API_BASE_URL=https://api.gpgdb.example.com
```

### 3. 重启前端开发服务器

```bash
npm start
```

## 验证集成

### 1. 检查前端是否正确连接到后端

打开浏览器控制台（F12），执行：

```javascript
fetch(`${process.env.REACT_APP_API_BASE_URL}/api/health`)
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

应该看到健康检查响应。

### 2. 测试 AI 功能

1. 启动前端和后端
2. 点击右下角的 AI 助手按钮
3. 输入测试消息，如"我想运行 BLAST"
4. 检查是否正确返回响应和操作按钮

## 生产部署注意事项

### 1. 安全性

- ✅ 使用 HTTPS
- ✅ 配置 CORS 白名单
- ✅ 添加速率限制
- ✅ 启用请求日志
- ✅ 保护 `.env` 文件（不要提交到版本控制）

### 2. 性能优化

```javascript
// 添加速率限制
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/ai-query', apiLimiter);
```

### 3. 日志记录

```javascript
// 添加请求日志
const morgan = require('morgan');
app.use(morgan('combined'));

// 或自定义日志
app.use('/api/ai-query', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] AI Query from ${req.ip}`);
  next();
});
```

### 4. 错误监控

考虑集成错误监控服务（如 Sentry）：

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// 错误处理中间件
app.use(Sentry.Handlers.errorHandler());
```

## 故障排查

### 问题：CORS 错误

**症状**：浏览器控制台显示 CORS 相关错误

**解决方案**：
1. 检查后端 CORS 配置
2. 确认前端域名在 `allowedOrigins` 列表中
3. 检查是否允许了正确的 HTTP 方法

### 问题：404 Not Found

**症状**：API 请求返回 404

**解决方案**：
1. 确认路由路径配置正确
2. 检查前端 `REACT_APP_API_BASE_URL` 设置
3. 验证后端服务正在运行

### 问题：OpenAI API 调用失败

**症状**：后端日志显示 OpenAI 错误

**解决方案**：
1. 验证 API Key 有效性
2. 检查网络连接
3. 查看 API 使用额度
4. 系统会自动回退到关键词匹配模式

## 进阶配置

### 多环境配置

创建不同的环境配置文件：

- `.env.development`
- `.env.staging`
- `.env.production`

使用环境变量加载对应配置：

```bash
NODE_ENV=production node server.js
```

### 容器化部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
```

### PM2 进程管理

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'ai-backend',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
```

启动：

```bash
pm2 start ecosystem.config.js
```

## 总结

迁移清单：

- [x] 复制 `routes/aiQuery.js` 到后端项目
- [x] 安装所需依赖（express, cors, dotenv, openai）
- [x] 集成路由到主服务器文件
- [x] 配置环境变量（`.env`）
- [x] 设置 CORS 规则
- [x] 测试 API 端点
- [x] 配置前端环境变量（`REACT_APP_API_BASE_URL`）
- [x] 验证前后端通信
- [x] 添加生产环境优化（速率限制、日志等）

完成以上步骤后，AI 引导功能就能在您的独立后端项目中正常工作了！

---

如有问题，请参考 [AI_GUIDANCE_USAGE.md](./AI_GUIDANCE_USAGE.md) 或联系开发团队。
