# 系统架构文档

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   React Application                    │  │
│  │                     (Port 3000)                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP (Proxy)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│                     (Port 3001)                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Species   │  │    SSR     │  │   BLAST    │           │
│  │    API     │  │    API     │  │    API     │  ...      │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database                               │
│         (Genomic Data / SSR Markers / Annotations)          │
└─────────────────────────────────────────────────────────────┘
```

## 前端架构

### 应用层级结构

```
┌─────────────────────────────────────────────────────────────┐
│                        index.js                              │
│                    (Application Entry)                       │
│                      ├─ HashRouter                           │
│                      └─ React.StrictMode                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                              │
│                     (Main Component)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layout (Ant Design)                                 │   │
│  │  ├─ Header (Menu + Logo)                            │   │
│  │  ├─ Content                                          │   │
│  │  │   ├─ Breadcrumb                                   │   │
│  │  │   └─ Routes (React Router Switch)                │   │
│  │  └─ Footer                                           │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Routes                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   Home   │  │  Search  │  │ Genomes  │  ...             │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │           Tools (Lazy Loaded)         │                  │
│  │  ┌─────┐ ┌───────┐ ┌──────────┐     │                  │
│  │  │Blash│ │JBrowse│ │SSRFinder │ ... │                  │
│  │  └─────┘ └───────┘ └──────────┘     │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 页面组件架构

#### 1. Home 页面

```
Home
├─ Statistics Section (数据统计)
├─ Quick Tools (快速入口)
│  ├─ Search Card
│  ├─ Genomes Card
│  ├─ Tools Card
│  └─ Download Card
├─ Database Construction (介绍)
└─ Available Tools (工具列表)
```

#### 2. Search 页面

```
Search
└─ Collapse (折叠面板)
   ├─ Panel 1: Keywords Search
   │  └─ Form (Genomic Type + Version + Input)
   ├─ Panel 2: Location Search
   │  └─ Form (Gene ID/Symbol + Version)
   ├─ Panel 3: Transcription Regulator
   │  └─ Form (Disease Name)
   └─ Panel 4: Transcription Regulator (重复)
      └─ Form
```

#### 3. Genomes 页面

```
Genomes
├─ Left Panel (Col span=5)
│  ├─ Quick Search Input
│  ├─ Tree Component
│  │  ├─ Search Highlight
│  │  ├─ Expand/Collapse
│  │  └─ Node Selection
│  └─ Expand/Close All Button
└─ Right Panel (Col span=19)
   └─ Species List
      ├─ Card Grid (2 columns)
      └─ Pagination (6/12/24 per page)
```

#### 4. Species 详情页

```
Species Detail
├─ CollapsibleCard: Overview
│  ├─ Image (Left)
│  └─ Description (Right)
├─ CollapsibleCard: SSR Information
│  ├─ EChart: SSR序列分布 (Line Chart)
│  └─ EChart: SSR长度分布 (Bar Chart)
├─ CollapsibleCard: SSR Basic Information
│  └─ Table
│     ├─ Columns: ID, Seqid, Source, Type, Start, End...
│     ├─ Filter by Seqid
│     └─ Pagination (10/15/30/50/100)
└─ CollapsibleCard: Search
   ├─ SSR ID/Name Select
   ├─ Protein ID/Name Select
   ├─ Product Description Input
   └─ Position Search (Chr + From/To)
```

#### 5. Tools 页面

```
Tools
├─ Tools Index (工具列表)
│  └─ Tool Cards (网格布局)
│     ├─ BLASH Card
│     ├─ JBrowse Card
│     ├─ SSR Finder Card
│     ├─ Synteny Viewer Card
│     └─ DE Gene Analysis Card
│
└─ Tool Detail Pages (独立路由)
   ├─ /tools/blash
   │  ├─ Sequence Type Select
   │  ├─ Text Input / File Upload
   │  └─ Result Display
   ├─ /tools/jbrowse
   ├─ /tools/ssrfinder
   ├─ /tools/synteny
   └─ /tools/de
```

## 数据流架构

### 组件-API交互流程

