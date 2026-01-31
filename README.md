# Web MP4 视频管理系统

一个基于Node.js和Vue.js的视频管理Web应用程序，支持MP4等视频格式的上传、播放、下载和管理，并提供与FPGA传输的接口。

## 功能特性

- 视频上传（支持MP4、MOV、AVI、MKV格式，最大支持3GB）
- 视频列表展示（包含名称、大小、时长信息）
- 在线视频播放
- 视频下载
- 视频删除
- 传输到FPGA模拟接口

## 技术栈

### 后端
- Node.js
- Fastify (Web框架)
- TypeScript
- @fastify/static (静态文件服务)
- @fastify/multipart (文件上传)

### 前端
- Vue 3
- Element Plus (UI组件库)
- Axios (HTTP客户端)
- Vite (构建工具)

## 快速开始

### 后端启动

1. 安装依赖：
```bash
npm install
```

2. 编译TypeScript：
```bash
npm run build
```

3. 启动服务：
```bash
npm start
```

服务将在 `http://localhost:3000` 上运行。

### 前端启动

在 `src/web` 目录下：

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

前端将在 `http://localhost:5173` 上运行，并通过代理将 `/api` 请求转发到后端。

## API接口

- `GET /api/videos` - 获取视频列表
- `POST /api/upload` - 上传视频文件
- `DELETE /api/video/{filename}` - 删除视频文件
- `GET /api/download/{filename}` - 下载视频文件
- `POST /api/fpga-transfer` - 传输视频到FPGA（模拟）

## FPGA传输功能

项目包含了传输视频到FPGA的接口设计，当前为模拟实现。实际部署时，可在该接口中实现通过PCIe传输视频到FPGA的功能。

## 配置

视频文件默认存储在系统临时目录下的 `videos` 文件夹中。可通过修改构造函数参数指定自定义路径。