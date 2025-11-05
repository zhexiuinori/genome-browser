# AI 引导功能使用说明

本文档说明如何使用和部署构属植物基因组数据库的 AI 引导功能。

## 功能概述

AI 引导功能在应用界面右下角提供一个浮动的 AI 助手按钮。用户点击按钮后可以：

- 通过自然语言描述需求
- AI 助手理解并提供相应的操作按钮
- 一键导航到所需的工具或页面

## 快速开始

### 1. 前端运行

前端已经集成到主应用中，无需额外配置：

```bash
npm install  # 如果尚未安装依赖
npm start
```

前端将在 `http://localhost:3000` 启动。

### 2. 后端服务

后端提供两种运行模式：

#### 模式一：基础模式（无需 API Key）

这种模式使用基于规则的关键词匹配，无需任何外部服务。

```bash
cd backend
npm install
npm start
```

后端将在 `http://localhost:3001` 启动。

#### 模式二：完整 AI 模式（需要 OpenAI API Key）

这种模式使用 OpenAI GPT-4o-mini 模型提供更智能的对话体验。

1. 复制环境变量模板：
```bash
cd backend
cp .env.example .env
```

2. 编辑 `.env` 文件，添加您的 OpenAI API Key：
```
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
NODE_ENV=development
```

3. 启动服务：
```bash
npm start
```

## 使用方法

### 基本对话示例

用户可以输入以下类型的请求：

| 用户输入 | AI 响应 | 操作 |
|---------|---------|------|
| "我想运行 BLAST" | 打开 BLAST 工具页面 | 导航到 `/tools/blash` |
| "查看基因组信息" | 打开基因组概览页面 | 导航到 `/Genomes` |
| "SSR 分析" | 打开 SSR Finder 工具 | 导航到 `/tools/ssrfinder` |
| "下载数据" | 打开下载页面 | 导航到 `/Download` |
| "JBrowse" | 打开基因组浏览器 | 导航到 `/tools/jbrowse` |
| "差异表达分析" | 打开 DE 分析工具 | 导航到 `/tools/de` |

### 支持的功能关键词

AI 助手能识别以下关键词并提供相应操作：

- **BLAST 相关**: "blast", "序列比对", "比对"
- **基因组浏览**: "jbrowse", "基因组浏览", "浏览器"
- **SSR 分析**: "ssr", "标记分析", "简单重复序列"
- **差异表达**: "差异表达", "de", "基因表达"
- **搜索**: "搜索", "查找", "物种"
- **下载**: "下载", "资源"
- **基因组概览**: "基因组", "genomes"

## 组件说明

### 前端组件

```
src/components/
├── AIChatInterface/
│   ├── index.jsx       # 主聊天界面组件
│   └── index.css       # 样式文件
└── AIChatToggle/
    └── index.jsx       # 浮动按钮组件
```

### 后端服务

```
backend/
├── routes/
│   └── aiQuery.js      # AI 查询路由处理
├── server.js           # Express 服务器
├── package.json        # 依赖配置
└── .env.example        # 环境变量模板
```

## 配置说明

### 前端配置

`package.json` 中已配置代理：
```json
{
  "proxy": "http://localhost:3001"
}
```

这使得前端可以直接向 `/api/ai-query` 发送请求。

### 后端配置

环境变量配置（`.env` 文件）：

```env
# OpenAI API Key（可选）
OPENAI_API_KEY=sk-your-api-key-here

# 服务器端口
PORT=3001

# 运行环境
NODE_ENV=development
```

## 部署建议

### 开发环境

1. 前端和后端分别在不同终端运行
2. 前端使用 `npm start`，自动在 3000 端口
3. 后端使用 `npm start`，在 3001 端口
4. 代理配置确保前端可以访问后端 API

### 生产环境

#### 选项 1：分离部署

- 前端：构建静态文件 `npm run build`，部署到 CDN 或静态服务器
- 后端：使用 PM2 或 Docker 部署 Node.js 服务
- 配置 CORS 和反向代理（如 Nginx）

#### 选项 2：统一部署

使用 Express 同时服务前端静态文件和 API：

```javascript
// backend/server.js 添加
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

## 自定义与扩展

### 添加新的操作

1. 在前端 `AIChatInterface/index.jsx` 的 `handleActionClick` 中添加新的 case：

```javascript
case 'your_new_action':
  history.push('/your/path');
  break;
```

2. 在后端 `backend/routes/aiQuery.js` 的 `buildFallbackResponse` 中添加新规则：

```javascript
{
  keywords: ['your', 'keywords'],
  assistantMessage: '您的提示信息',
  action: {
    action: 'your_new_action',
    params: {},
    explanation: '操作说明',
  },
}
```

### 修改 AI 响应风格

编辑 `backend/routes/aiQuery.js` 中的 `SYSTEM_PROMPT` 常量来调整 AI 的行为和回复风格。

## 故障排查

### 问题：点击 AI 按钮没有反应

**解决方案：**
1. 检查浏览器控制台是否有 JavaScript 错误
2. 确认组件已正确导入到 `App.jsx`

### 问题：AI 助手显示"服务暂时不可用"

**解决方案：**
1. 检查后端服务是否正在运行（`http://localhost:3001/api/health`）
2. 检查浏览器控制台的网络请求
3. 确认代理配置正确（`package.json` 中的 `proxy` 字段）

### 问题：后端无法启动

**解决方案：**
1. 确认已安装依赖：`cd backend && npm install`
2. 检查 3001 端口是否被占用
3. 查看终端错误信息

### 问题：OpenAI API 报错

**解决方案：**
1. 确认 API Key 正确且有效
2. 检查网络连接
3. 系统会自动回退到规则模式，不影响基本功能

## 成本优化

如果使用 OpenAI API：

1. **使用更便宜的模型**：已配置 `gpt-4o-mini`，是性价比最优的选择
2. **限制 token 数量**：已设置 `max_tokens: 1200`
3. **实施速率限制**：可在 `server.js` 中添加：

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

app.use('/api/ai-query', limiter);
```

4. **会话历史限制**：前端已配置只发送最近 10 条消息

## 技术栈

- **前端**: React 18, Ant Design, React Router v5
- **后端**: Express.js, Node.js
- **AI 服务**: OpenAI GPT-4o-mini（可选）
- **备用方案**: 基于规则的关键词匹配

## 安全建议

1. ✅ **API Key 保护**: 已在 `.gitignore` 中排除 `.env` 文件
2. ✅ **输入验证**: 后端已实施消息长度限制（2000 字符）
3. ✅ **CORS 配置**: 生产环境应配置白名单
4. ⚠️ **速率限制**: 建议在生产环境添加（见上方示例）
5. ⚠️ **日志记录**: 建议添加访问日志用于监控

## 支持与反馈

如有问题或建议，请联系开发团队。
