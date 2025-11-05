# AI Guidance Backend

这是构属植物基因组数据库的 AI 引导功能的后端服务。

## 功能说明

本后端服务支持两种模式：

1. **OpenAI 集成模式**：如果配置了 OpenAI API Key，系统将使用 GPT-4o-mini 模型进行智能对话
2. **规则回退模式**：如果没有配置 API Key，系统将使用基于关键词匹配的规则来响应用户请求

## 安装

```bash
cd backend
npm install
```

## 配置

1. 复制 `.env.example` 为 `.env`：
```bash
cp .env.example .env
```

2. （可选）编辑 `.env` 文件，添加您的 OpenAI API Key：
```
OPENAI_API_KEY=sk-your-api-key-here
PORT=3001
NODE_ENV=development
```

如果不配置 API Key，系统将自动使用规则回退模式。

## 运行

开发模式（需要安装 nodemon）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

默认服务器将在 `http://localhost:3001` 启动。

## API 端点

### POST /api/ai-query

处理 AI 查询请求。

**请求体：**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "我想运行 BLAST"
    }
  ],
  "context": {
    "currentPath": "/Home"
  }
}
```

**响应：**
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
    "model": "gpt-4o-mini",
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 50
    }
  }
}
```

### GET /api/health

健康检查端点。

**响应：**
```json
{
  "status": "ok",
  "message": "AI Guidance Backend is running"
}
```

## 支持的操作

- `search_species`: 搜索物种
- `fetch_species_overview`: 查看物种概览
- `run_blast`: 运行 BLAST 序列比对
- `analyze_ssr`: SSR 标记分析
- `run_de_analysis`: 差异表达基因分析
- `open_jbrowse_view`: 打开 JBrowse 基因组浏览器
- `fetch_download_links`: 下载数据资源
