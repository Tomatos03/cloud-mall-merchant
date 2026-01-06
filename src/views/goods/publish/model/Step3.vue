```vue /home/Tomatos/Projects/design/cloud-mall-manager/src/views/goods/publish/model/Step3.vue
<template>
    <div class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
        <el-result
            icon="success"
            :title="isEdit ? '商品更新成功' : '商品发布成功'"
        >
            <template #sub-title>
                <div class="text-gray-500 mt-2">
                    <p v-if="isEdit">您的商品信息已成功同步至商城系统</p>
                    <p v-else>您的商品已成功上架，现在可以在商城中进行销售了</p>
                </div>
            </template>
            <template #extra>
                <div class="flex gap-4 mt-4">
                    <el-button 
                        type="primary" 
                        size="large" 
                        class="px-8 rounded-xl! shadow-lg shadow-blue-100"
                        @click="$emit('reset')"
                    >
                        继续发布
                    </el-button>
                    <el-button 
                        size="large" 
                        class="px-8 rounded-xl!"
                        @click="router.push('/goods')"
                    >
                        返回列表
                    </el-button>
                </div>
            </template>
        </el-result>

        <!-- 快捷操作 -->
        <div class="mt-12 grid grid-cols-3 gap-6 w-full max-w-3xl px-6">
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center hover:bg-blue-50 transition-colors cursor-pointer group">
                <el-icon :size="24" class="text-gray-400 group-hover:text-blue-500 mb-2"><View /></el-icon>
                <span class="text-sm font-medium text-gray-600 group-hover:text-blue-600">预览商品</span>
            </div>
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center hover:bg-blue-50 transition-colors cursor-pointer group">
                <el-icon :size="24" class="text-gray-400 group-hover:text-blue-500 mb-2"><Share /></el-icon>
                <span class="text-sm font-medium text-gray-600 group-hover:text-blue-600">分享商品</span>
            </div>
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center hover:bg-blue-50 transition-colors cursor-pointer group">
                <el-icon :size="24" class="text-gray-400 group-hover:text-blue-500 mb-2"><Promotion /></el-icon>
                <span class="text-sm font-medium text-gray-600 group-hover:text-blue-600">营销推广</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { View, Share, Promotion } from '@element-plus/icons-vue'

defineProps<{
    isEdit: boolean
}>()

defineEmits<{
    (e: 'reset'): void
}>()

const router = useRouter()
</script>

<style scoped>
:deep(.el-result__title p) {
    font-size: 24px;
    font-weight: 800;
    color: #1f2937;
}
</style>
