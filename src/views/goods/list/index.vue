```vue /home/Tomatos/Projects/ZedProjects/cloud-mall-vue/src/views/goods/index.vue
<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <!-- 顶部操作区域 -->
        <div class="flex justify-between items-center mb-4">
            <!-- 只有商家用户才能添加商品 -->
            <el-button
                v-if="userStore.isMerchant"
                type="primary"
                class="add-btn"
                @click="onAdd"
            >
                <el-icon class="mr-1"><Plus /></el-icon>
                添加商品
            </el-button>
        </div>

        <!-- 表格区域 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false">
                <template #img="{ row }">
                    <div class="flex items-center justify-center">
                        <el-image
                            v-if="row.img"
                            :src="getImageURL(row.img)"
                            :preview-src-list="[getImageURL(row.img)]"
                            preview-teleported
                            class="w-12 h-12 rounded-lg shadow-sm border border-gray-50"
                            fit="cover"
                        >
                            <template #error>
                                <div class="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                    <el-icon><Picture /></el-icon>
                                </div>
                            </template>
                        </el-image>
                        <span v-else class="text-gray-400 text-xs italic">无图片</span>
                    </div>
                </template>

                <template #name="{ row }">
                    <span class="font-medium text-gray-700">{{ row.name }}</span>
                </template>

                <template #price="{ row }">
                    <span class="text-rose-500 font-bold">￥{{ fenToYuan(row.price) }}</span>
                </template>

                <template #unit="{ row }">
                    <span v-if="row.unit" class="text-gray-500 text-sm">{{ row.unit }}</span>
                    <span v-else class="text-gray-300">-</span>
                </template>

                <template #inventory="{ row }">
                    <el-tag
                        :type="row.inventory > 10 ? 'success' : row.inventory > 0 ? 'warning' : 'danger'"
                        effect="light"
                        class="border-none px-3 rounded-full"
                    >
                        {{ row.inventory }}
                    </el-tag>
                </template>

                <template #status="{ row }">
                    <el-switch
                        :model-value="statusOf(row)"
                        :loading="row.__publishing"
                        @change="onTogglePublished(row, $event)"
                        style="--el-switch-on-color: #3b82f6;"
                    />
                </template>

                <template #info="{ row }">
                    <el-tooltip v-if="row.info" :content="row.info" placement="top">
                        <div class="text-gray-400 text-xs truncate max-w-37.5">{{ row.info }}</div>
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

                    <!-- 商家可以编辑和删除 -->
                    <template v-if="userStore.isMerchant">
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
        <GoodsDetailDialog
            v-model="detailVisible"
            :data="currentGoods"
            :category-list="categoryList"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { Plus, Picture } from '@element-plus/icons-vue'
    import Table from '@/components/table/Table.vue'
    import GoodsDetailDialog from './model/GoodsDetailDialog.vue'
    import { getApi, getMerchantApi } from '@/api/client'
    import { getCategoryTree } from '@/api/common/category'
    import { useUserStore } from '@/stores/user'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { fenToYuan } from '@/utils/price'
    import { getImageURL } from '@/utils/image'
    import type { GoodsItem } from '@/api/common'
    import type { CategoryItem } from '@/api/common/category'

    const userStore = useUserStore()
    const router = useRouter()

    const columns = [
        { id: '1', label: '商品图片', key: 'img', width: 100 },
        { id: '2', label: '商品名称', key: 'name', minWidth: 200 },
        { id: '3', label: '价格', key: 'price', width: 120 },
        { id: '4', label: '单位', key: 'unit', width: 80 },
        { id: '5', label: '库存', key: 'inventory', width: 100 },
        { id: '6', label: '状态', key: 'status', width: 100 },
        { id: '7', label: '简介', key: 'info', minWidth: 150 },
    ]

    const data = ref<GoodsItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const detailVisible = ref(false)
    const currentGoods = ref<GoodsItem | null>(null)
    const categoryList = ref<CategoryItem[]>([])

    const loadData = async () => {
        loading.value = true
        try {
            const res = await getApi().fetchGoodsPage({
                page: page.value,
                pageSize: pageSize.value
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

    const loadCategories = async () => {
        try {
            const res = await getCategoryTree()
            categoryList.value = res.data || []
        } catch (error) {
            console.error('加载分类失败', error)
        }
    }

    const onView = (row: GoodsItem) => {
        currentGoods.value = row
        detailVisible.value = true
    }

    const onAdd = () => {
        router.push('/goods/publish')
    }

    const onEdit = (row: GoodsItem) => {
        router.push({ path: '/goods/publish', query: { id: row.id } })
    }

    const onDelete = (row: GoodsItem) => {
        ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
        }).then(async () => {
            await getMerchantApi().deleteGoods(row.id)
            ElMessage.success('删除成功')
            loadData()
        })
    }



    const statusOf = (row: GoodsItem) => {
        return !!row.status
    }

    const onTogglePublished = async (row: GoodsItem & { __publishing?: boolean }, val: boolean) => {
        row.__publishing = true
        try {
            await getMerchantApi().updateGoods({ ...row, status: val })
            row.status = val
            ElMessage.success(val ? '已上架' : '已下架')
        } finally {
            row.__publishing = false
        }
    }

    onMounted(() => {
        loadData()
        loadCategories()
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
