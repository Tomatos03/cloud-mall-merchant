<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <!-- 顶部操作区域 -->
        <div class="flex justify-between items-center mb-4">
            <!-- 只有商家用户才能添加商品 -->
            <el-button v-if="userStore.isMerchant" type="primary" class="add-btn" @click="onAdd">
                <el-icon class="mr-1"><Plus /></el-icon>
                添加商品
            </el-button>
        </div>

        <!-- 表格区域 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false">
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

                <template #goodsName="{ row }">
                    <span class="font-medium text-gray-700">{{ row.goodsName }}</span>
                </template>

                <template #price="{ row }">
                    <span class="text-red-500 font-semibold">{{
                        formatPrice(row.minPriceStr, row.maxPriceStr)
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

                <template #action="{ row }">
                    <!-- 管理员仅可以查看 -->
                    <template v-if="userStore.isAdmin">
                        <el-button link type="primary" size="small" @click="onView(row)">
                            查看
                        </el-button>
                    </template>

                    <!-- 商家可以查看、编辑和删除 -->
                    <template v-if="userStore.isMerchant">
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
    import { Plus, Picture } from '@element-plus/icons-vue'
    import Table from '@/components/table/Table.vue'
    import GoodsDetailDialog from './model/GoodsDetailDialog.vue'
    import { getApi, getMerchantApi } from '@/api/client'
    import { useCategoryStore } from '@/stores/category'
    import { useUserStore } from '@/stores/user'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import type { GoodsDetail, GoodsListItem } from '@/api/common'
    import { formatPrice } from '@/utils/price'

    const userStore = useUserStore()
    const categoryStore = useCategoryStore()
    const router = useRouter()

    const columns = [
        { id: '1', label: '商品图片', key: 'mainImg', width: 100 },
        { id: '2', label: '商品名称', key: 'goodsName', minWidth: 200 },
        { id: '3', label: '价格', key: 'price', width: 150 },
        { id: '4', label: '单位', key: 'unitName', width: 80 },
        { id: '5', label: '所属分类', key: 'category', width: 150 },
        { id: '6', label: '是否上架', key: 'status', width: 100 },
        { id: '7', label: '商品卖点', key: 'sellPoint', minWidth: 250 },
    ]

    const data = ref<GoodsListItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const detailVisible = ref(false)
    const currentGoods = ref<GoodsDetail>()

    const loadData = async () => {
        loading.value = true
        try {
            const res = await getApi().fetchGoodsPage({
                page: page.value,
                pageSize: pageSize.value,
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

    const onView = async (row: GoodsListItem) => {
        // 1. 立即复用列表项的基本数据
        const categoryPathStr =
            row.categoryIdPath && row.categoryIdPath.length > 0
                ? categoryStore.getCategoryPathStringByIdPath(row.categoryIdPath)
                : '-'

        currentGoods.value = row as GoodsDetail

        detailVisible.value = true
        const res = await getMerchantApi().getGoodsSpecsAndSkus(row.goodsId)
        currentGoods.value = {
            ...currentGoods.value,
            ...res.data,
            categoryPath: categoryPathStr,
        }
    }

    const onAdd = () => {
        router.push('/goods/publish')
    }

    const onEdit = (row: GoodsListItem) => {
        router.push({ path: '/goods/publish', query: { id: row.goodsId } })
    }

    const onDelete = (row: GoodsListItem) => {
        ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
            type: 'warning',
            confirmButtonClass: 'el-button--danger',
        }).then(async () => {
            await getMerchantApi().deleteGoods(row.goodsId)
            ElMessage.success('删除成功')
            loadData()
        })
    }

    const statusOf = (row: GoodsListItem) => {
        return !!row.status
    }

    const onTogglePublished = async (
        row: GoodsListItem & { __publishing?: boolean },
        val: boolean,
    ) => {
        row.__publishing = true
        try {
            await getMerchantApi().updateGoodsStatus(row.goodsId, val)
            row.status = val
            ElMessage.success(val ? '已上架' : '已下架')
        } finally {
            row.__publishing = false
        }
    }

    onMounted(async () => {
        await categoryStore.loadCategoryList()
        loadData()
    })
</script>

<style scoped>
    .add-btn {
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 600;
        box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.3);
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
        transition: all 0.2s;
    }

    .custom-pagination :deep(.el-pager li.is-active) {
        background-color: #3b82f6 !important;
        border-color: #3b82f6 !important;
        color: white !important;
        box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.2);
    }
</style>
