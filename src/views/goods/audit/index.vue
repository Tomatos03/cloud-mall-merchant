<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <!-- 搜索筛选区域 -->
        <AuditFilter v-model="filterStatus" @change="handleFilterChange" @reset="handleReset" />

        <!-- 表格区域 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false">
                <!-- 商品图片 -->
                <template #mainImg="{ row }">
                    <div class="flex items-center justify-center">
                        <el-image
                            v-if="row.mainImg"
                            :src="row.mainImg"
                            :preview-src-list="[row.mainImg]"
                            preview-teleported
                            class="w-12 h-12 rounded-lg shadow-sm border border-gray-50"
                            fit="cover"
                        >
                            <template #error>
                                <div
                                    class="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300"
                                >
                                    <el-icon><Picture /></el-icon>
                                </div>
                            </template>
                        </el-image>
                        <span v-else class="text-gray-400 text-xs italic">无图片</span>
                    </div>
                </template>

                <!-- 商品名称 -->
                <template #goodsName="{ row }">
                    <span
                        class="font-medium text-gray-700 truncate max-w-50 block"
                        :title="row.goodsName"
                    >
                        {{ row.goodsName }}
                    </span>
                </template>

                <!-- 申请人 (店铺) -->
                <template #storeName="{ row }">
                    <div class="flex items-center gap-1">
                        <span class="text-gray-600 text-sm">{{ row.storeName || '-' }}</span>
                    </div>
                </template>

                <!-- 提交时间 -->
                <template #createTime="{ row }">
                    <span class="text-gray-400 text-xs">{{ row.createTime || '-' }}</span>
                </template>

                <!-- 审核状态 -->
                <template #auditStatus="{ row }">
                    <el-tag
                        :type="getAuditStatusInfo(row.auditStatus).type"
                        size="small"
                        effect="light"
                        class="px-3 rounded-full border-none"
                    >
                        {{ getAuditStatusInfo(row.auditStatus).label }}
                    </el-tag>
                </template>

                <!-- 操作 -->
                <template #action="{ row, index }">
                    <div class="flex items-center gap-2">
                        <el-button link type="primary" size="small" @click="onView(index)">
                            {{ isAdmin && row.auditStatus === 0 ? '审核' : '详情' }}
                        </el-button>
                        <el-button
                            v-if="!isAdmin && row.auditStatus === 0"
                            link
                            type="danger"
                            size="small"
                            @click="onWithdraw(row)"
                        >
                            撤销
                        </el-button>
                    </div>
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

        <!-- 商品审核详情对话框 -->
        <AuditDetailDialog
            v-if="currentGoods"
            v-model="detailVisible"
            :data="currentGoods"
            :is-admin="isAdmin"
            @success="loadData"
            @reject="handleRejectFromDetail"
        />

        <!-- 拒绝审核对话框 -->
        <AuditRejectDialog
            ref="auditRejectDialogRef"
            v-model="auditRejectDialogVisible"
            @success="handleRejectSuccess"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import { Picture } from '@element-plus/icons-vue'
    import { ElMessageBox, ElMessage } from 'element-plus'
    import Table from '@/components/table/Table.vue'
    import AuditDetailDialog from './model/AuditDetailDialog.vue'
    import AuditFilter from './model/AuditFilter.vue'
    import AuditRejectDialog, { type AuditRejectDialogExposed } from './model/AuditRejectDialog.vue'
    import { getApi, getMerchantApi } from '@/api/client'
    import { useCategoryStore } from '@/stores/category'
    import { useUserStore } from '@/stores/user'
    import { AuditStatusMap, isValidAuditStatus } from '@/api/common'
    import type { AuditStatus, AuditLogVO, AuditGoodsListItem } from '@/api/common'
    import type { GoodsAuditInfo } from './model/AuditMerchantView.vue'

    // 初始化 store
    const categoryStore = useCategoryStore()
    const userStore = useUserStore()
    const isAdmin = computed(() => userStore.isAdmin)

    // 定义筛选状态类型
    type FilterStatus = AuditStatus | undefined

    const filterStatus = ref<FilterStatus>(0) // 默认查看待审核
    const columns = computed(() => {
        const cols = [
            { id: '1', label: '商品图片', key: 'mainImg', width: 100 },
            { id: '2', label: '商品名称', key: 'goodsName', minWidth: 200 },
            { id: '3', label: '提交时间', key: 'createTime', width: 180 },
            { id: '4', label: '状态', key: 'auditStatus', width: 120 },
        ]
        // 只有管理员才显示申请店铺列
        if (isAdmin.value) {
            cols.splice(2, 0, { id: '3', label: '申请店铺', key: 'storeName', width: 150 })
        }
        return cols
    })

    const data = ref<AuditGoodsListItem[]>([])
    const detailDataList = ref<GoodsAuditInfo[]>()
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)

    const detailVisible = ref(false)
    const currentGoods = ref<GoodsAuditInfo>()

    const auditRejectDialogVisible = ref(false)
    const auditRejectDialogRef = ref<AuditRejectDialogExposed | null>(null)

    const loadData = async () => {
        loading.value = true

        try {
            // 根据角色使用对应的 API 客户端进行分页查询
            const res = await getApi().fetchAuditPage({
                page: page.value,
                pageSize: pageSize.value,
                status: filterStatus.value,
                targetType: 'GOODS',
            })

            // 解析 extraInfo 中的商品数据
            const records = (res.data.records || []).map((item: AuditLogVO): GoodsAuditInfo => {
                try {
                    let goodsInfo = JSON.parse(item.extraInfo)

                    return {
                        ...goodsInfo,
                        auditId: item.auditId,
                        reason: item.reason,
                        applicantName: item.applicantName,
                        auditorName: item.auditorName,
                        createTime: item.createTime,
                        auditTime: item.auditTime,
                        auditStatus: item.status as AuditStatus,
                    }
                } catch {
                    throw new Error('解析商品审核数据失败')
                }
            })

            detailDataList.value = records
            data.value = records.map(
                (item: GoodsAuditInfo): AuditGoodsListItem => ({
                    auditId: item.auditId,
                    goodsName: item.goodsName,
                    mainImg: item.mainImg,
                    createTime: item.createTime,
                    auditStatus: item.auditStatus,
                    storeName: item.applicantName,
                    sellPoint: item.sellPoint,
                }),
            )
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

    const handleFilterChange = () => {
        page.value = 1
        loadData()
    }

    const handleReset = () => {
        filterStatus.value = undefined
        page.value = 1
        loadData()
    }

    const onView = (index: number) => {
        if (!detailDataList.value) {
            throw new Error('detailDataList is undefined')
        }

        const data = detailDataList.value[index]
        if (!data) {
            throw new Error('data is undefined')
        }

        const categoryPathStr = categoryStore.getCategoryPathString(data.categoryId)
        currentGoods.value = {
            ...data,
            categoryPath: categoryPathStr,
        }
        detailVisible.value = true
    }

    /**
     * 商家撤回审核申请
     */
    const onWithdraw = async (row: AuditGoodsListItem) => {
        try {
            await ElMessageBox.confirm('确定要撤销该审核申请吗？', '操作确认', {
                confirmButtonText: '确定撤销',
                cancelButtonText: '取消',
                type: 'warning',
            })

            loading.value = true
            await getMerchantApi().withdrawAudit(row.auditId)
            ElMessage.success('已成功撤销申请')
            loadData()
        } finally {
            loading.value = false
        }
    }

    /**
     * 从详情页触发拒绝
     */
    const handleRejectFromDetail = (row: AuditGoodsListItem) => {
        if (!isAdmin.value) return
        handleReject(row)
    }

    /**
     * 拒绝操作 - 打开对话框
     */
    const handleReject = (row: AuditGoodsListItem) => {
        if (!isAdmin.value) return
        if (!auditRejectDialogRef.value) {
            throw new Error('auditRejectDialogRef is not initialized')
        }

        if (!row.storeName || !row.sellPoint) {
            throw new Error('storeName or sellPoint is missing')
        }
        auditRejectDialogRef.value.setData(
            row.auditId,
            row.goodsName,
            row.mainImg,
            row.storeName,
            row.sellPoint,
        )
    }

    const handleRejectSuccess = () => {
        loadData()
    }

    const getAuditStatusInfo = (status: number) => {
        if (!isValidAuditStatus(status)) {
            throw new Error(`无效的审核状态值: ${status}`)
        }
        return AuditStatusMap[status]
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
