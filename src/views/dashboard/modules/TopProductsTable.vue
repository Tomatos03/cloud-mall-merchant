<template>
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-800">商品销量排行 Top 10</h3>
            <el-button link type="primary" @click="handleViewFullReport">查看完整报表</el-button>
        </div>
        <el-table
            :data="topProducts"
            style="width: 100%"
            :header-cell-style="{ background: '#f8faff' }"
        >
            <el-table-column label="排名" width="80" align="center">
                <template #default="{ row }">
                    <div
                        :class="[
                            'w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-bold',
                            row.rank <= 3
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-500',
                        ]"
                    >
                        {{ row.rank }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="商品信息" min-width="300">
                <template #default="{ row }">
                    <div class="flex items-center gap-3">
                        <el-image
                            :src="row.goodsCover"
                            class="w-12 h-12 rounded-lg shrink-0"
                            fit="cover"
                        />
                        <span class="font-medium text-gray-800">{{ row.goodsName }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="saleCount" label="销量" width="120" align="right" sortable>
                <template #default="{ row }">
                    <span class="font-semibold text-gray-800">{{ row.saleCount }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="saleAmount" label="销售额" width="150" align="right" sortable>
                <template #default="{ row }">
                    <span class="font-bold text-orange-600">{{
                        formatPrice(row.saleAmount.toString())
                    }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
                <template #default="{ row }">
                    <el-button
                        link
                        type="primary"
                        size="small"
                        @click="handleViewProductDetail(row.goodsId)"
                    >
                        查看详情
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup lang="ts">
    import type { TopProduct } from '@/api/dashboard'
    import { formatPrice } from '@/utils/money'

    interface Props {
        topProducts: TopProduct[]
    }

    interface Emits {
        (e: 'view-report'): void
    }

    defineProps<Props>()
    const emit = defineEmits<Emits>()

    const handleViewFullReport = () => {
        emit('view-report')
    }

    const handleViewProductDetail = (goodsId: number) => {
        console.log('查看商品详情:', goodsId)
        // TODO: 导航到商品详情页面
    }
</script>

<style scoped>
    :deep(.el-table) {
        --el-table-border-color: #f0f0f0;
        --el-table-header-text-color: #606266;
    }

    :deep(.el-image__error) {
        background-color: #f5f5f5;
    }
</style>
