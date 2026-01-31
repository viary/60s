// 60s 项目 Vercel Node.js 终极适配版（内嵌前端页面，无外部文件依赖）
const url = require('url');

// 内嵌前端页面 HTML 内容（无需读取外部 index.html）
const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>60s API 内容展示</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
  <style>
    .content-box {
      min-height: 400px;
      white-space: pre-wrap;
    }
    .loading {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body class="bg-gray-100 min-h-screen p-4 md:p-8">
  <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
    <h1 class="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">60s API 内容展示</h1>
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">选择接口</label>
        <select id="api-select" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="/v2/weibo">微博热搜</option>
          <option value="/v2/zhihu">知乎热搜</option>
          <option value="/v2/epic">Epic 免费游戏</option>
          <option value="/v2/quark">夸克热点</option>
          <option value="/v2/maoyan/movie">猫眼实时票房</option>
        </select>
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">展示格式</label>
        <select id="format-select" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="json">JSON（原始数据）</option>
          <option value="text">纯文本</option>
          <option value="markdown">Markdown（美观展示）</option>
        </select>
      </div>
      <div class="flex items-end">
        <button id="refresh-btn" class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新内容
        </button>
      </div>
    </div>
    <div id="loading" class="hidden justify-center items-center mb-4">
      <svg class="w-6 h-6 text-blue-500 loading" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      <span class="ml-2 text-gray-600">加载中...</span>
    </div>
    <div class="border border-gray-300 rounded-md p-4 content-box bg-gray-50 text-gray-800 overflow-auto" id="content"></div>
  </div>
  <script>
    const API_BASE_URL = ''; // 内嵌页面无需指定域名，直接相对路径请求
    const apiSelect = document.getElementById('api-select');
    const formatSelect = document.getElementById('format-select');
    const refreshBtn = document.getElementById('refresh-btn');
    const loading = document.getElementById('loading');
    const contentBox = document.getElementById('content');

    window.onload = fetchApiData;
    refreshBtn.addEventListener('click', fetchApiData);

    async function fetchApiData() {
      loading.classList.remove('hidden');
      loading.classList.add('flex');
      contentBox.innerHTML = '';

      try {
        const apiPath = apiSelect.value;
        const format = formatSelect.value;
        const requestUrl = \`\${apiPath}?encoding=\${format}\`; // 相对路径，避免域名问题

        const response = await fetch(requestUrl);
        if (!response.ok) throw new Error(\`HTTP 错误：\${response.status}\`);

        let content = '';
        if (format === 'json') {
          const data = await response.json();
          content = JSON.stringify(data, null, 2);
        } else if (format === 'text') {
          content = await response.text();
        } else if (format === 'markdown') {
          const mdText = await response.text();
          content = marked.parse(mdText);
        }

        if (format === 'markdown') {
          contentBox.innerHTML = content;
        } else {
          contentBox.textContent = content;
        }
      } catch (error) {
        contentBox.textContent = \`加载失败：\${error.message}\\n请刷新页面重试\`;
      } finally {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
      }
    }
  </script>
</body>
</html>
`;

// API 核心逻辑（模拟数据，无外部依赖）
class ApiService {
  constructor() {
    this.routes = {
      '/v2/weibo': this.getWeiboHot,
      '/v2/zhihu': this.getZhihuHot,
      '/v2/epic': this.getEpicFree,
      '/v2/quark': this.getQuarkHot,
      '/v2/maoyan/movie': this.getMaoyanBox
    };
  }

  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const encoding = parsedUrl.query.encoding || 'json';

    // 返回前端页面（根路径或 index.html）
    if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(HTML_CONTENT);
      return;
    }

    // 处理 API 请求
    const routeHandler = this.routes[pathname];
    if (routeHandler) {
      try {
        const data = await routeHandler.call(this);
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

  formatToText(data) {
    let text = `更新时间：${data.updateTime}\\n\\n`;
    data.data.forEach(item => {
      for (const key in item) {
        text += `${key}：${item[key]}  `;
      }
      text += '\\n';
    });
    return text;
  }

  formatToMarkdown(data) {
    let md = `# 数据展示（更新时间：${data.updateTime}）\\n\\n`;
    md += '| 序号 | 内容 | 附加信息 |\\n';
    md += '| ---- | ---- | -------- |\\n';
    data.data.forEach((item, index) => {
      const values = Object.values(item);
      md += `| ${index+1} | ${values[1]} | ${values[2] || '无'} |\\n`;
    });
    return md;
  }
}

// Vercel Serverless 函数入口（仅保留必要逻辑，无本地运行代码）
const apiService = new ApiService();
module.exports = async (req, res) => {
  await apiService.handleRequest(req, res);
};
