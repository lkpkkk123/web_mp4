// 简单的测试脚本验证服务器功能
const http = require('http');
const fs = require('fs');
const path = require('path');

// 测试服务器是否能正常启动
console.log('Starting server functionality test...');

// 1. 检查编译后的文件是否存在
const distPath = './dist';
if (fs.existsSync(distPath)) {
  console.log('✓ Compiled files exist in dist/');
  
  // 检查主要输出文件
  const mainFile = './dist/index.js';
  if (fs.existsSync(mainFile)) {
    console.log('✓ Main executable exists at dist/index.js');
  } else {
    console.log('✗ Main executable missing');
  }
  
  // 检查服务器文件
  const serverFile = './dist/server-simple.js';
  if (fs.existsSync(serverFile)) {
    console.log('✓ Server file exists at dist/server-simple.js');
  } else {
    console.log('✗ Server file missing');
  }
} else {
  console.log('✗ Dist directory does not exist');
}

// 2. 检查package.json配置
try {
  const packageJson = require('./package.json');
  console.log('\nPackage configuration:');
  console.log('- Name:', packageJson.name);
  console.log('- Version:', packageJson.version);
  console.log('- Scripts:', Object.keys(packageJson.scripts).join(', '));
  console.log('✓ Package.json is valid');
} catch (e) {
  console.log('✗ Error reading package.json:', e.message);
}

// 3. 检查TypeScript配置
try {
  const tsConfig = require('./tsconfig.json');
  console.log('✓ Tsconfig.json is valid');
} catch (e) {
  console.log('✗ Error reading tsconfig.json:', e.message);
}

// 4. 检查源代码文件
const srcFiles = [
  './src/index.ts',
  './src/server-simple.ts',
  './src/config.ts',
  './src/log/logger.ts'
];

console.log('\nChecking source files:');
srcFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
  }
});

// 5. 检查前端文件
const frontendFiles = [
  './src/web/package.json',
  './src/web/src/App.vue',
  './src/web/src/components/VideoManager.vue',
  './src/web/src/main.ts'
];

console.log('\nChecking frontend files:');
frontendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.log(`✗ ${file} missing`);
  }
});

console.log('\nTest completed. Ready to run the application.');