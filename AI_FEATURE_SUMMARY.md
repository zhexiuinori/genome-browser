# AI 引导功能实现总结

## 功能概述

已为构属植物基因组数据库成功实现 AI 智能助手功能，支持通过自然语言对话引导用户快速导航到相应工具页面。

## 实现架构

### 前端（React）
- **位置**：`src/components/AIChatInterface` 和 `src/components/AIChatToggle`
- **功能**：
  - 右下角浮动按钮
  - 聊天界面（消息历史、输入框、操作按钮）
  - 自动导航到指定页面
  - 错误处理和 fallback 提示
- **特点**：
  - 支持可配置的后端 API 地址（通过 `REACT_APP_API_BASE_URL`）
  - 保留最近 10 条对话历史
  - Ant Design UI 组件
  - 响应式设计

### 后端（Express）
- **位置**：`backend/` 目录（参考实现）
- **功能**：
  - `POST /api/ai-query` - 处理 AI 查询
  - `GET /api/health` - 健康检查
- **特点**：
  - **双模式运行**：
    - OpenAI 集成（配置 API Key 时）
    - 关键词回退（无 API Key 时）
  - 输入验证和长度限制
  - CORS 支持
  - 结构化 JSON 响应

## 支持的操作

| 用户输入关键词 | Action | 导航目标 |
|-------------|--------|---------|
| BLAST, 序列比对 | `run_blast` | `/tools/blash` |
| JBrowse, 基因组浏览 | `open_jbrowse_view` | `/tools/jbrowse` |
| SSR, 标记分析 | `analyze_ssr` | `/tools/ssrfinder` |
| 差异表达, DE | `run_de_analysis` | `/tools/de` |
| 搜索, 物种 | `search_species` | `/Search` |
| 下载, 资源 | `fetch_download_links` | `/Download` |
| 基因组, Genomes | `fetch_species_overview` | `/Genomes` |

## 部署方式

### 方式一：前后端独立部署（推荐）

**前端配置**：
```bash
# 创建 .env 文件
cp .env.example .env

# 编辑 .env，设置后端地址
REACT_APP_API_BASE_URL=http://your-backend-url:4000

# 启动前端
npm start
```

**后端部署**：
- 将 `backend/` 目录的代码复制到独立后端项目
- 参考 [BACKEND_MIGRATION_GUIDE.md](./BACKEND_MIGRATION_GUIDE.md)
- 配置 CORS 允许前端域名

### 方式二：前后端同项目部署

**一键启动**：
```bash
./start-dev.sh
```

**手动启动**：
```bash
# 终端 1
cd backend && npm install && npm start

# 终端 2
npm start
```

## 核心文件清单

### 前端
- `src/components/AIChatInterface/index.jsx` - 聊天界面组件
- `src/components/AIChatInterface/index.css` - 样式文件
- `src/components/AIChatToggle/index.jsx` - 浮动按钮
- `src/App.jsx` - 已集成 `<AIChatToggle />`
- `.env.example` - 环境变量模板

### 后端（参考实现）
- `backend/routes/aiQuery.js` - AI 查询路由
- `backend/server.js` - Express 服务器
- `backend/package.json` - 依赖配置
- `backend/.env.example` - 环境变量模板
- `backend/README.md` - 后端说明

### 文档
- `README.md` - 项目主文档（已更新）
- `AI_GUIDANCE_USAGE.md` - 详细使用说明
- `AI_GUIDANCE_IMPLEMENTATION.md` - 原始设计方案
- `BACKEND_MIGRATION_GUIDE.md` - 后端迁移指南
- `AI_FEATURE_SUMMARY.md` - 本文档

## 环境变量配置

### 前端 `.env`
```env
# 后端 API 基础地址
REACT_APP_API_BASE_URL=http://localhost:4000
# 留空则使用 proxy 配置
```

### 后端 `.env`
```env
# OpenAI API Key（可选）
OPENAI_API_KEY=sk-your-api-key-here

# 服务器端口
PORT=3001

# 运行环境
NODE_ENV=development
```

## 技术栈

- **前端**：React 18, Ant Design 5, React Router v5
- **后端**：Express.js, Node.js
- **AI 服务**：OpenAI GPT-4o-mini（可选）
- **备用方案**：基于关键词的规则匹配

## 开发注意事项

### 后端在独立项目中
1. 前端需要设置 `REACT_APP_API_BASE_URL` 环境变量
2. 后端需要配置 CORS 允许前端域名
3. 参考 `backend/` 目录的实现代码
4. 按照 BACKEND_MIGRATION_GUIDE.md 进行迁移

### 添加新的 Action
1. **前端**：在 `AIChatInterface/index.jsx` 的 `handleActionClick` 中添加 case
2. **后端**：在 `routes/aiQuery.js` 的 `buildFallbackResponse` 中添加规则
3. 更新文档中的操作列表

### 自定义 AI 行为
编辑 `backend/routes/aiQuery.js` 中的：
- `SYSTEM_PROMPT` - AI 角色和输出格式
- `fallbackRules` - 关键词匹配规则
- `buildFallbackResponse` - 回退逻辑

## 成本说明

### OpenAI 模式
- 使用 GPT-4o-mini 模型
- 平均每次对话约 $0.0004
- 可通过限制历史长度和速率来控制成本

### 规则回退模式
- 完全免费
- 基于关键词匹配
- 无需外部服务依赖

## 安全考虑

- ✅ API Key 已通过 `.gitignore` 保护
- ✅ 输入长度限制（2000 字符）
- ✅ CORS 配置
- ⚠️ 建议生产环境添加速率限制
- ⚠️ 建议添加访问日志

## 测试方法

### 前端测试
```javascript
// 在浏览器控制台执行
fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/health`)
  .then(r => r.json())
  .then(console.log);
```

### 后端测试
```bash
# 健康检查
curl http://localhost:3001/api/health

# AI 查询
curl -X POST http://localhost:3001/api/ai-query \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"测试"}]}'
```

## 故障排查快速指南

| 问题 | 检查项 |
|------|--------|
| AI 按钮无反应 | 检查浏览器控制台错误、组件是否正确导入 |
| 服务不可用 | 确认后端运行、检查 API 地址配置、查看网络请求 |
| CORS 错误 | 检查后端 CORS 配置、确认前端域名在白名单中 |
| OpenAI 错误 | 验证 API Key、检查网络、系统会自动回退 |

## 后续优化建议

1. **会话持久化**：使用 localStorage 保存对话历史
2. **速率限制**：添加请求频率限制防止滥用
3. **日志监控**：记录用户查询和系统响应
4. **多语言支持**：添加英文界面
5. **语音交互**：集成语音输入和输出
6. **上下文感知**：根据当前页面提供更精准的建议
7. **参数传递**：支持带参数的页面跳转

## 快速链接

- [使用说明](./AI_GUIDANCE_USAGE.md) - 详细的使用和部署指南
- [后端迁移指南](./BACKEND_MIGRATION_GUIDE.md) - 如何将后端代码迁移到独立项目
- [实施方案](./AI_GUIDANCE_IMPLEMENTATION.md) - 原始设计文档
- [后端 README](./backend/README.md) - 后端参考实现说明

## 联系方式

如有问题或建议，请：
- 查看相关文档
- 检查故障排查部分
- 联系开发团队

---

**实施完成日期**：2024
**版本**：v0.1.0
**状态**：✅ 已完成基础功能实现，支持前后端分离部署
