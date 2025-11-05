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

### 启动（推荐）

使用一键启动脚本同时启动前后端服务：

```bash
./start-dev.sh
```

脚本会：
1. 检查/安装后端依赖
2. 后台启动后端服务（默认端口 3001）
3. 前台启动前端开发服务器（默认端口 3000）

> 停止服务时按 `Ctrl + C`，脚本会自动终止后端进程。

### 手动启动

#### 后端

```bash
cd backend
npm install
npm start
```

#### 前端

```bash
npm start
```

启动后访问 [http://localhost:3000](http://localhost:3000)。

## AI 引导功能

- 入口在页面右下角，点击浮动机器人按钮即可唤起对话框
- 支持关键词：BLAST、JBrowse、SSR、差异表达、搜索物种、下载资源、基因组概览等
- 对话会在失败时提供备选指引

详细说明请参阅 [AI_GUIDANCE_USAGE.md](./AI_GUIDANCE_USAGE.md)。

## 后端服务

AI 功能的后端基于 Express 构建，默认开启跨域与 JSON 解析。支持两种模式：

1. **OpenAI 模式**：配置 `OPENAI_API_KEY` 后使用 GPT-4o-mini 生成响应
2. **规则回退模式**：未配置 API Key 时启用关键词匹配逻辑

更多信息请参考 [backend/README.md](./backend/README.md)。

## 项目结构

```
├── backend/                # AI 引导功能后端
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
├── AI_GUIDANCE_USAGE.md    # AI 功能使用说明
├── AI_GUIDANCE_IMPLEMENTATION.md
├── start-dev.sh            # 前后端一键启动脚本
└── README.md               # 当前说明文件
```

## 常用 npm 脚本

| 命令 | 说明 |
| ---- | ---- |
| `npm start` | 启动前端开发服务器 |
| `npm run build` | 构建生产环境静态文件 |
| `npm test` | 运行测试（暂未配置） |

## 贡献指南

1. 基于 `feat-ai-guidance-impl` 分支开发
2. 保持代码风格与项目一致（Ant Design + React Hooks）
3. 前端新增组件放置于 `src/components`
4. 后端新增接口放置于 `backend/routes`

---

如在使用过程中遇到问题或有改进建议，欢迎提交 Issue 或 Pull Request！
