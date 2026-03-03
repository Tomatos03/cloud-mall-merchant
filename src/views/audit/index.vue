<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <!-- 搜索筛选区域 -->
        <AuditFilter @change="handleFilterChange" @reset="handleReset" />

        <!-- 表格区域 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false">
                <!-- 审核申请ID -->
                <template #auditId="{ row }">
                    <span class="text-gray-600 text-sm font-mono">{{ row.auditId || '-' }}</span>
                </template>

                <!-- 申请人 -->
                <template #applicantName="{ row }">
                    <span class="text-gray-600 text-sm">{{ row.applicantName || '-' }}</span>
                </template>

                <!-- 业务类型 -->
                <template #targetType="{ row }">
                    <el-tag
                        :type="getTargetTypeInfo(row.targetType).type"
                        size="small"
                        effect="light"
                        class="px-3 rounded-full border-none"
                    >
                        {{ getTargetTypeInfo(row.targetType).label }}
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
                <template #action="{ index }">
                    <el-button link type="primary" size="small" @click="onView(index)">
                        查看详情
                    </el-button>
                    <el-divider v-if="canWithdraw(data[index].status)" direction="vertical" />
                    <el-button
                        v-if="canWithdraw(data[index].status)"
                        link
                        type="danger"
                        size="small"
                        @click="onWithdraw(index)"
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
            v-if="currentAuditData"
            v-model="detailVisible"
            :data="currentAuditData"
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
        AuditTargetTypeMap,
        AuditTargetType,
        type AuditLogVO,
        type AuditListRow,
    } from './types'
    import { useCategoryStore } from '@/stores/category'
    import type { AuditCommonData } from './types'
    import { fetchAuditPage, withdrawAudit } from '@/api/audit'
    import { ElMessage, ElMessageBox } from 'element-plus'

    // 初始化 store
    const categoryStore = useCategoryStore()

    // 通用表格列
    const columns = [
        { id: '1', label: '审核ID', key: 'auditId', minWidth: 90 },
        { id: '2', label: '申请人', key: 'applicantName', minWidth: 110 },
        { id: '3', label: '业务类型', key: 'targetType', minWidth: 90 },
        { id: '4', label: '提交时间', key: 'createTime', minWidth: 150 },
        { id: '5', label: '审核状态', key: 'status', minWidth: 110 },
    ]

    const data = ref<AuditListRow[]>([])
    const detailDataList = ref<AuditCommonData[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)

    const detailVisible = ref(false)
    const currentAuditData = ref<AuditCommonData>()

    // 当前筛选参数
    const currentFilterParams = ref<FilterParams>({})

    const loadData = async () => {
        loading.value = true

        const res = await fetchAuditPage({
            page: page.value,
            pageSize: pageSize.value,
            ...currentFilterParams.value,
        })

        const allRecords = (res.data.records || []) as AuditLogVO[]

        // 将审核日志转换为通用审核数据
        const records = allRecords.map((item: AuditLogVO): AuditCommonData => {
            return {
                auditId: item.auditId,
                targetType: item.targetType,
                targetId: item.targetId,
                status: item.status,
                statusName: item.statusName,
                reason: item.reason,
                applicantId: item.applicantId,
                applicantName: item.applicantName,
                auditorId: item.auditorId,
                auditorName: item.auditorName,
                snapshot: item.snapshot,
                createTime: item.createTime,
                auditTime: item.auditTime,
            }
        })

        detailDataList.value = records
        data.value = records.map(
            (item): AuditListRow => ({
                auditId: item.auditId,
                applicantName: item.applicantName,
                targetType: item.targetType,
                createTime: item.createTime,
                status: item.status,
            }),
        )
        total.value = res.data.total
        loading.value = false
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

    const onView = (index: number) => {
        const detail = detailDataList.value?.[index]
        if (!detail) return

        currentAuditData.value = detail
        detailVisible.value = true
    }

    const getAuditStatusInfo = (status: AuditStatus) => {
        return AuditStatusMap[status] || { label: '未知', type: 'info' as const }
    }

    const getTargetTypeInfo = (targetType: AuditTargetType) => {
        return AuditTargetTypeMap[targetType] || { label: '未知', type: 'info' as const }
    }

    const canWithdraw = (status: AuditStatus): boolean => {
        if (!status) {
          throw new Error('审核状态不能为空');
        }
        return status === AuditStatus.PENDING
    }

    const onWithdraw = async (index: number) => {
        const detail = data.value?.[index]
        if (!detail) return

        await ElMessageBox.confirm('确认要撤销该申请吗？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        })

        await withdrawAudit(detail.auditId)
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
