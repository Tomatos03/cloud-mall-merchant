<template>
    <el-dialog
        v-model="visibleLocal"
        title="选择商品"
        width="850px"
        @close="handleClose"
        class="custom-dialog"
    >
        <!-- 搜索区域 -->
        <div class="flex items-center gap-3 mb-6 p-4 bg-[#f8fafc] rounded-xl border border-gray-100">
            <el-input
                v-model="searchText"
                placeholder="输入商品名称搜索..."
                clearable
                class="custom-search-input"
                @keyup.enter="handleSearch"
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>
            <el-button type="primary" class="search-btn" @click="handleSearch">
                搜索
            </el-button>
            <div class="ml-auto flex items-center gap-2 text-xs text-[#94a3b8] font-medium">
                <el-icon><InfoFilled /></el-icon>
                仅显示已上架商品
            </div>
        </div>

        <!-- 表格区域 -->
        <div class="border border-gray-100 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <el-table
                :data="list"
                @row-click="onRowClick"
                highlight-current-row
                header-cell-class-name="custom-header-cell"
                cell-class-name="custom-cell"
                style="width: 100%"
                height="450px"
            >
                <el-table-column width="60" align="center">
                    <template #default="{ row }">
                        <el-radio
                            :model-value="selectedId"
                            :label="row.id"
                            class="custom-radio"
                            @change="() => selectRow(row)"
                        >
                            <span></span>
                        </el-radio>
                    </template>
                </el-table-column>

                <el-table-column label="商品图片" width="100" align="center">
                    <template #default="{ row }">
                        <el-image
                            :src="row.mainImg || row.imgList"
                            class="w-12 h-12 rounded-lg shadow-sm border border-gray-50"
                            fit="cover"
                        >
                            <template #error>
                                <div class="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                    <el-icon><Picture /></el-icon>
                                </div>
                            </template>
                        </el-image>
                    </template>
                </el-table-column>

                <el-table-column prop="name" label="商品名称">
                    <template #default="{ row }">
                        <span class="font-medium text-gray-700">{{ row.name }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 分页与操作 -->
        <div class="mt-6 flex items-center justify-between">
            <el-pagination
                v-model:current-page="page"
                :page-size="pageSize"
                :total="total"
                layout="prev, pager, next"
                class="custom-pagination"
                @current-change="handlePageChange"
            />

            <div class="flex gap-3">
                <el-button class="cancel-btn" @click="handleClose">取消</el-button>
                <el-button
                    type="primary"
                    class="confirm-btn"
                    :disabled="!selectedRow"
                    @click="handleConfirm"
                >
                    确认选择
                </el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue'
    import { ElMessage } from 'element-plus'
    import { Search, InfoFilled, Picture } from '@element-plus/icons-vue'
    import type { GoodsItem } from '@/api/common/goods'
    import { getAdminApi } from '@/api/client'

    const props = defineProps<{
        visible: boolean
        initialSelectedId?: string | null
        pageSize?: number
    }>()

    const emit = defineEmits<{
        (e: 'update:visible', val: boolean): void
        (e: 'confirm', payload: { goodsId: string; goodsName: string }): void
    }>()

    const visibleLocal = ref(!!props.visible)
    watch(
        () => props.visible,
        (v) => {
            visibleLocal.value = !!v
        },
    )
    watch(visibleLocal, (v) => emit('update:visible', v))

    const page = ref(1)
    const pageSize = ref(props.pageSize ?? 10)
    const total = ref(0)
    const list = ref<GoodsItem[]>([])
    const searchText = ref('')
    const selectedId = ref<string | null>(props.initialSelectedId ?? null)
    const selectedRow = ref<GoodsItem | null>(null)

    watch(
        () => props.initialSelectedId,
        (v) => {
            selectedId.value = v ?? null
        },
    )

    const loadData = async () => {
        try {
            const api = getAdminApi()
            const res = await api.fetchGoodsPage({
                page: page.value,
                pageSize: pageSize.value,
                name: searchText.value,
                status: true,
            })
            // 过滤出上架商品
            list.value = (res.data.records || []).filter((r: GoodsItem) => r.status === true)
            total.value = res.data.total

            if (selectedId.value) {
                const found = list.value.find((r) => r.id === selectedId.value)
                if (found) selectedRow.value = found
            }
        } catch {
            ElMessage.error('加载商品失败')
        }
    }

    const handleSearch = () => {
        page.value = 1
        loadData()
    }

    const handlePageChange = (p: number) => {
        page.value = p
        loadData()
    }

    const onRowClick = (row: GoodsItem) => {
        selectRow(row)
    }

    const selectRow = (row: GoodsItem) => {
        selectedRow.value = row
        selectedId.value = row.id
    }

    const handleConfirm = () => {
        if (!selectedRow.value) {
            ElMessage.warning('请选择一个商品')
            return
        }
        emit('confirm', {
            goodsId: String(selectedRow.value.id),
            goodsName: selectedRow.value.goodsName,
        })
        visibleLocal.value = false
    }

    const handleClose = () => {
        visibleLocal.value = false
    }

    watch(
        () => visibleLocal.value,
        (v) => {
            if (v) {
                page.value = 1
                searchText.value = ''
                loadData()
            } else {
                selectedRow.value = null
            }
        },
    )
</script>

<style scoped>
:deep(.custom-dialog) {
    border-radius: 16px;
    overflow: hidden;
}

:deep(.custom-dialog .el-dialog__header) {
    margin-right: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
}

:deep(.custom-dialog .el-dialog__title) {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
}

:deep(.custom-dialog .el-dialog__body) {
    padding: 24px;
}

/* 搜索框样式 */
.custom-search-input :deep(.el-input__wrapper) {
    background-color: #fff;
    box-shadow: none !important;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 4px 12px;
    transition: all 0.2s;
}

.custom-search-input :deep(.el-input__wrapper.is-focus) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6 !important;
}

.search-btn {
    border-radius: 10px;
    padding: 10px 20px;
    font-weight: 600;
}

/* 表格样式 */
:deep(.custom-header-cell) {
    background-color: #f8faff !important;
    color: #64748b !important;
    font-weight: 600 !important;
    padding: 12px 0 !important;
    border-bottom: 1px solid #e2e8f0 !important;
    font-size: 13px;
}

:deep(.custom-cell) {
    padding: 10px 0 !important;
    border-bottom: 1px solid #f1f5f9 !important;
    font-size: 14px;
}

:deep(.el-table__row.current-row > td) {
    background-color: #f0f7ff !important;
}

/* 单选框样式微调 */
.custom-radio :deep(.el-radio__label) {
    display: none;
}

/* 分页样式 */
.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next),
.custom-pagination :deep(.el-pager li) {
    background-color: white !important;
    border: 1px solid #f1f5f9 !important;
    border-radius: 6px !important;
    margin: 0 3px;
}

.custom-pagination :deep(.el-pager li.is-active) {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
}

/* 底部按钮 */
.cancel-btn {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    color: #64748b;
    padding: 10px 20px;
}

.confirm-btn {
    border-radius: 10px;
    padding: 10px 24px;
    font-weight: 600;
    box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.3);
}

.confirm-btn:disabled {
    box-shadow: none;
}
</style>
