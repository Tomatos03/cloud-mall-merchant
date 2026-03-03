<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <div
            class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4 flex items-center justify-between"
        >
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-3">
                    <span class="text-sm font-semibold text-[#64748b] uppercase tracking-wider"
                        >状态</span
                    >
                    <el-select
                        v-model="searchStatus"
                        placeholder="全部状态"
                        clearable
                        @change="handleSearch"
                        class="custom-select"
                        style="width: 120px"
                    >
                        <el-option
                            v-for="(item, key) in ApplyStatusMap"
                            :key="key"
                            :label="item.label"
                            :value="Number(key)"
                        />
                    </el-select>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <el-button class="reset-btn" @click="handleReset">
                    <el-icon class="mr-1"><RefreshRight /></el-icon>
                    重置
                </el-button>
            </div>
        </div>

        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false" :loading="loading">
                <template #activityName="{ row }">
                    <span class="font-medium text-gray-700">{{ row.activityName }}</span>
                </template>

                <template #product="{ row }">
                    <div class="flex items-center gap-2">
                        <el-image
                            v-if="row.productImage"
                            :src="row.productImage"
                            class="w-10 h-10 rounded"
                            fit="cover"
                        />
                        <span class="text-gray-600 truncate">{{ row.productName }}</span>
                    </div>
                </template>

                <template #seckillPrice="{ row }">
                    <span class="text-red-500 font-semibold">¥{{ row.seckillPrice }}</span>
                </template>

                <template #stock="{ row }">
                    <span>{{ row.stock }}</span>
                </template>

                <template #status="{ row }">
                    <el-tag :type="ApplyStatusMap[row.status]?.type" effect="dark">
                        {{ ApplyStatusMap[row.status]?.label }}
                    </el-tag>
                </template>

                <template #action="{ row }">
                    <el-button link type="primary" size="small" @click="onView(row)">
                        详情
                    </el-button>
                    <el-button
                        v-if="row.status === ApplyStatus.PENDING"
                        link
                        type="danger"
                        size="small"
                        @click="onCancel(row)"
                    >
                        取消
                    </el-button>
                    <el-button
                        v-if="row.status === ApplyStatus.REJECTED"
                        link
                        type="primary"
                        size="small"
                        @click="onEdit(row)"
                    >
                        修改
                    </el-button>
                </template>
            </Table>
        </div>

        <div class="mt-6 flex justify-end">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                class="custom-pagination"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { RefreshRight } from '@element-plus/icons-vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import Table from '@/components/table/Table.vue'
    import {
        fetchApplyList,
        cancelApply,
        ApplyStatus,
        ApplyStatusMap,
        type SeckillApply,
    } from '@/api/seckill'

    const router = useRouter()

    const columns = [
        { id: '1', label: '活动名称', key: 'activityName', minWidth: 150 },
        { id: '2', label: '商品信息', key: 'product', minWidth: 200 },
        { id: '3', label: '秒杀价', key: 'seckillPrice', width: 100 },
        { id: '4', label: '库存', key: 'stock', width: 80 },
        { id: '5', label: '状态', key: 'status', width: 100 },
    ]

    const data = ref<SeckillApply[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const searchStatus = ref<number | undefined>()

    const loadData = async () => {
        loading.value = true
        try {
            const res = await fetchApplyList({
                page: page.value,
                pageSize: pageSize.value,
                status: searchStatus.value,
            })
            data.value = res.data.records || []
            total.value = Number(res.data.total) || 0
        } finally {
            loading.value = false
        }
    }

    const handlePageChange = (val: number) => {
        page.value = val
        loadData()
    }

    const handleSizeChange = (val: number) => {
        pageSize.value = val
        page.value = 1
        loadData()
    }

    const handleSearch = () => {
        page.value = 1
        loadData()
    }

    const handleReset = () => {
        searchStatus.value = undefined
        page.value = 1
        loadData()
    }

    const onView = (row: SeckillApply) => {
        router.push(`/seckill/applies/${row.id}`)
    }

    const onEdit = (row: SeckillApply) => {
        router.push(`/seckill/applies/${row.id}?edit=1`)
    }

    const onCancel = (row: SeckillApply) => {
        ElMessageBox.confirm('确定要取消该申请吗？', '提示', {
            type: 'warning',
        }).then(async () => {
            await cancelApply(row.id)
            ElMessage.success('取消成功')
            loadData()
        })
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped>
    .custom-select :deep(.el-input__wrapper) {
        background-color: #f8fafc;
        box-shadow: none !important;
        border: 1px solid #f1f5f9;
        border-radius: 8px;
    }

    .reset-btn {
        border: 1px solid #e2e8f0;
        background-color: #fff;
        color: #64748b;
        font-weight: 500;
        border-radius: 8px;
        padding: 8px 16px;
    }

    .reset-btn:hover {
        background-color: #f8fafc;
        color: #1e293b;
    }

    .custom-pagination :deep(.el-pagination__total),
    .custom-pagination :deep(.el-pagination__jump) {
        color: #64748b;
        font-weight: 500;
    }

    .custom-pagination :deep(.btn-prev),
    .custom-pagination :deep(.btn-next),
    .custom-pagination :deep(.el-pager li) {
        background-color: white !important;
        border: 1px solid #f1f5f9 !important;
        border-radius: 6px !important;
    }

    .custom-pagination :deep(.el-pager li.is-active) {
        background-color: #3b82f6 !important;
        border-color: #3b82f6 !important;
        color: white !important;
    }
</style>
