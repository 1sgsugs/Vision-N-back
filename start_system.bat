@echo off

:: 检查并创建信号文件夹
if not exist "C:\UCWinRoadSignals" mkdir "C:\UCWinRoadSignals"

echo 启动系统...

:: 启动HTTP服务器（监听所有网络接口）
start "HTTP Server" cmd /k "python -m http.server 8000 --bind 0.0.0.0"

:: 等待HTTP服务器启动
timeout /t 2 /nobreak >nul

:: 打开浏览器
start http://localhost:8000/

echo 系统已启动！
echo 1. HTTP服务器已启动，用于提供N-back任务网页
 echo 2. 浏览器已打开，正在加载N-back任务

echo 注意：如需停止系统，请关闭所有打开的命令窗口。