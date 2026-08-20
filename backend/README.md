# Recall 后端代理

## 作用
前端页面不直接调用大模型 API（避免暴露 API Key，同时绕过浏览器 CORS 限制），通过本 FastAPI 后端转发。

## 快速启动

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境（推荐）
python -m venv venv

# 3. 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# 4. 安装依赖
pip install -r requirements.txt

# 5. 复制环境变量文件并填写 Key
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY=sk-xxx

# 6. 启动服务
python main.py
```

服务启动后访问：http://localhost:8011

## 接口说明

| 接口 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 健康检查 |
| `/api/test` | POST | 测试大模型连接 |
| `/api/chat` | POST | 代理聊天请求 |

## 前端配置

在 `Recall_API设置.html` 中：
- 模型名称：`deepseek-chat`
- Base URL：`http://localhost:8011`
- API Key：任意填（后端从环境变量读取真实 Key，前端 Key 仅作占位）
