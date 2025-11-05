import React from 'react';
import './App.css';
import Home from './pages/Home';
import Search from './pages/Search';
import Test from './pages/Test';
import Genomes from './pages/Genomes';
import Download from './pages/Download';
import Species from './pages/Genomes/Species';
import { Layout, Menu, Row, Col, Breadcrumb, Divider, theme as antTheme } from 'antd';
import { Route, Switch, Redirect, NavLink, useHistory, Link, useLocation } from 'react-router-dom';
import Tools from './pages/Tools';
import Network from './pages/Network';
import AIChatToggle from './components/AIChatToggle';

const { Header, Content, Footer } = Layout;

function App() {
  const history = useHistory();
  const location = useLocation();
  const { token } = antTheme.useToken();

  const menuComponent = [
    {
      label: 'Home',
      key: '/Home',
    },
    {
      label: 'Search',
      key: '/Search',
    },
    {
      label: 'Genomes',
      key: '/Genomes',
    },
    {
      label: 'Tools',
      key: '/tools',
      children: [
        {
          label: 'BLASH',
          key: '/tools/blash'
        },
        {
          label: 'JBrowse',
          key: '/tools/jbrowse'
        },
        {
          label: 'SSR Finder',
          key: '/tools/ssrfinder'
        },
        {
          label: 'Synteny Viewer',
          key: '/tools/synteny'
        },
        {
          label: 'DE Gene Analysis',
          key: '/tools/de'
        }
      ],
      onTitleClick: () => {
        history.push('/tools');
      }
    },
    {
      label: 'Download',
      key: '/Download',
    },
    {
      label: 'Test',
      key: '/Test',
    },
    {
      label: 'Network',
      key: '/Network',
    },
  ];

  const onClick = (e) => {
    console.log('Menu clicked:', e.key);
    if (location.pathname !== e.key) {
      history.push(e.key);
    }
  };

  const menuStyle = {
    backgroundColor: 'transparent',
    color: token.colorBgElevated,
  };

  // 生成面包屑导航项
  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = [];
    
    // 添加 Home 链接
    breadcrumbItems.push(
      <Breadcrumb.Item key="home">
        <Link to="/Home">Home</Link>
      </Breadcrumb.Item>
    );

    // 处理不同的路由情况
    if (pathSnippets.length === 0 || pathSnippets[0] === 'Home') {
      return breadcrumbItems;
    }

    const route = pathSnippets[0].toLowerCase();
    
    switch (route) {
      case 'species':
        breadcrumbItems.push(
          <Breadcrumb.Item key="genomes">
            <Link to="/Genomes">Genomes</Link>
          </Breadcrumb.Item>,
          <Breadcrumb.Item key="species">
            {decodeURIComponent(pathSnippets[1])}
          </Breadcrumb.Item>
        );
        break;
        
      case 'tools':
        // 添加 Tools 链接
        breadcrumbItems.push(
          <Breadcrumb.Item key="tools">
            <Link to="/tools">Tools</Link>
          </Breadcrumb.Item>
        );
        
        // 如果有子页面，添加对应的工具名称
        if (pathSnippets.length > 1) {
          const toolsMap = {
            'blash': 'BLASH 序列比对工具',
            'jbrowse': 'JBrowse 基因组浏览器',
            'ssrfinder': 'SSR Finder 查找工具',
            'synteny': 'Synteny Viewer 工具',
            'de': 'DE Gene Analysis 差异表达基因分析工具'
          };
          
          const toolKey = pathSnippets[1].toLowerCase();
          breadcrumbItems.push(
            <Breadcrumb.Item key={toolKey}>
              {toolsMap[toolKey] || toolKey.charAt(0).toUpperCase() + toolKey.slice(1)}
            </Breadcrumb.Item>
          );
        }
        break;
        
      default:
        // 处理其他页面
        breadcrumbItems.push(
          <Breadcrumb.Item key={route}>
            {route.charAt(0).toUpperCase() + route.slice(1)}
          </Breadcrumb.Item>
        );
    }

    return breadcrumbItems;
  };

  // 修改懒加载导入方式
  const Blash = React.lazy(() => 
    import('./pages/Tools/Blash').then(module => ({
      default: module.default || module
    }))
  );

  const JBrowse = React.lazy(() => 
    import('./pages/Tools/jbrowse').then(module => ({
      default: module.default || module
    }))
  );

  const SSRFinder = React.lazy(() => 
    import('./pages/Tools/ssrfinder').then(module => ({
      default: module.default || module
    }))
  );

  const SyntenyViewer = React.lazy(() => 
    import('./pages/Tools/synteny').then(module => ({
      default: module.default || module
    }))
  );

  const DEGeneAnalysis = React.lazy(() => 
    import('./pages/Tools/DE').then(module => ({
      default: module.default || module
    }))
  );

  return (
    <div>
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header style={{  top: '0', width: '100%', zIndex: '999', height: '60px', }} className='Appheader'>
          <Row>
            <Col span={4} style={{ fontSize: '30px', color: 'white', paddingLeft: '10px' }}>
              <NavLink style={{ color: 'white' }} to='/Home'>
                <span >
                  <span style={{ fontSize: '30px' }}>XX DB</span>
                  <span style={{ fontSize: '8px' }}>v0.1</span>
                </span>
              </NavLink>
            </Col>
            <Col span={16}>
              <Menu
                mode="horizontal"
                defaultSelectedKeys={['/Home']}
                style={menuStyle}
                selectedKeys={[location.pathname]}
                items={menuComponent}
                onClick={onClick}
                triggerSubMenuAction="hover"
              >
              </Menu>
            </Col>
          </Row>
        </Header>
        <Content style={{ width: '100%', padding: '0 15%' }}>
          <div>
            <Breadcrumb style={{ margin: '10px 20px' }}>
              {getBreadcrumbItems()}
            </Breadcrumb>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Switch>
                <Route path='/Home' component={Home} />
                <Route path='/Search' component={Search} />
                <Route path='/Genomes' component={Genomes} />
                <Route path='/species/:name' component={Species} />
                <Route path='/Test' component={Test} />
                <Route path='/Network' component={Network} />
                <Route path='/Download' component={Download} />
                <Route exact path="/tools" component={Tools} />
                <Route path="/tools/blash" component={Blash} />
                <Route path="/tools/jbrowse" component={JBrowse} />
                <Route path="/tools/ssrfinder" component={SSRFinder} />
                <Route path="/tools/synteny" component={SyntenyViewer} />
                <Route path="/tools/de" component={DEGeneAnalysis} />
                <Redirect to='/Home' />
              </Switch>
            </React.Suspense>
          </div>
        </Content>
        <Footer style={{

          textAlign: 'center',
        }}>
          Text
          <Divider type="vertical" />
          <a href="#">Link</a>
          <Divider type="vertical" />
          <a href="#">Link</a>
        </Footer>
      </Layout>
      
      <AIChatToggle />
    </div>
  );
}

export default App;
