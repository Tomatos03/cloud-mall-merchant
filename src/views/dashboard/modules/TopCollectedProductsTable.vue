<template>
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-800">收藏商品排行 Top 10</h3>
            <el-button link type="primary" @click="handleViewFullReport">查看完整报表</el-button>
        </div>
        <el-table
            :data="topCollectedProducts"
            style="width: 100%"
            :header-cell-style="{ background: '#f8faff' }"
        >
            <el-table-column type="index" label="排名" width="80" align="center">
                <template #default="scope">
                    <div
                        :class="[
                            'w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs font-bold',
                            scope.$index < 3
                                ? 'bg-pink-100 text-pink-600'
                                : 'bg-gray-100 text-gray-500',
                        ]"
                    >
                        {{ scope.$index + 1 }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="300">
                <template #default="{ row }">
                    <div class="flex items-center">
                        <el-image
                            :src="row.goodsImage"
                            class="w-10 h-10 rounded-lg mr-3"
                            fit="cover"
                        />
                        <span class="font-medium text-gray-700">{{ row.goodsName }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                prop="favoriteTotal"
                label="累计收藏数"
                width="150"
                align="right"
                sortable
            />
            <el-table-column
                prop="favoriteLast7Days"
                label="最近7天收藏数"
                width="150"
                align="right"
                sortable
            />
        </el-table>
    </div>
</template>

<script setup lang="ts">
    import type { TopCollectedProduct } from '@/api/dashboard'

    interface Props {
        topCollectedProducts: TopCollectedProduct[]
    }

    interface Emits {
        (e: 'view-report'): void
    }

    defineProps<Props>()
    const emit = defineEmits<Emits>()

    const handleViewFullReport = () => {
        emit('view-report')
    }
</script>

<style scoped>
    :deep(.el-table) {
        --el-table-border-color: #f0f0f0;
        --el-table-header-text-color: #606266;
    }
</style>
