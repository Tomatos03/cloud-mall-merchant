<template>
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6">快捷入口</h3>
        <div class="grid grid-cols-3 gap-4">
            <div
                class="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                @click="$router.push('/goods/publish')"
            >
                <div
                    class="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl mb-2"
                >
                    <Plus />
                </div>
                <span class="text-sm text-gray-600 font-medium">发布商品</span>
            </div>
            <div
                class="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                @click="$router.push('/order')"
            >
                <div
                    class="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white text-xl mb-2"
                >
                    <List />
                </div>
                <span class="text-sm text-gray-600 font-medium">订单管理</span>
            </div>
            <div
                class="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                @click="$router.push('/store')"
            >
                <div
                    class="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white text-xl mb-2"
                >
                    <Brush />
                </div>
                <span class="text-sm text-gray-600 font-medium">店铺装修</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Plus, List, Brush } from '@element-plus/icons-vue'
</script>
