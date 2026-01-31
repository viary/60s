// 后端核心：ESM 格式（适配项目 "type": "module"），请求第三方接口解决跨域
import axios from 'axios'; // ESM 导入语法（替换 CommonJS 的 require）

// 配置：60s 全接口地址
const API_CONFIG = {
  "60s": "https://api.vikiboss.com/v2/60s",
  "weibo": "https://api.vikiboss.com/v2/weibo",
  "zhihu": "https://api.vikiboss.com/v2/zhihu",
  "epic": "https://api.vikiboss.com/v2/epic",
  "quark": "https://api.vikiboss.com/v2/quark",
  "maoyan": "https://api.vikiboss.com/v2/maoyan/movie",
  "weather": "https://api.vikiboss.com/v2/weather?city=全国",
  "tech": "https://api.vikiboss.com/v2/tech",
  "history": "https://api.vikiboss.com/v2/history",
  "finance": "https://api.vikiboss.com/v2/finance",
  "movie": "https://api.vikiboss.com/v2/movie",
  "english": "https://api.vikiboss.com/v2/english"
};

// Vercel Serverless 函数入口：ESM 格式（export default 替换 CommonJS 的 module.exports）
export default async (req, res) => {
  // 1. 允许跨域（关键：解决前端请求自己后端的跨域问题）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // 2. 获取前端传递的参数（接口类型 + 展示格式）
    const { dataKey, format } = req.query;
    if (!dataKey || !API_CONFIG[dataKey]) {
      return res.status(400).json({ code: 400, message: '无效的接口类型' });
    }

    // 3. 后端请求第三方 API（无跨域限制）
    const apiUrl = `${API_CONFIG[dataKey]}?encoding=${format || 'json'}`;
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // 4. 把第三方 API 数据返回给前端
    if (format === 'json') {
      res.status(200).json(response.data);
    } else {
      res.status(200).send(response.data);
    }
  } catch (error) {
    // 5. 错误处理
    res.status(500).json({
      code: 500,
      message: '后端请求第三方接口失败',
      error: error.message || '未知错误'
    });
  }
};
