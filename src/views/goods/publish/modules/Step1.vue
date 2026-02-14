```vue /home/Tomatos/Projects/design/cloud-mall-manager/src/views/goods/publish/model/Step1.vue
<template>
    <div class="flex flex-col items-center justify-center py-12">
        <div class="text-center mb-12">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">选择发布方式</h2>
            <p class="text-gray-500">您可以从现有模板快速导入，或从零开始发布新商品</p>
        </div>

        <div class="flex gap-8 max-w-4xl w-full px-6">
            <!-- 选项 1: 发布新商品 -->
            <div
                class="flex-1 bg-white rounded-2xl p-8 border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group shadow-sm"
                @click="$emit('select', 'new')"
            >
                <div
                    class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors"
                >
                    <el-icon :size="32" class="text-blue-500 group-hover:text-white"
                        ><Plus
                    /></el-icon>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-3">发布新商品</h3>
                <p class="text-gray-500 text-sm leading-relaxed">
                    手动填写商品基本信息、上传图片并配置规格参数，适用于发布全新的商品。
                </p>
                <div class="mt-8 flex items-center text-blue-600 font-semibold text-sm">
                    立即开始 <el-icon class="ml-1"><ArrowRight /></el-icon>
                </div>
            </div>

            <!-- 选项 2: 从模板导入 -->
            <div
                class="flex-1 bg-white rounded-2xl p-8 border-2 border-transparent hover:border-orange-500 hover:shadow-xl transition-all cursor-pointer group shadow-sm"
                @click="$emit('select', 'template')"
            >
                <div
                    class="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors"
                >
                    <el-icon :size="32" class="text-orange-500 group-hover:text-white"
                        ><DocumentCopy
                    /></el-icon>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-3">从模板导入</h3>
                <p class="text-gray-500 text-sm leading-relaxed">
                    选择已有的商品模板，快速填充常用参数，只需修改差异部分即可发布。
                </p>
                <div class="mt-8 flex items-center text-orange-600 font-semibold text-sm">
                    去选择模板 <el-icon class="ml-1"><ArrowRight /></el-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Plus, DocumentCopy, ArrowRight } from '@element-plus/icons-vue'

    defineEmits<{
        (e: 'select', type: 'new' | 'template'): void
    }>()
</script>

<style scoped>
    .group:hover h3 {
        color: var(--el-color-primary);
    }
</style>
