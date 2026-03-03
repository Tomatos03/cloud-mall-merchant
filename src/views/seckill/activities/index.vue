<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <div
            class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4 flex items-center justify-between"
        >
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-3">
                    <span class="text-sm font-semibold text-[#64748b] uppercase tracking-wider"
                        >活动名称</span
                    >
                    <el-input
                        v-model="searchName"
                        placeholder="搜索活动名称"
                        clearable
                        @keyup.enter="handleSearch"
                        class="custom-input"
                        style="width: 200px"
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>
                </div>
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
                            v-for="(item, key) in ActivityStatusMap"
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
                <template #name="{ row }">
                    <div class="flex items-center gap-2">
                        <span class="font-medium text-gray-700">{{ row.name }}</span>
                    </div>
                </template>

                <template #activityTime="{ row }">
                    <div class="text-gray-600">
                        <div>{{ row.activityDate }}</div>
                        <div class="text-xs text-gray-400">
                            {{ row.startTime }} ~ {{ row.endTime }}
                        </div>
                    </div>
                </template>

                <template #status="{ row }">
                    <el-tag :type="ActivityStatusMap[row.status]?.type" effect="dark">
                        {{ ActivityStatusMap[row.status]?.label }}
                    </el-tag>
                </template>

                <template #items="{ row }">
                    <span class="text-gray-600">
                        {{ row.passedItems }}
                        <span v-if="row.maxItems"> / {{ row.maxItems }}</span>
                    </span>
                </template>

                <template #action="{ row }">
                    <el-button link type="primary" size="small" @click="onView(row)">
                        查看
                    </el-button>
                    <el-button
                        v-if="row.status === ActivityStatus.APPLYING"
                        link
                        type="primary"
                        size="small"
                        @click="onApply(row)"
                    >
                        申请加入
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
    import { Search, RefreshRight } from '@element-plus/icons-vue'
    import Table from '@/components/table/Table.vue'
    import {
        fetchActivityList,
        ActivityStatus,
        ActivityStatusMap,
        type SeckillActivityItem,
    } from '@/api/seckill'

    const router = useRouter()

    const columns = [
        { id: '1', label: '活动名称', key: 'name', minWidth: 150 },
        { id: '2', label: '活动时间', key: 'activityTime', minWidth: 180 },
        { id: '3', label: '状态', key: 'status', width: 100 },
        { id: '4', label: '商品数', key: 'items', width: 100 },
    ]

    const data = ref<SeckillActivityItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const searchName = ref('')
    const searchStatus = ref<number | undefined>()

    const loadData = async () => {
        loading.value = true
        try {
            const res = await fetchActivityList({
                page: page.value,
                pageSize: pageSize.value,
                name: searchName.value || undefined,
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
        searchName.value = ''
        searchStatus.value = undefined
        page.value = 1
        loadData()
    }

    const onView = (row: SeckillActivityItem) => {
        router.push(`/seckill/activities/${row.id}`)
    }

    const onApply = (row: SeckillActivityItem) => {
        router.push(`/seckill/apply/${row.id}`)
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped>
    .custom-input :deep(.el-input__wrapper) {
        background-color: #f8fafc;
        box-shadow: none !important;
        border: 1px solid #f1f5f9;
        border-radius: 8px;
    }

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
