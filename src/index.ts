import * as child_process from 'child_process';
import { createLogger, logger } from './log/logger';
import { loadConfig } from './config';
import Deque from 'double-ended-queue';

let CONFIG = {
  logType: 3,
  logPath: 'log/data_fusion.log', // Updated to include filename in path or handle in logger
  logFileName: 'data_fusion.log',
  logLevel: 'debug',
  limitSize: '10m',
  limitCount: 20,
  mqttServers: ['mqtt://192.168.8.234:1883'],
  mqttUser: 'admin',
  mqttPass: '123456',

  sftpServers: ['sftp://192.168.8.234:22'],
  sftpUser: 'admin',
  sftpPass: '123456',
  sftpDir: '/home/downlod',
  SN: 'HYDF20260116001',
  PN: 'HSIM20203995966',
};
let mapMsg: Map<string, Deque<string>>;

async function Init() {
  CONFIG = loadConfig('cfg/config.json', CONFIG);
  createLogger({
    level: CONFIG.logLevel,
    filePath: CONFIG.logPath,
    logToConsole: true,
    limitSize: CONFIG.limitSize,
    limitCount: CONFIG.limitCount,
  });

  mapMsg = new Map<string, Deque<string>>();

  logger.info('Hello from TSGo on Node ' + process.version);
}

(async () => {
  await Init();
})();

let msgCount = 0;
setInterval(() => {
  logger.debug(`test ... ${msgCount++}`);

  let mem = process.memoryUsage();
  mem.rss = mem.rss / 1024 / 1024;
  mem.heapUsed = mem.heapUsed / 1024 / 1024;
  mem.heapTotal = mem.heapTotal / 1024 / 1024;
  mem.external = mem.external / 1024 / 1024;
  mem.arrayBuffers = mem.arrayBuffers / 1024 / 1024;
  logger.info('内存使用：' + JSON.stringify(mem));
}, 500);

export { CONFIG, mapMsg };
