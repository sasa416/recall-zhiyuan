@echo off
chcp 65001 >nul
title Recall 后端服务

echo ============================================================
echo    Recall AI 志愿填报 - 后端代理启动脚本
echo ============================================================
echo.

cd /d "%~dp0"

REM 检查 .env
if not exist ".env" (
    echo [错误] .env 文件不存在！
    echo 请先复制 .env.example 为 .env 并填入 DEEPSEEK_API_KEY
    pause
    exit /b 1
)

REM 检查 Key 是否还是占位
findstr /C:"sk-请在这里" .env >nul 2>&1
if %errorlevel%==0 (
    echo.
    echo ============================================================
    echo   [警告] 你的 API Key 还是占位符！
    echo   请打开 backend\.env 编辑，把 DEEPSEEK_API_KEY 改成你的真实 Key
    echo   获取地址: https://platform.deepseek.com
    echo ============================================================
    echo.
    set /p continue=按回车继续启动(测试模式)，或 Ctrl+C 退出先去填Key：
)

REM 检查 Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 python，请先安装 Python 3.9+ 并加入 PATH
    pause
    exit /b 1
)

REM 检查依赖
echo [1/3] 检查 Python 依赖...
python -c "import fastapi" 2>nul
if %errorlevel% neq 0 (
    echo [提示] 正在安装依赖（首次启动需要 1-2 分钟）...
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

REM 启动服务（后台运行，新窗口显示日志，避免阻塞自动打开浏览器）
echo.
echo [2/3] 启动 FastAPI 服务...
echo ============================================================
echo   后端地址: http://localhost:8011
echo   页面地址: http://localhost:8011/pages/Recall_API设置.html
echo   后端日志窗口请保持开启；关闭它即停止服务
echo ============================================================
echo.

start "Recall 后端" python main.py

REM 等待后端就绪后自动打开浏览器（用 http:// 访问，避免 file:// 跨域问题）
echo [3/3] 等待后端启动并打开页面...
timeout /t 3 >nul
start "" http://localhost:8011/pages/index.html

echo.
echo ============================================================
echo    页面已自动在浏览器打开。
echo    若浏览器没反应，请手动访问:
echo    http://localhost:8011/pages/index.html
echo ============================================================
echo.
echo [提示] 关闭"Recall 后端"窗口即可停止服务。按任意键退出本窗口。
pause