```
Component State
     │
     ├─ useState (local state)
     ├─ useEffect (lifecycle)
     └─ Event Handlers
          │
          ▼
    API Request
    (fetch/axios)
          │
          ▼
   Backend Server
   (port 3001)
          │
          ▼
     Database
          │
          ▼
    API Response
    (JSON format)
          │
          ▼
  State Update
  (setState)
          │
          ▼
   UI Re-render
   (React DOM)
```

### 具体示例：Species 页面数据流

```
1. 用户访问 /species/Broussonetia_papyrifera
          │
          ▼
2. useParams() 获取参数 name="Broussonetia_papyrifera"
          │
          ▼
3. useEffect 触发数据请求
          ├─ fetch(`/api/species/species/${name}`)
          ├─ fetch(`/api/ssrmarkers/stats/${shortName}/repeat-sequence`)
          ├─ fetch(`/api/ssrmarkers/stats/${shortName}/repeat-length`)
          └─ fetch(`/api/ssrmarkers/stats/${shortName}/basic-info`)
          │
          ▼
4. Promise.all 并行请求
          │
          ▼
5. Response JSON 解析
          │
          ▼
6. 状态更新
          ├─ setSpeciesData(result.data)
          ├─ setSsrStats(sequenceData)
          ├─ setSsrLengthStats(lengthData)
          └─ setSsrBasicInfo(basicInfoArray)
          │
          ▼
7. 组件重新渲染
          ├─ 显示物种信息
          ├─ 渲染 ECharts 图表
          └─ 填充 Table 数据
```

## 路由架构

### 路由配置树

```
HashRouter (#/)
│
├─ /Home (default)
│  └─ Home Component
│
├─ /Search
│  └─ Search Component
│
├─ /Genomes
│  └─ Genomes Component
│
├─ /species/:name (动态路由)
│  └─ Species Component
│     └─ useParams() 获取 name
│
├─ /tools
│  ├─ /tools (exact)
│  │  └─ Tools Component (工具列表)
│  │
│  ├─ /tools/blash (lazy)
│  │  └─ Blash Component
│  │
│  ├─ /tools/jbrowse (lazy)
│  │  └─ JBrowse Component
│  │
│  ├─ /tools/ssrfinder (lazy)
│  │  └─ SSRFinder Component
│  │
│  ├─ /tools/synteny (lazy)
│  │  └─ SyntenyViewer Component
│  │
│  └─ /tools/de (lazy)
│     └─ DEGeneAnalysis Component
│
├─ /Download
│  └─ Download Component
│
├─ /Network
│  └─ Network Component
│
├─ /Test
│  └─ Test Component
│
└─ * (任何未匹配路由)
   └─ Redirect to /Home
```

### 懒加载机制

```javascript
// App.jsx
const Blash = React.lazy(() => 
  import('./pages/Tools/Blash').then(module => ({
    default: module.default || module
  }))
);

// 使用
<React.Suspense fallback={<div>Loading...</div>}>
  <Route path="/tools/blash" component={Blash} />
</React.Suspense>
```

**优势**：
- 首次加载只包含必要代码
- 工具页面按需加载
- 减少初始bundle大小
- 提升首屏加载速度

## 状态管理架构

### 当前状态管理方式

```
Component Level State (useState/useReducer)
│
├─ Local UI State
│  ├─ form values
│  ├─ loading states
│  ├─ modal visibility
│  └─ input values
│
└─ Server Data State
   ├─ species data
   ├─ SSR statistics
   ├─ search results
   └─ table data
```

**特点**：
- ✅ 简单直观，易于理解
- ✅ 无额外依赖
- ❌ 无全局状态管理
- ❌ 数据无缓存机制
- ❌ 重复请求未优化

### 建议的状态管理改进

```
App Level
│
├─ React Query / SWR (Server State)
│  ├─ 自动缓存
│  ├─ 后台更新
│  ├─ 重复请求去重
│  └─ 错误重试
│
└─ Context API / Zustand (Client State)
   ├─ User preferences
   ├─ UI theme
   ├─ Search history
   └─ Favorites
```

## 组件架构模式

### 1. 容器/展示组件模式

```
Container Component (Smart)
├─ 数据获取逻辑
├─ 状态管理
├─ 事件处理
└─ 传递props给展示组件
     │
     ▼
Presentational Component (Dumb)
├─ 只接收props
├─ 纯UI渲染
└─ 无状态逻辑
```

