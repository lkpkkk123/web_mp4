import path from 'path';
import fs from 'fs';

export function loadConfig<T>(configPath: string, defaultConfig: T): T {
  try {
    if (fs.existsSync(configPath)) {
      // 配置文件存在，读取并合并
      const fileContent = fs.readFileSync(configPath, 'utf8');
      const userConfig = JSON.parse(fileContent);
      console.log(`配置文件已加载: ${configPath}`);
      let cfg = { ...defaultConfig, ...userConfig };
      // Ensure new fields are written if missing in userConfig (merged)
      fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
      return cfg;
    } else {
      // 配置文件不存在，创建默认配置文件
      let dir = path.dirname(configPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        'utf8'
      );
      console.log(`配置文件已创建: ${configPath}`);
      return defaultConfig;
    }
  } catch (error) {
    console.log(`加载配置文件失败: ${configPath}, 错误: ${error}`);
    console.log('使用默认配置');
    return defaultConfig;
  }
}
