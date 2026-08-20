"""
Recall AI 志愿填报助手 - FastAPI 后端代理
作用：前端不直接调用大模型 API（避免暴露 Key + 避免 CORS），通过此后端转发。
技术栈：FastAPI + Uvicorn + httpx
"""

import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from dotenv import load_dotenv

# 自动加载同目录下的 .env 文件（启动时读取，修改后需重启生效）
# 显式指定脚本所在目录，避免从不同 cwd 启动时找不到 .env
_env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(_env_file, override=True)

app = FastAPI(title="Recall Backend", version="0.1.0")

# ====== CORS：允许本地前端页面调用 ======
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # MVP 阶段允许所有；上线后改为你的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====== 环境变量 / 默认配置 ======
# 建议在项目根目录创建 .env 文件：DEEPSEEK_API_KEY=sk-xxx
DEFAULT_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEFAULT_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")


# ====== 请求模型 ======
class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    model: str = "deepseek-chat"
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1024
    stream: Optional[bool] = False


class TestRequest(BaseModel):
    model: str = "deepseek-chat"
    base_url: Optional[str] = "https://api.deepseek.com"


# ====== 工具函数 ======
def build_headers(api_key: str):
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }


# ====== 健康检查 ======
@app.get("/")
def root():
    return {"status": "ok", "service": "Recall Backend"}


@app.get("/health")
def health():
    return {"status": "ok"}


# ====== 测试连接 ======
@app.post("/api/test")
async def test_connection(req: TestRequest):
    """
    测试大模型 API 是否通。
    优先读取环境变量 DEEPSEEK_API_KEY；环境变量不存在时返回提示。
    """
    api_key = DEFAULT_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="未配置 API Key。请在 backend/.env 中设置 DEEPSEEK_API_KEY=sk-xxx 或在环境变量中配置。",
        )

    base_url = (req.base_url or DEFAULT_BASE_URL).rstrip("/")
    url = f"{base_url}/chat/completions"

    payload = {
        "model": req.model,
        "messages": [{"role": "user", "content": "你好"}],
        "max_tokens": 5,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(url, headers=build_headers(api_key), json=payload)
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"无法连接模型服务：{str(e)}")

    if res.status_code == 200:
        return {"ok": True, "model": req.model, "message": "连接成功"}

    # 透传错误
    err_text = res.text[:500]
    raise HTTPException(status_code=res.status_code, detail=err_text)


# ====== 聊天代理 ======
@app.post("/api/chat")
async def chat(req: ChatRequest):
    """
    代理大模型聊天请求。Key 只存在后端环境变量，不暴露给前端。
    """
    api_key = DEFAULT_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="未配置 API Key。请在 backend/.env 中设置 DEEPSEEK_API_KEY=sk-xxx。",
        )

    base_url = DEFAULT_BASE_URL.rstrip("/")
    url = f"{base_url}/chat/completions"

    payload = {
        "model": req.model,
        "messages": [m.model_dump() for m in req.messages],
        "temperature": req.temperature,
        "max_tokens": req.max_tokens,
        "stream": req.stream,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, headers=build_headers(api_key), json=payload)
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"模型服务连接失败：{str(e)}")

    if res.status_code != 200:
        raise HTTPException(status_code=res.status_code, detail=res.text[:800])

    return res.json()


# ====== 托管前端页面（关键：让页面与 API 同源，彻底避免 file:// 与 CORS 问题）======
# 访问 http://localhost:8011/pages/Recall_API设置.html 即可，不要再 file:// 双击打开
_FRONTEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if os.path.isdir(_FRONTEND_DIR):
    app.mount("/pages", StaticFiles(directory=_FRONTEND_DIR, html=True), name="pages")


# ====== 启动入口 ======
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8011, reload=False)