### 2. 自定义Hooks模式

```javascript
// 建议抽取的自定义Hook

// 数据获取
useSpeciesData(name) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // fetch logic
  }, [name]);
  
  return { data, loading, error };
}

// SSR统计
useSSRStats(speciesName) {
  // ...
}

// 表格分页
useTablePagination(initialPageSize) {
  // ...
}
```

### 3. 高阶组件模式

```javascript
// 错误边界
withErrorBoundary(Component) {
  return class extends React.Component {
    state = { hasError: false };
    
    componentDidCatch(error, info) {
      this.setState({ hasError: true });
    }
    
    render() {
      if (this.state.hasError) {
        return <ErrorFallback />;
      }
      return <Component {...this.props} />;
    }
  };
}
```

## 性能优化架构

### 1. 代码分割策略

```
Initial Bundle (必需)
├─ React Core
├─ React Router
├─ Ant Design (按需导入)
├─ App Component
├─ Home Component
└─ Common utilities

Lazy Loaded (按需)
├─ Tools/*
├─ Heavy libraries
│  ├─ ECharts
│  ├─ JBrowse
│  └─ biojs-vis-blasterjs
└─ Large components
```

### 2. 渲染优化

```
Component Optimization
│
├─ React.memo
│  └─ Pure functional components
│
├─ useMemo
│  ├─ Expensive calculations
│  └─ Large data transformations
│
├─ useCallback
│  └─ Event handlers passed to children
│
└─ Virtual Scrolling
   └─ Long lists (recommended)
```

### 3. 数据优化

```
Data Loading Strategy
│
├─ Pagination
│  └─ Table data (已实现)
│
├─ Lazy Loading
│  └─ Images (建议添加)
│
├─ Caching
│  └─ API responses (建议添加)
│
└─ Debouncing
   └─ Search inputs (建议添加)
```

## 文件组织架构

### 推荐的文件结构

```
src/
├─ components/          # 通用组件
│  ├─ CollapsibleCard/
│  ├─ ErrorBoundary/
│  └─ Loading/
│
├─ pages/              # 页面组件
│  ├─ Home/
│  │  ├─ index.jsx
│  │  ├─ index.css
│  │  └─ components/   # 页面级组件
│  └─ ...
│
├─ hooks/              # 自定义Hooks
│  ├─ useSpeciesData.js
│  ├─ useSSRStats.js
│  └─ useTablePagination.js
│
├─ services/           # API服务
│  ├─ species.js
│  ├─ ssr.js
│  └─ blast.js
│
├─ utils/              # 工具函数
│  ├─ format.js
│  ├─ validate.js
│  └─ constants.js
│
├─ styles/             # 全局样式
│  ├─ variables.css
│  └─ theme.js
│
└─ App.jsx             # 主应用
```

## 部署架构

### 开发环境

```
Developer Machine
├─ Frontend Dev Server (Port 3000)
│  └─ React App + Hot Reload
└─ Backend API Server (Port 3001)
   └─ API Endpoints + Database
```

### 生产环境建议

```
Load Balancer
│
├─ Static Assets (CDN)
│  ├─ JS bundles
│  ├─ CSS files
│  └─ Images
│
├─ Web Server (Nginx)
│  ├─ React App (index.html)
│  └─ Reverse Proxy to API
│
└─ API Server Cluster
   ├─ Node.js Server 1
   ├─ Node.js Server 2
   └─ Database Connection Pool
        │
        ▼
   Database (Postgres/MongoDB)
```

---

## 总结

本项目采用了现代React应用的标准架构：

✅ **组件化设计** - 页面和功能高度模块化  
✅ **路由管理** - HashRouter + 懒加载  
✅ **状态管理** - 组件级状态 + Hooks  
✅ **数据流** - 单向数据流，明确的API交互  
✅ **性能优化** - 代码分割、分页、缓存  
✅ **可维护性** - 清晰的文件组织和命名  

**可改进空间**：
- 引入全局状态管理（Context/Redux/Zustand）
- 添加数据缓存层（React Query/SWR）
- 实现更多的性能优化（虚拟滚动、图片懒加载）
- 增强错误处理（Error Boundary）
- 添加测试覆盖
