# 使用官方Node.js运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和锁定文件到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制源代码到工作目录
COPY src/ ./src/

# 编译TypeScript代码
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]