<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <!-- 搜索筛选区域 -->
        <AuditFilter @change="handleFilterChange" @reset="handleReset" />

        <!-- 表格区域 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false" :loading="loading">
                <!-- 审核申请ID -->
                <template #auditNo="{ row }">
                    <span class="text-gray-600 text-sm font-mono">{{ row.auditNo || '-' }}</span>
                </template>

                <!-- 申请人 -->
                <template #applicantName="{ row }">
                    <span class="text-gray-600 text-sm">{{ row.applicantName || '-' }}</span>
                </template>

                <!-- 业务类型 -->
                <template #bizType="{ row }">
                    <el-tag
                        :type="getBizTypeInfo(row.bizType).type"
                        size="small"
                        effect="light"
                        class="px-3 rounded-full border-none"
                    >
                        {{ getBizTypeInfo(row.bizType).label }}
                    </el-tag>
                </template>

                <!-- 提交时间 -->
                <template #createTime="{ row }">
                    <span class="text-gray-400 text-xs">{{ row.createTime || '-' }}</span>
                </template>

                <!-- 审核状态 -->
                <template #status="{ row }">
                    <el-tag
                        :type="getAuditStatusInfo(row.status).type"
                        size="small"
                        effect="light"
                        class="px-3 rounded-full border-none"
                    >
                        {{ getAuditStatusInfo(row.status).label }}
                    </el-tag>
                </template>

                <!-- 操作 -->
                <template #action="{ row }">
                    <el-button
                        link
                        type="primary"
                        size="small"
                        :loading="detailLoading && viewingAuditNo === row.auditNo"
                        @click="onView(row)"
                    >
                        查看详情
                    </el-button>
                    <el-divider v-if="canWithdraw(row.status)" direction="vertical" />
                    <el-button
                        v-if="canWithdraw(row.status)"
                        link
                        type="danger"
                        size="small"
                        @click="onWithdraw(row)"
                    >
                        撤销申请
                    </el-button>
                </template>
            </Table>
        </div>

        <!-- 分页区域 -->
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

        <!-- 审核详情对话框 -->
        <AuditDetailDialog
            v-if="currentAuditInfo"
            v-model="detailVisible"
            :audit-info="currentAuditInfo"
            :audit-data="currentAuditData"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import Table from '@/components/table/Table.vue'
    import AuditDetailDialog from './modules/AuditDetailDialog.vue'
    import AuditFilter, { type FilterParams } from './modules/AuditFilter.vue'
    import {
        AuditStatus,
        AuditStatusMap,
        AuditBizTypeMap,
        AuditBizType,
        type AuditRow,
        type AuditData,
    } from './types'
    import { useCategoryStore } from '@/stores/category'
    import type { AuditDetail, AuditInfo } from './types'
    import { getAuditDetail, pagetAudit, withdrawAudit } from '@/api/audit'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { getAuditRenderer } from './renderers'

    // 初始化 store
    const categoryStore = useCategoryStore()

    // 通用表格列
    const columns = [
        { id: '1', label: '审核编号', key: 'auditNo', minWidth: 120 },
        { id: '2', label: '申请人', key: 'applicantName', minWidth: 110 },
        { id: '3', label: '业务类型', key: 'bizType', minWidth: 90 },
        { id: '4', label: '提交时间', key: 'createTime', minWidth: 150 },
        { id: '5', label: '审核状态', key: 'status', minWidth: 110 },
    ]

    const data = ref<AuditInfo[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const detailLoading = ref(false)
    const viewingAuditNo = ref('')

    const detailVisible = ref(false)
    const currentAuditInfo = ref<AuditInfo | null>(null)
    const currentAuditData = ref<AuditData[]>([])

    // 当前筛选参数
    const currentFilterParams = ref<FilterParams>({})

    const toAuditInfo = (item: AuditRow): AuditInfo => {
        return {
            auditNo: item.auditNo,
            bizType: item.bizType,
            status: item.status,
            applicantId: item.applicantId,
            applicantName: item.applicantName,
            auditorId: item.auditorId,
            auditorName: item.auditorName,
            createTime: item.createTime,
            auditTime: item.auditTime,
        }
    }

    /**
     * 将审核子项转换为审核数据
     * @param auditItems 审核子项数组
     * @param bizType 业务类型
     * @returns 转换后的审核数据数组
     */
    const convertAuditItemsToData = (
        auditItems: AuditDetail,
        bizType: AuditBizType,
    ): AuditData[] => {
        console.debug('Using renderer for bizType:', bizType)
        const renderer = getAuditRenderer(bizType)
        if (!renderer) {
            return []
        }

        return auditItems.map((item) => ({
            status: item.status,
            reason: item.reason,
            data: renderer.parseSnapshot(item.snapshot) ?? null,
        }))
    }

    const loadData = async () => {
        loading.value = true
        try {
            const res = await pagetAudit({
                page: page.value,
                pageSize: pageSize.value,
                ...currentFilterParams.value,
            })

            const allRecords = res.data.records ?? []
            const records = allRecords.map(toAuditInfo)
            data.value = records

            total.value = res.data.total
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

    const handleFilterChange = (filterParams: FilterParams) => {
        currentFilterParams.value = filterParams
        page.value = 1
        loadData()
    }

    const handleReset = () => {
        currentFilterParams.value = {}
        page.value = 1
        loadData()
    }

    const onView = async (row: AuditInfo) => {
        detailLoading.value = true
        viewingAuditNo.value = row.auditNo
        currentAuditInfo.value = row
        detailVisible.value = true
        currentAuditData.value = []
        try {
            const res = await getAuditDetail(row.auditNo)
            const auditDetail = res.data ?? []
            currentAuditData.value = convertAuditItemsToData(auditDetail, row.bizType)
        } finally {
            detailLoading.value = false
            viewingAuditNo.value = ''
        }
    }

    const getAuditStatusInfo = (status: AuditStatus) => {
        return AuditStatusMap[status] || { label: '未知', type: 'info' as const }
    }

    const getBizTypeInfo = (bizType: AuditBizType) => {
        return AuditBizTypeMap[bizType] || { label: '未知', type: 'info' as const }
    }

    const canWithdraw = (status: AuditStatus): boolean => status === AuditStatus.PENDING

    const onWithdraw = async (row: AuditInfo) => {
        if (!row?.auditNo) return

        await ElMessageBox.confirm('确认要撤销该申请吗？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        })

        await withdrawAudit(row.auditNo)
        ElMessage.success('撤销申请成功')
        await loadData()
    }

    onMounted(async () => {
        Promise.all([categoryStore.loadCategoryList(), loadData()])
    })
</script>

<style scoped>
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
        transition: all 0.2s;
    }

    .custom-pagination :deep(.el-pager li.is-active) {
        background-color: #3b82f6 !important;
        border-color: #3b82f6 !important;
        color: white !important;
        box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.2);
    }
</style>
