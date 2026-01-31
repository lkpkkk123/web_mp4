#!/bin/bash

# Web MP4 项目部署脚本

echo "开始部署 Web MP4 项目..."

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    exit 1
fi

# 检查npm是否已安装
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装"
    exit 1
fi

echo "Node.js 和 npm 已安装"

# 安装依赖
echo "安装项目依赖..."
npm install

# 编译TypeScript
echo "编译 TypeScript 代码..."
npm run build

# 检查编译是否成功
if [ $? -ne 0 ]; then
    echo "编译失败，请检查错误"
    exit 1
fi

echo "编译成功"

# 启动应用
echo "启动 Web MP4 服务..."
npm start &

echo "Web MP4 服务已在后台启动"
echo "访问 http://localhost:3000 查看应用"

# 启动前端开发服务器（如果需要）
read -p "是否同时启动前端开发服务器? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "启动前端开发服务器..."
    cd src/web
    npm install
    npm run dev
fi