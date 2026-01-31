<template>
  <div class="app">
    <el-container>
      <el-header>
        <h1>MP4 视频管理系统</h1>
      </el-header>
      <el-main>
        <VideoManager />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import VideoManager from './components/VideoManager.vue'
</script>

<style>
.app {
  min-height: 100vh;
}

.el-header {
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
}

.el-header h1 {
  margin: 0;
}
</style>