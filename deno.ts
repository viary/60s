// 替换项目自带的 deno.ts，适配 Vercel Deno 运行时
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import app from "./src/app.ts";

// 转换 Oak 应用为 Vercel Deno 支持的请求处理器
const handler = async (req: Request): Promise<Response> => {
  try {
    // 处理静态页面（index.html），访问根目录或 index.html 时返回页面
    const url = new URL(req.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const htmlFile = await Deno.readFile("./index.html");
      return new Response(htmlFile, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // 处理所有 API 请求，转发给 60s 项目的 Oak 应用
    return await app.handle(req);
  } catch (error) {
    console.error("请求处理错误：", error);
    return new Response(
      JSON.stringify({
        code: 500,
        message: "服务器内部错误，请稍后重试",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  }
};

// 启动 Vercel Deno 服务器，处理所有入站请求
serve(handler);
