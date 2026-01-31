// 60s1 项目 Node.js 适配入口，兼容 Vercel Serverless Function
const http = require('http');
const { readFileSync } = require('fs');
const { join } = require('path');

// 模拟 Oak 应用的核心接口（已简化适配，无需依赖外部包）
class App {
  constructor() {
    this.routes = {};
    this.initRoutes();
  }

  initRoutes() {
    // 注册核心 API 路由
    this.routes['/v2/weibo'] = this.getWeiboHot;
    this.routes['/v2/zhihu'] = this.getZhihuHot;
    this.routes['/v2/epic'] = this.getEpicFree;
    this.routes['/v2/quark'] = this.getQuarkHot;
    this.routes['/v2/maoyan/movie'] = this.getMaoyanBox;
  }

  async handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const encoding = url.searchParams.get('encoding') || 'json';

    // 处理静态页面（index.html）
    if (pathname === '/' || pathname === '/index.html') {
      try {
        const htmlPath = join(__dirname, 'index.html');
        const htmlContent = readFileSync(htmlPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(htmlContent);
        return;
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('index.html 页面未找到');
        return;
      }
    }

    // 处理 API 请求
    const routeHandler = this.routes[pathname];
    if (routeHandler) {
      try {
        const data = await routeHandler();
        let responseContent = '';

        switch (encoding) {
          case 'json':
            responseContent = JSON.stringify(data, null, 2);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            break;
          case 'text':
            responseContent = this.formatToText(data);
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            break;
          case 'markdown':
            responseContent = this.formatToMarkdown(data);
            res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
            break;
          default:
            responseContent = JSON.stringify(data, null, 2);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        }

        res.end(responseContent);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          code: 500,
          message: 'API 数据获取失败',
          error: err.message
        }, null, 2));
      }
      return;
    }

    // 未知路由
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      code: 404,
      message: '接口不存在'
    }, null, 2));
  }

  // 模拟微博热搜数据（真实环境会爬取，这里模拟返回避免跨域/爬取限制）
  async getWeiboHot() {
    return {
      code: 200,
      updateTime: new Date().toLocaleString(),
      data: [
        { rank: 1, title: '模拟微博热搜1', hotValue: '100万+' },
        { rank: 2, title: '模拟微博热搜2', hotValue: '98万+' },
        { rank: 3, title: '模拟微博热搜3', hotValue: '90万+' }
      ]
    };
  }

  // 模拟知乎热搜数据
  async getZhihuHot() {
    return {
      code: 200,
      updateTime: new Date().toLocaleString(),
      data: [
        { rank: 1, title: '模拟知乎热搜1', commentCount: '1.2万' },
        { rank: 2, title: '模拟知乎热搜2', commentCount: '8900' },
        { rank: 3, title: '模拟知乎热搜3', commentCount: '7600' }
      ]
    };
  }

  // 模拟 Epic 免费游戏
  async getEpicFree() {
    return {
      code: 200,
      updateTime: new Date().toLocaleString(),
      data: [
        { name: '模拟免费游戏1', status: '当前免费', endTime: '2026-02-10' },
        { name: '模拟免费游戏2', status: '即将免费', startTime: '2026-02-11' }
      ]
    };
  }

  // 模拟夸克热点
  async getQuarkHot() {
    return {
      code: 200,
      updateTime: new Date().toLocaleString(),
      data: [
        { rank: 1, title: '模拟夸克热点1' },
        { rank: 2, title: '模拟夸克热点2' },
        { rank: 3, title: '模拟夸克热点3' }
      ]
    };
  }

  // 模拟猫眼票房
  async getMaoyanBox() {
    return {
      code: 200,
      updateTime: new Date().toLocaleString(),
      data: [
        { rank: 1, movieName: '模拟电影1', boxOffice: '5.6亿' },
        { rank: 2, movieName: '模拟电影2', boxOffice: '3.2亿' },
        { rank: 3, movieName: '模拟电影3', boxOffice: '1.8亿' }
      ]
    };
  }

  // 格式化为纯文本
  formatToText(data) {
    let text = `更新时间：${data.updateTime}\n\n`;
    data.data.forEach((item, index) => {
      for (const key in item) {
        text += `${key}：${item[key]}  `;
      }
      text += '\n';
    });
    return text;
  }

  // 格式化为 Markdown
  formatToMarkdown(data) {
    let md = `# 数据展示（更新时间：${data.updateTime}）\n\n`;
    md += '| 序号 | 内容 | 附加信息 |\n';
    md += '| ---- | ---- | -------- |\n';
    data.data.forEach((item, index) => {
      const values = Object.values(item);
      md += `| ${index+1} | ${values[1]} | ${values[2] || '无'} |\n`;
    });
    return md;
  }
}

// 启动 Vercel Node.js 服务器
const app = new App();
module.exports = async (req, res) => {
  await app.handleRequest(req, res);
};

// 本地运行支持（可选，不影响 Vercel 部署）
if (require.main === module) {
  const server = http.createServer((req, res) => {
    app.handleRequest(req, res);
  });
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
  });
}
