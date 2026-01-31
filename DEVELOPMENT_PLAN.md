# Web MP4 项目开发计划

## 项目概述
基于feature.md的需求，开发一个用于展示和管理MP4视频文件的Web应用，包含服务端和客户端两部分。

## 已完成的工作

### 服务端 (Node.js + Fastify)
- ✅ 使用Fastify框架搭建HTTP服务器
- ✅ 实现静态文件服务，用于视频播放
- ✅ 实现视频上传功能（支持大文件，最大3GB）
- ✅ 实现视频列表展示（包含名称、大小、时长）
- ✅ 实现视频删除功能
- ✅ 实现视频下载功能
- ✅ 实现模拟的FPGA传输接口
- ✅ 生成API文档
- ✅ 使用TypeScript编写，确保类型安全

### 客户端 (Vue3 + Element Plus)
- ✅ 使用Vue3 + Vite + Element Plus搭建前端框架
- ✅ 创建视频管理组件
- ✅ 实现视频列表展示（名称、大小、时长）
- ✅ 实现上传按钮功能
- ✅ 实现删除按钮功能
- ✅ 实现播放按钮功能（弹窗播放器）
- ✅ 实现下载按钮功能
- ✅ 实现"传输到FPGA"按钮功能（带进度条）

## 当前状态
- 服务端API已完成并测试通过
- 前端界面基本完成
- 依赖项已配置
- 项目结构符合要求(src/web/目录)

## 待完成的工作

### 前端完善
1. 完成前端页面样式优化
2. 完善错误处理机制
3. 添加加载状态指示器
4. 实现更友好的用户体验

### 集成测试
1. 前后端联调测试
2. 大文件上传测试
3. 视频播放兼容性测试
4. 边界情况测试

### FPGA接口实现
1. 实现真实的PCIe到FPGA传输逻辑（当前为模拟）
2. 添加传输状态监控
3. 实现传输进度实时反馈

### 部署配置
1. 创建Dockerfile
2. 配置生产环境设置
3. 添加环境变量管理

## 测试方案

### 功能测试清单
- [ ] 视频上传（小文件）
- [ ] 视频上传（大文件，接近3GB）
- [ ] 视频列表展示
- [ ] 视频播放功能
- [ ] 视频下载功能
- [ ] 视频删除功能
- [ ] FPGA传输功能（模拟）
- [ ] 错误处理（无效文件类型）
- [ ] 错误处理（文件过大）
- [ ] 并发上传测试

### 性能测试
- [ ] 大文件上传性能
- [ ] 多用户并发访问
- [ ] 长时间运行稳定性

## 部署说明

### 开发环境启动
```bash
# 启动后端服务
cd web_mp4
npm install
npm run build
npm run serve

# 启动前端开发服务器
cd src/web
npm install
npm run dev
```

### 生产环境部署
```bash
# 构建生产版本
npm run build

# 启动服务
npm start
```

## 项目结构
```
web_mp4/
├── package.json              # 项目配置
├── tsconfig.json            # TypeScript配置
├── README.md               # 项目说明
├── DEVELOPMENT_PLAN.md     # 开发计划
├── src/
│   ├── index.ts            # 主入口文件
│   ├── server-simple.ts    # 服务端实现
│   ├── config.ts           # 配置管理
│   └── log/
│       └── logger.ts       # 日志系统
│   └── web/                # 前端代码
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/
│           ├── main.ts
│           ├── App.vue
│           └── components/
│               └── VideoManager.vue
├── dist/                   # 编译输出目录
└── test-server.js          # 测试脚本
```

## API文档

### GET /api/videos
获取视频列表
- 返回: Array<{name, size, duration, path}>

### POST /api/upload
上传视频文件
- 表单字段: file
- 返回: {message, filename}

### DELETE /api/video/{filename}
删除指定视频
- 参数: filename (URL编码)
- 返回: {message}

### GET /api/download/{filename}
下载指定视频
- 参数: filename (URL编码)

### POST /api/fpga-transfer
传输视频到FPGA
- 请求体: {videoPath}
- 返回: {message, videoPath, status}