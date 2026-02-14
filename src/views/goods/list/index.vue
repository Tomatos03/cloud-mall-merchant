<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <!-- 筛选区域 -->
        <GoodsFilter
            v-model="auditStatus"
            @change="handleFilterChange"
            @reset="handleFilterReset"
            @add="onAdd"
        />

        <!-- 表格区域 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false">
                <template #mainImg="{ row }">
                    <div class="flex items-center justify-center">
                        <el-image
                            v-if="row.displayImageUrls && row.displayImageUrls.length > 0"
                            :src="row.displayImageUrls[0]"
                            :preview-src-list="row.displayImageUrls"
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

                <template #goodsName="{ row }">
                    <span class="font-medium text-gray-700">{{ row.goodsName }}</span>
                </template>

                <template #price="{ row }">
                    <span class="text-red-500 font-semibold">{{
                        formatPrice(row.minPrice, row.maxPrice)
                    }}</span>
                </template>

                <template #unitName="{ row }">
                    <span v-if="row.unitName" class="text-gray-500 text-sm">{{
                        row.unitName
                    }}</span>
                    <span v-else class="text-gray-300">-</span>
                </template>

                <template #category="{ row }">
                    <span v-if="row.categoryIdPath" class="text-gray-500 text-sm">{{
                        categoryStore.getFirstLevelCategoryName(row.categoryIdPath)
                    }}</span>
                    <span v-else class="text-gray-300">-</span>
                </template>

                <template #status="{ row }">
                    <el-switch
                        :model-value="statusOf(row)"
                        :loading="row.__publishing"
                        @change="onTogglePublished(row, $event)"
                        style="--el-switch-on-color: #3b82f6"
                    />
                </template>

                <template #sellPoint="{ row }">
                    <el-tooltip v-if="row.sellPoint" :content="row.sellPoint" placement="top">
                        <div class="text-gray-400 text-xs truncate">{{ row.sellPoint }}</div>
                    </el-tooltip>
                    <span v-else class="text-gray-300">-</span>
                </template>

                <template #auditStatus="{ row }">
                    <el-tag
                        v-if="
                            row.auditStatus !== null &&
                            row.auditStatus !== undefined &&
                            AuditStatusMap[row.auditStatus as AuditStatus]
                        "
                        :type="AuditStatusMap[row.auditStatus as AuditStatus].type"
                        effect="dark"
                    >
                        {{ AuditStatusMap[row.auditStatus as AuditStatus].label }}
                    </el-tag>
                    <el-tag v-else type="info" effect="dark"> - </el-tag>
                </template>

                <template #action="{ row }">
                    <el-button link type="primary" size="small" @click="onView(row)">
                        查看
                    </el-button>
                    <el-button link type="primary" size="small" @click="onEdit(row)">
                        编辑
                    </el-button>
                    <el-button link type="danger" size="small" @click="onDelete(row)">
                        删除
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

        <!-- 商品详情对话框 -->
        <GoodsDetailDialog v-if="currentGoods" v-model="detailVisible" :data="currentGoods" />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { Picture } from '@element-plus/icons-vue'
    import Table from '@/components/table/Table.vue'
    import GoodsDetailDialog from './modules/GoodsDetailDialog.vue'
    import GoodsFilter from './modules/GoodsFilter.vue'
    import { useCategoryStore } from '@/stores/category'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import type { GoodsDetail, GoodsListItem } from '@/api/goods'
    import { PublishStep, useGoodsPublishStore } from '@/stores/goodsPublish'
    import {
        getGoodsSpecsAndSkus,
        updateGoodsStatus,
        fetchGoodsPage,
        deleteGoods,
    } from '@/api/goods'
    import { formatPrice } from '@/utils/money'
    import { AuditStatusMap, AuditStatus } from '@/api/audit'

    const categoryStore = useCategoryStore()
    const router = useRouter()

    const columns = [
        { id: '1', label: '商品图片', key: 'mainImg', width: 100 },
        { id: '2', label: '商品名称', key: 'goodsName', minWidth: 150 },
        { id: '3', label: '价格', key: 'price', width: 150 },
        { id: '4', label: '单位', key: 'unitName', width: 80 },
        { id: '5', label: '所属分类', key: 'category', width: 150 },
        { id: '6', label: '审核状态', key: 'auditStatus', width: 120 },
        { id: '7', label: '是否上架', key: 'status', width: 100 },
        { id: '8', label: '商品卖点', key: 'sellPoint', minWidth: 180 },
    ]

    const data = ref<GoodsListItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const detailVisible = ref(false)
    const currentGoods = ref<GoodsDetail>()
    const publishStore = useGoodsPublishStore()
    const auditStatus = ref<AuditStatus>()

    const loadData = async () => {
        loading.value = true
        try {
            const res = await fetchGoodsPage({
                page: page.value,
                pageSize: pageSize.value,
                auditStatus: auditStatus.value,
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

    const handleFilterChange = () => {
        page.value = 1
        loadData()
    }

    const handleFilterReset = () => {
        auditStatus.value = undefined
        page.value = 1
        loadData()
    }

    const onView = async (row: GoodsListItem) => {
        // 1. 立即复用列表项的基本数据
        const categoryPathStr =
            row.categoryIdPath && row.categoryIdPath.length > 0
                ? categoryStore.getCategoryPathStringByIdPath(row.categoryIdPath)
                : '-'

        currentGoods.value = row as GoodsDetail

        detailVisible.value = true
        const res = await getGoodsSpecsAndSkus(row.goodsId)
        currentGoods.value = {
            ...currentGoods.value,
            ...res.data,
            categoryPath: categoryPathStr,
        }
    }

    const onAdd = () => {
        router.push('/goods/publish')
    }

    const onEdit = async (row: GoodsListItem) => {
        // 异步加载商品详细信息
        const goodsExtraInfo = await getGoodsSpecsAndSkus(row.goodsId)

        // 将数据加载到 store（内部已处理 loading 状态）
        publishStore.loadGoodsForEdit(row, goodsExtraInfo.data)
        publishStore.setActiveStep(PublishStep.WRITE_INFO)
        // 跳转到发布页面
        router.push('/goods/publish')
    }

    const onDelete = (row: GoodsListItem) => {
        ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
            type: 'warning',
            confirmButtonClass: 'el-button--danger',
        }).then(async () => {
            await deleteGoods(row.goodsId)
            ElMessage.success('删除成功')
            loadData()
        })
    }

    const statusOf = (row: GoodsListItem) => {
        return !!row.status
    }

    const onTogglePublished = async (row: GoodsListItem, newStatus: boolean) => {
        try {
            ;(row as any).__publishing = true
            await updateGoodsStatus(row.goodsId, newStatus)
            row.status = newStatus
            ElMessage.success(newStatus ? '已上架' : '已下架')
        } catch {
            row.status = !newStatus
        } finally {
            ;(row as any).__publishing = false
        }
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
