import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import path from 'path';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface VideoInfo {
  name: string;
  size: number;
  duration: string;
  path: string;
}

class SimpleVideoServer {
  private server: any;
  private videoDirectory: string;

  constructor(videoDir?: string) {
    this.server = fastify({
      logger: true
    });
    
    // 设置视频存储目录，默认为系统临时目录下的videos文件夹
    this.videoDirectory = videoDir || path.join(os.tmpdir(), 'videos');
    
    // 确保视频目录存在
    this.ensureVideoDirectory();
    
    this.setupRoutes();
  }

  private async ensureVideoDirectory() {
    try {
      await fsPromises.access(this.videoDirectory);
    } catch {
      await fsPromises.mkdir(this.videoDirectory, { recursive: true });
    }
  }

  private setupRoutes() {
    // 注册multipart插件用于文件上传
    this.server.register(fastifyMultipart, {
      limits: {
        fileSize: 3 * 1024 * 1024 * 1024, // 3GB limit for large videos
        fields: 10,
        files: 1
      }
    });

    // 注册静态文件服务
    this.server.register(fastifyStatic, {
      root: this.videoDirectory,
      prefix: '/videos/',
    });

    // 获取视频列表
    this.server.get('/api/videos', async (req: any, res: any) => {
      try {
        const files = await fsPromises.readdir(this.videoDirectory);
        const videoFiles = files.filter(file => 
          file.toLowerCase().endsWith('.mp4') || 
          file.toLowerCase().endsWith('.mov') || 
          file.toLowerCase().endsWith('.avi') ||
          file.toLowerCase().endsWith('.mkv')
        );

        const videoInfos: VideoInfo[] = [];
        
        for (const fileName of videoFiles) {
          const filePath = path.join(this.videoDirectory, fileName);
          const stats = await fsPromises.stat(filePath);
          
          // 获取视频时长 - 简化版本，如果没有ffprobe则返回未知
          let duration = 'Unknown';
          try {
            // 尝试使用ffprobe获取视频时长
            const { stdout } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`);
            const durationInSeconds = parseFloat(stdout.trim());
            const hours = Math.floor(durationInSeconds / 3600);
            const minutes = Math.floor((durationInSeconds % 3600) / 60);
            const seconds = Math.floor(durationInSeconds % 60);
            
            if (hours > 0) {
              duration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
              duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
          } catch (error) {
            // 如果ffprobe不可用，使用文件修改时间作为替代
            console.log(`Could not get duration for ${fileName}, using placeholder`);
          }

          videoInfos.push({
            name: fileName,
            size: stats.size,
            duration,
            path: `/videos/${encodeURIComponent(fileName)}`
          });
        }

        res.send(videoInfos);
      } catch (error) {
        req.log.error(error);
        res.status(500).send({ error: 'Failed to retrieve video list' });
      }
    });

    // 上传视频
    this.server.post('/api/upload', async (req: any, res: any) => {
      try {
        const data = await req.file();
        if (!data) {
          return res.status(400).send({ error: 'No file uploaded' });
        }

        // 检查文件类型
        const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
        if (!allowedTypes.includes(data.mimetype)) {
          return res.status(400).send({ error: 'Invalid file type. Only MP4, MOV, AVI, MKV allowed.' });
        }

        const filePath = path.join(this.videoDirectory, data.filename);
        const writeStream = fs.createWriteStream(filePath);
        
        await new Promise((resolve, reject) => {
          data.file.pipe(writeStream);
          writeStream.on('error', reject);
          writeStream.on('finish', () => resolve(undefined));
        });

        res.send({ message: 'File uploaded successfully', filename: data.filename });
      } catch (error) {
        req.log.error(error);
        res.status(500).send({ error: 'Upload failed' });
      }
    });

    // 删除视频
    this.server.delete('/api/video/:filename', async (req: any, res: any) => {
      try {
        const { filename } = req.params;
        const decodedFilename = decodeURIComponent(filename);
        const filePath = path.join(this.videoDirectory, decodedFilename);
        
        // 验证路径安全性，防止路径遍历攻击
        const resolvedPath = path.resolve(filePath);
        const videoDirResolved = path.resolve(this.videoDirectory);
        
        if (!resolvedPath.startsWith(videoDirResolved)) {
          return res.status(400).send({ error: 'Invalid file path' });
        }

        await fsPromises.unlink(filePath);
        res.send({ message: 'File deleted successfully' });
      } catch (error) {
        req.log.error(error);
        res.status(500).send({ error: 'Delete failed' });
      }
    });

    // 下载视频
    this.server.get('/api/download/:filename', async (req: any, res: any) => {
      try {
        const { filename } = req.params;
        const decodedFilename = decodeURIComponent(filename);
        const filePath = path.join(this.videoDirectory, decodedFilename);
        
        // 验证路径安全性
        const resolvedPath = path.resolve(filePath);
        const videoDirResolved = path.resolve(this.videoDirectory);
        
        if (!resolvedPath.startsWith(videoDirResolved)) {
          return res.status(400).send({ error: 'Invalid file path' });
        }

        res.header('Content-Disposition', `attachment; filename="${decodedFilename}"`);
        res.sendFile(decodedFilename, this.videoDirectory);
      } catch (error) {
        req.log.error(error);
        res.status(500).send({ error: 'Download failed' });
      }
    });

    // 传输视频到FPGA（模拟接口）
    this.server.post('/api/fpga-transfer', async (req: any, res: any) => {
      try {
        const { videoPath } = req.body;
        
        // 验证视频路径
        if (!videoPath || !videoPath.startsWith('/videos/')) {
          return res.status(400).send({ error: 'Invalid video path' });
        }

        // 这里是模拟FPGA传输逻辑
        // 在实际实现中，这里会通过PCIe传输到FPGA
        console.log(`Simulating transfer of video to FPGA: ${videoPath}`);
        
        // 模拟传输过程
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        res.send({ 
          message: 'Video transferred to FPGA successfully', 
          videoPath,
          status: 'simulated' 
        });
      } catch (error) {
        req.log.error(error);
        res.status(500).send({ error: 'FPGA transfer failed' });
      }
    });

    // 主页路由
    this.server.get('/', async (req: any, res: any) => {
      res.type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Web MP4 视频管理系统</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .api-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .api-endpoint { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Web MP4 视频管理系统</h1>
            <p>欢迎使用 Web MP4 视频管理系统！</p>
            <p>这是一个基于 Node.js 和 Vue.js 的视频管理 Web 应用程序，支持 MP4 等视频格式的上传、播放、下载和管理。</p>
            
            <div class="api-section">
              <h2>API 接口文档</h2>
              <ul>
                <li><strong>GET <span class="api-endpoint">/api/videos</span></strong> - 获取视频列表</li>
                <li><strong>POST <span class="api-endpoint">/api/upload</span></strong> - 上传视频文件</li>
                <li><strong>DELETE <span class="api-endpoint">/api/video/{filename}</span></strong> - 删除视频文件</li>
                <li><strong>GET <span class="api-endpoint">/api/download/{filename}</span></strong> - 下载视频文件</li>
                <li><strong>POST <span class="api-endpoint">/api/fpga-transfer</span></strong> - 传输视频到FPGA</li>
              </ul>
            </div>
            
            <div class="api-section">
              <h2>使用说明</h2>
              <p>要使用此服务，请通过前端应用或API客户端访问以上接口。</p>
              <p>前端应用应在 <a href="/client/">/client/</a> 路径下提供（如果已部署）</p>
            </div>
          </div>
        </body>
        </html>
      `);
    });

    // 提供API文档路由
    this.server.get('/api/docs', async (req: any, res: any) => {
      res.type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Video Server API Documentation</title>
        </head>
        <body>
          <h1>Video Server API Documentation</h1>
          <ul>
            <li><strong>GET /api/videos</strong> - Get list of videos</li>
            <li><strong>POST /api/upload</strong> - Upload a video file</li>
            <li><strong>DELETE /api/video/{filename}</strong> - Delete a video file</li>
            <li><strong>GET /api/download/{filename}</strong> - Download a video file</li>
            <li><strong>POST /api/fpga-transfer</strong> - Transfer video to FPGA</li>
          </ul>
        </body>
        </html>
      `);
    });
  }

  public async start(port: number = 3000) {
    try {
      await this.server.listen({ port, host: '0.0.0.0' });
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Video directory: ${this.videoDirectory}`);
    } catch (error) {
      this.server.log.error(error);
      throw error;
    }
  }

  public getServer() {
    return this.server;
  }
}

export default SimpleVideoServer;