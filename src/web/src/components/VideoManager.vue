<template>
  <div class="video-manager">
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-upload
          class="upload-demo"
          action="/api/upload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :headers="{ 'Content-Type': 'multipart/form-data' }"
          :show-file-list="false"
          accept=".mp4,.mov,.avi,.mkv"
        >
          <el-button type="primary" :icon="Upload">上传视频</el-button>
        </el-upload>
      </el-col>
    </el-row>

    <el-table
      :data="videoList"
      style="width: 100%"
      :loading="loading"
      stripe
    >
      <el-table-column prop="name" label="视频名称" width="300" />
      <el-table-column prop="size" label="文件大小" width="120">
        <template #default="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长" width="120" />
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small" 
            @click="playVideo(row)"
            :icon="VideoPlay"
          >
            播放
          </el-button>
          <el-button 
            type="success" 
            size="small" 
            @click="downloadVideo(row)"
            :icon="Download"
          >
            下载
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="deleteVideo(row)"
            :icon="Delete"
          >
            删除
          </el-button>
          <el-button 
            type="warning" 
            size="small" 
            @click="transferToFPGA(row)"
            :icon="Position"
          >
            传输到FPGA
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 视频播放弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="视频播放"
      width="80%"
      :before-close="handleDialogClose"
    >
      <div class="video-player-container">
        <video
          ref="videoRef"
          :src="currentVideoUrl"
          controls
          width="100%"
          height="auto"
        >
          您的浏览器不支持视频播放
        </video>
      </div>
    </el-dialog>

    <!-- FPGA传输进度弹窗 -->
    <el-dialog
      v-model="fpgaDialogVisible"
      title="FPGA传输状态"
      width="40%"
    >
      <div class="fpga-status">
        <el-progress
          :percentage="fpgaProgress"
          :status="fpgaProgress === 100 ? 'success' : undefined"
          :indeterminate="fpgaProgress < 100"
          :duration="1"
        />
        <p>{{ fpgaStatusText }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { 
  Upload, 
  VideoPlay, 
  Download, 
  Delete, 
  Position 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface VideoInfo {
  name: string
  size: number
  duration: string
  path: string
}

const videoList = ref<VideoInfo[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentVideoUrl = ref('')
const fpgaDialogVisible = ref(false)
const fpgaProgress = ref(0)
const fpgaStatusText = ref('准备传输...')
const videoRef = ref<HTMLVideoElement>()

const fetchVideos = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/videos')
    videoList.value = response.data
  } catch (error) {
    console.error('获取视频列表失败:', error)
    ElMessage.error('获取视频列表失败')
  } finally {
    loading.value = false
  }
}

const handleUploadSuccess = (response: any) => {
  console.log('上传成功:', response)
  ElMessage.success('视频上传成功')
  fetchVideos() // 刷新视频列表
}

const handleUploadError = (error: any) => {
  console.error('上传失败:', error)
  ElMessage.error('视频上传失败')
}

const playVideo = (row: VideoInfo) => {
  currentVideoUrl.value = row.path
  dialogVisible.value = true
}

const downloadVideo = async (row: VideoInfo) => {
  try {
    window.location.href = `/api/download/${encodeURIComponent(row.name)}`
    ElMessage.success('正在下载视频...')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

const deleteVideo = async (row: VideoInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除视频 "${row.name}" 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await axios.delete(`/api/video/${encodeURIComponent(row.name)}`)
    ElMessage.success('删除成功')
    fetchVideos() // 刷新视频列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const transferToFPGA = async (row: VideoInfo) => {
  fpgaDialogVisible.value = true
  fpgaProgress.value = 0
  fpgaStatusText.value = '正在准备传输...'
  
  try {
    // 模拟传输过程
    const interval = setInterval(() => {
      if (fpgaProgress.value < 90) {
        fpgaProgress.value += 10
        fpgaStatusText.value = `传输中... ${fpgaProgress.value}%`
      }
    }, 500)
    
    // 发送传输请求
    const response = await axios.post('/api/fpga-transfer', {
      videoPath: row.path
    })
    
    clearInterval(interval)
    fpgaProgress.value = 100
    fpgaStatusText.value = '传输完成！'
    
    console.log('FPGA传输响应:', response.data)
    ElMessage.success('视频已传输到FPGA')
    
    // 3秒后关闭对话框
    setTimeout(() => {
      fpgaDialogVisible.value = false
    }, 3000)
  } catch (error) {
    console.error('FPGA传输失败:', error)
    clearInterval(fpgaProgress.value)
    ElMessage.error('FPGA传输失败')
    fpgaDialogVisible.value = false
  }
}

const handleDialogClose = () => {
  dialogVisible.value = false
  if (videoRef.value) {
    videoRef.value.pause()
  }
  currentVideoUrl.value = ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  fetchVideos()
})
</script>

<style scoped>
.video-manager {
  padding: 20px;
}

.video-player-container {
  text-align: center;
}

.fpga-status {
  text-align: center;
}
</style>