# 构属植物基因组数据库（GPGDB）

构属植物基因组数据库是一个基于 React 的单页应用，用于浏览、检索和分析植物基因组相关数据。项目集成了大量工具，如 BLAST 序列比对、SSR Finder、差异表达基因分析、JBrowse 基因组浏览器等。

> **新增功能**：AI 智能助手现已上线，支持通过自然语言引导用户快速跳转到对应的工具页面。

## 功能亮点

- 🧭 基于 HashRouter 的多页面导航
- 📊 多种可视化图表（ECharts）和基因组浏览器（JBrowse）
- 🔍 基因组、物种、差异表达等多维度数据检索
- 🤖 **AI 智能助手**：理解用户意图并提供一键导航操作

## 快速开始

### 环境要求

- Node.js 18+
- npm 8+

### 安装依赖

```bash
npm install
```

### 启动前端

```bash
npm start
```

启动后访问 [http://localhost:3000](http://localhost:3000)。

## AI 引导功能

- 入口在页面右下角，点击浮动机器人按钮即可唤起对话框
- 支持关键词：BLAST、JBrowse、SSR、差异表达、搜索物种、下载资源、基因组概览等
- 对话会在失败时提供备选指引

详细说明请参阅 [AI_GUIDANCE_USAGE.md](./AI_GUIDANCE_USAGE.md)。

## 后端服务对接

### 1. 后端在独立项目中（推荐）

如果您的后端在另一个独立项目/仓库中：

#### 前端配置

1. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，设置后端 API 地址：
   ```env
   REACT_APP_API_BASE_URL=http://localhost:4000
   # 或生产环境: https://api.gpgdb.example.com
   ```

3. 重启前端开发服务器（如果正在运行）

#### 后端实现

您的后端需要提供以下 API 端点：

- `POST /api/ai-query` - 处理 AI 查询请求
- `GET /api/health` - 健康检查（可选）

**请求格式**：
```json
{
  "messages": [
    { "role": "user", "content": "我想运行 BLAST" }
  ],
  "context": {
    "currentPath": "#/Home"
  }
}
```

**响应格式**：
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
    "usage": { "prompt_tokens": 150, "completion_tokens": 50 }
  }
}
```

**后端实现参考**：
- `backend/` 目录提供了完整的 Express + OpenAI 实现示例
- 支持 OpenAI 集成或关键词匹配回退
- 可直接复制到您的后端项目使用
- 详见 [backend/README.md](./backend/README.md) 和 [BACKEND_MIGRATION_GUIDE.md](./BACKEND_MIGRATION_GUIDE.md)

#### CORS 配置

确保后端启用 CORS 并允许前端域名：

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  methods: ['POST', 'GET'],
  credentials: true,
}));
```

### 2. 后端在当前仓库内（本地开发）

如果要在本地同时运行前后端：

#### 使用一键启动脚本

```bash
./start-dev.sh
```

脚本会自动：
1. 安装后端依赖
2. 启动后端服务（端口 3001）
3. 启动前端服务（端口 3000）

停止服务时按 `Ctrl + C`，脚本会自动终止后端进程。

#### 手动启动

**后端**：
```bash
cd backend
npm install
npm start
```

**前端**：
```bash
npm start
```

> 注意：使用 proxy 配置时，无需设置 `REACT_APP_API_BASE_URL`

## 项目结构

```
├── backend/                # AI 引导功能后端（参考实现）
│   ├── routes/             # Express 路由
│   ├── server.js           # 后端入口
│   ├── package.json        # 后端依赖
│   └── .env.example        # 环境变量模板
├── src/
│   ├── components/         # 公共组件
│   │   ├── AIChatInterface # AI 对话框
│   │   └── AIChatToggle    # 浮动按钮
│   ├── pages/              # 各业务页面
│   ├── App.jsx             # 应用入口布局
│   └── index.js            # 渲染入口（HashRouter）
├── .env.example            # 前端环境变量模板
├── AI_GUIDANCE_USAGE.md    # AI 功能使用说明
├── AI_GUIDANCE_IMPLEMENTATION.md # 实施指南
├── start-dev.sh            # 前后端一键启动脚本
└── README.md               # 当前说明文件
```

## 常用 npm 脚本

| 命令 | 说明 |
| ---- | ---- |
| `npm start` | 启动前端开发服务器 |
| `npm run build` | 构建生产环境静态文件 |
| `npm test` | 运行测试（暂未配置） |

## 支持的 AI 操作

前端会将以下 action 自动转换为页面导航：

| Action | 导航目标 | 说明 |
|--------|---------|------|
| `run_blast` | `/tools/blash` | BLAST 序列比对 |
| `open_jbrowse_view` | `/tools/jbrowse` | JBrowse 基因组浏览器 |
| `analyze_ssr` | `/tools/ssrfinder` | SSR 标记分析 |
| `run_de_analysis` | `/tools/de` | 差异表达基因分析 |
| `search_species` | `/Search` | 物种搜索 |
| `fetch_download_links` | `/Download` | 下载资源 |
| `fetch_species_overview` | `/Genomes` 或 `/species/{id}` | 基因组概览 |

## 贡献指南

1. 基于 `feat-ai-guidance-impl` 分支开发
2. 保持代码风格与项目一致（Ant Design + React Hooks）
3. 前端新增组件放置于 `src/components`
4. 后端新增接口放置于后端项目的相应目录

## 故障排查

### AI 助手无法连接

1. 检查后端服务是否运行
2. 验证 `.env` 中的 `REACT_APP_API_BASE_URL` 配置
3. 查看浏览器控制台的网络请求和错误信息
4. 检查后端 CORS 配置

### 如何测试后端连接

在浏览器控制台执行：
```javascript
fetch(`${process.env.REACT_APP_API_BASE_URL}/api/health`)
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

如在使用过程中遇到问题或有改进建议，欢迎提交 Issue 或 Pull Request！
