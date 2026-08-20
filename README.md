# Recall 志愿填报助手

> 面向高三毕业生的 AI 志愿填报助手 —— 通过"性格测评 + 分数匹配 + 对话记忆"三重引擎，帮助学生从上千所院校中精准定位适合自己的学校和专业。

[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![DeepSeek](https://img.shields.io/badge/DeepSeek-API-4D6BFE)](https://platform.deepseek.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 项目简介

**Recall** 是一个本地优先的 AI 志愿填报助手原型，包含 7 个高保真页面与一个 FastAPI 后端代理：

- **前端**：纯静态 HTML + 原生 JS，马卡龙治愈系设计系统（`recall-ui.css`），无需构建即可运行；
- **后端**：FastAPI 代理，前端页面不直接调用大模型 API（避免暴露 API Key、绕过浏览器 CORS 限制），由后端统一转发至 DeepSeek；
- **数据**：内置 67 所广东本科院校、3268 个专业（其中 73% 为 2025 年真实录取数据），支持按分数段做"冲 / 稳 / 保"分档推荐。

核心差异点：**每条推荐都带"因为…所以…"的白盒归因**（如"因为你性格偏研究型，且提到怕纯计算，所以推荐应用化学而非金融"），让推荐可信、可解释。

### 页面清单

| 页面 | 文件 | 功能 |
| --- | --- | --- |
| 入口页 | `index.html` | 原型总入口（必须通过 `http://` 访问） |
| 主页 | `pages/Recall_主页.html` | 画像卡、分数匹配推荐、收藏对比、院校/专业搜索 |
| 性格测评 | `pages/Recall_测评.html` | 18 题霍兰德测评 → 六维雷达图 + 三维画像 |
| 推荐详情 | `pages/Recall_推荐详情.html` | 冲/稳/保分组 + 白盒归因报告 |
| 方案管理 | `pages/Recall_方案管理.html` | 多版本模拟（方案 A/B/C）、版本对比 |
| AI 答疑 | `pages/Recall_AI答疑.html` | 真实模型驱动的多轮对话 + 偏好记忆 |
| API 设置 | `pages/Recall_API设置.html` | 模型/Key/BaseURL 配置 + 连接测试 |
| 专业详情 | `pages/Recall_专业详情.html` | 简介、核心课程、就业前景、学费分档 |

---

## ✨ 特性列表

- 🧠 **极简性格测评**：18 题霍兰德 RIASEC 简化版，2 分钟完成，AI 自动生成"学科能力 + 性格倾向 + 职业兴趣"三维画像；
- 🎯 **AI 智能志愿匹配**：分数匹配（冲/稳/保）+ 性格标签 + 硬规则过滤（地域/学费）多路召回，输出 Top10 适配方案；
- 💬 **对话式偏好记忆**（核心）：支持自然语言修改偏好，如"我怕数学"、"不想去东北"，AI 实时理解并更新记忆、动态调整推荐；
- 📋 **多版本模拟推演**：创建方案 A（610 留省内）/ 方案 B（620 出省）等副本，各版本记忆隔离，支持并排对比；
- 🔍 **AI 白盒归因**：每条推荐附带"因为…所以…"逻辑链，推荐决策可解释；
- 📄 **志愿预案导出**：一键生成带性格分析摘要的《志愿填报预案》PDF（接口预留，可对接 WeasyPrint/Playwright）；
- 🏫 **院校/专业知识库**：67 所广东本科院校、3268 个专业（2025 真实录取数据占 73%），支持按省份、专业、数学需求度等多维筛选；
- 🔒 **API Key 安全**：真实 Key 只存后端 `.env`，前端仅作占位校验，页面通过后端代理访问模型；
- 🎨 **治愈系设计系统**：主色 `#5B8DEF` / 辅色 `#A8D8EA` / 强调色 `#FFB347`，软圆角 + 渐变 + 柔和阴影，响应式断点 860px；
- 📱 **响应式布局**：PC / 平板 / 手机三端自适应。

---

## 🚀 安装步骤

### 环境要求

- Python 3.9+（推荐 3.11+）
- 现代浏览器（Chrome / Edge / Safari 最新版）
- DeepSeek API Key（[platform.deepseek.com](https://platform.deepseek.com) 申请）

### 方式一：双击启动（Windows 推荐）

```text
1. 双击 backend\start.bat
2. 脚本自动检查依赖 → 启动后端 → 打开浏览器
3. 访问 http://localhost:8011/pages/index.html
```

> `start.bat` 会自动安装缺失依赖；首次运行需 1-2 分钟。

### 方式二：手动安装（跨平台）

```bash
# 1. 克隆/进入项目
cd 志愿填报

# 2. 创建并激活虚拟环境
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# 3. 安装后端依赖
cd backend
pip install -r requirements.txt

# 4. 配置环境变量（见下方「配置说明」）
cp .env.example .env

# 5. 启动后端服务
python main.py
```

启动成功后浏览器访问：**http://localhost:8011/pages/index.html**

> ⚠️ **务必用 `http://` 打开页面**。不要直接双击 HTML 文件（`file://` 协议），否则浏览器会按 CORS 拦截对后端的请求，出现 `Failed to fetch`。

---

## 💻 代码示例

### 1. 调用后端代理（前端）

```javascript
// AI 答疑：代理聊天请求（前端不接触真实 Key）
async function askAI(messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,               // [{role:'system'|'user'|'assistant', content:'...'}]
      temperature: 0.7,
      max_tokens: 1500,
      stream: false
    })
  });
  if (!res.ok) throw new Error('请求失败: ' + res.status);
  return res.json();                    // DeepSeek 原始响应
}
```

### 2. 测试模型连接

```bash
curl -X POST http://localhost:8011/api/test \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek-chat"}'
# 预期: {"ok": true, "model": "deepseek-chat", "message": "连接成功"}
```

### 3. Python 直连后端

```python
import httpx

r = httpx.post(
    "http://localhost:8011/api/chat",
    json={
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你是志愿填报助手，回答简洁专业。"},
            {"role": "user", "content": "广东物理类 610 分，适合冲哪些学校？"},
        ],
        "temperature": 0.7,
        "max_tokens": 800,
    },
    timeout=30,
)
print(r.json()["choices"][0]["message"]["content"])
```

### 4. 前端本地画像持久化（localStorage 键一览）

| Key | 内容 | 使用页面 |
| --- | --- | --- |
| `recall_profile` | 基础信息（省份/选科/分数/各科成绩/偏好） | 主页 / 方案管理 / 推荐详情 |
| `recall_persona` | 测评画像（霍兰德六维分数 + 前 2 型） | 主页 / 推荐详情 |
| `recall_plans` | 多版本方案列表 | 方案管理 |
| `recall_chats` | AI 答疑对话历史 | AI 答疑 |
| `recall_api_config` | 模型配置（占位 Key + BaseURL） | API 设置 |
| `recall_fav_schools` / `recall_fav_majors` | 收藏 | 主页 / 专业详情 |
| `recall_prefill` | 专业详情 → AI 答疑预填问题 | 专业详情 |

---

## ⚙️ 配置说明

### 后端环境变量（`backend/.env`）

| 变量 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | ✅ | 无 | DeepSeek 平台申请的 API Key（`sk-` 开头） |
| `DEEPSEEK_BASE_URL` | 否 | `https://api.deepseek.com` | 模型服务 Base URL，可换成通义/硅基流动等兼容接口 |

```ini
# backend/.env 示例
DEEPSEEK_API_KEY=sk-你的真实Key
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

> 修改 `.env` 后需重启后端生效（`main.py` 在启动时读取，`override=True`）。

### 前端模型配置（`Recall_API设置.html` 页面内）

| 字段 | 填写值 | 说明 |
| --- | --- | --- |
| 模型名称 | `deepseek-chat` | 或 `deepseek-v4-flash` 等 |
| Base URL | `http://localhost:8011` | **指向本地后端代理**，不是 DeepSeek 官网 |
| API Key | 任意占位 | 真实 Key 由后端 `.env` 提供，前端不存储 |

### 端口与静态托管

- 后端监听：`0.0.0.0:8011`（`main.py` 中 `port=8011`，如需修改请同步改前端 Base URL 与 `start.bat`）；
- 静态页面：后端自动挂载项目根目录为 `/pages`，保证页面与 API **同源**，彻底规避 CORS。

---

## 🤝 贡献指引

欢迎提交 Issue 与 Pull Request！请遵循以下约定：

1. **Fork 本仓库**，从 `main` 分支切出你的功能分支（`feature/xxx`）；
2. **编码规范**
   - 后端：PEP 8 + FastAPI 风格，Pydantic 校验所有入参；
   - 前端：单文件 HTML（共享 `recall-ui.css`），禁止 CDN 外部依赖；JS 变量使用 `camelCase`，CSS 变量使用设计令牌（`--main`/`--sub`/`--ink` 等）；
   - 涉及 AI 归因/提示词时，遵循"白盒归因"原则，每条推荐必须有可解释理由。
3. **提交信息**：`feat:` / `fix:` / `docs:` / `refactor:` 前缀 + 中文描述；
4. **自测清单**（提交前必须通过）
   - [ ] 页面通过 `http://localhost:8011/pages/*` 访问无 CORS 报错；
   - [ ] 后端 `python main.py` 无启动报错，`/api/test` 返回 `ok`；
   - [ ] 新增院校/专业数据时 `MATH_REQ` 映射覆盖 100%（无未分类专业）；
   - [ ] 浏览器控制台零报错、零 `alert()` 残留。
5. **提 PR**：描述改动动机、影响范围与验证截图。

**开发建议**：本地体验全流程 = 启动后端 → 入口页进"主页" → 改分数/偏好 → AI 答疑发消息 → 方案管理建 A/B 对比。

---

## 📄 许可证信息

本项目目前以 **MIT License** 发布（见根目录 `LICENSE`）。

```text
MIT License

Copyright (c) 2026 Recall 志愿填报助手

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> 📌 提示：`data/schools_*.json` 中的录取分数/位次来源于公开渠道整理（2025 年），**仅用于演示**，正式商用前请核对官方数据源；院校数据本身不属于 MIT 代码许可范畴，使用时请遵守数据来源的使用条款。

---

## 🗂️ 项目结构

```text
志愿填报/
├── index.html                  # 原型总入口（http 访问）
├── recall-ui.css               # 共享设计系统（马卡龙令牌）
├── Recall_主页.html            # 主页
├── Recall_测评.html            # 性格测评
├── Recall_推荐详情.html        # 推荐详情
├── Recall_方案管理.html        # 方案管理
├── Recall_AI答疑.html          # AI 答疑
├── Recall_API设置.html         # API 设置
├── Recall_专业详情.html        # 专业详情
├── backend/
│   ├── main.py                 # FastAPI 后端代理（端口 8011）
│   ├── start.bat               # Windows 一键启动
│   ├── requirements.txt        # 后端依赖
│   ├── .env.example            # 环境变量模板
│   └── README.md               # 后端独立说明
├── data/
│   └── schools_*.json          # 67 校 3268 专业数据库（2025 真实数据占 73%）
└── PRD.md                      # 产品需求文档（含 Mermaid 流程图）
```

---

*README 最后更新：2026-08-20*
