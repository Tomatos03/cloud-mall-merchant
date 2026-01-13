<template>
    <div class="h-full flex flex-col p-5">
        <div class="mb-4 space-x-2">
            <el-button type="primary" :icon="Plus" @click="onAdd">添加轮播图</el-button>
            <el-button
                type="danger"
                :icon="Delete"
                @click="onBatchDelete"
                :disabled="selectList.length === 0"
                >批量删除</el-button
            >
        </div>

        <div class="flex-1 overflow-hidden">
            <Table
                :columns="columns"
                :data="data"
                height="100%"
                :showId="true"
                v-model:selectList="selectList"
            >
                <template #imageUrl="{ row }">
                    <el-image
                        :src="row.imageUrl"
                        :preview-src-list="[row.imageUrl]"
                        preview-teleported
                        fit="cover"
                        class="w-16 h-10 rounded shadow-sm border border-gray-100"
                    />
                </template>

                <template #isRecommend="{ row }">
                    <el-switch
                        :model-value="row.isRecommend"
                        :disabled="recommendLoading[String(row.id)]"
                        @change="(val: boolean) => toggleRecommend(row.id, val)"
                    />
                </template>

                <template #action="{ row }">
                    <el-button size="small" type="warning" @click="onEdit(row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
                </template>
            </Table>
        </div>

        <div class="mt-4 flex justify-end">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
        </div>

        <BannerFormDialog
            v-model:visible="showAddModal"
            :banner="selectedBanner"
            :loading="submitLoading"
            @confirm="handleSubmit"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import Table from '@/components/table/Table.vue'
    import type { BannerItem } from '@/api/admin/banner'
    import { Plus, Delete } from '@element-plus/icons-vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { getAdminApi } from '@/api/client'
    import BannerFormDialog from './model/BannerFormDialog.vue'

    const columns = [
        { id: '1', label: '轮播图预览', key: 'imageUrl' },
        { id: '2', label: '关联商品', key: 'goodsName' },
        { id: '3', label: '推荐展示', key: 'isRecommend' },
    ]

    const data = ref<BannerItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const selectList = ref<BannerItem[]>([])

    const loadData = async () => {
        const api = getAdminApi()
        const res = await api.fetchBannerPage({ page: page.value, pageSize: pageSize.value })
        data.value = res.data.records
        total.value = Number(res.data.total) || 0
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

    const showAddModal = ref(false)
    const selectedBanner = ref<Partial<BannerItem> | null>(null)
    const submitLoading = ref(false)

    const onAdd = () => {
        selectedBanner.value = null
        showAddModal.value = true
    }

    const handleSubmit = async (payload: Partial<BannerItem>) => {
        if (payload.goodsId === undefined || payload.goodsId === null) {
            ElMessage.error('请选择关联商品')
            return
        }

        submitLoading.value = true
        try {
            const api = getAdminApi()
            if (payload.id) {
                await api.updateBanner(String(payload.id), payload)
                ElMessage.success('更新成功')
            } else {
                await api.addBanner(payload)
                ElMessage.success('添加成功')
            }

            showAddModal.value = false
            selectedBanner.value = null
            loadData()
        } catch {
            ElMessage.error(payload.id ? '更新失败' : '添加失败')
        } finally {
            submitLoading.value = false
        }
    }

    const onBatchDelete = async () => {
        if (selectList.value.length === 0) {
            ElMessage.warning('请选择要删除的项')
            return
        }

        try {
            await ElMessageBox.confirm(
                `确定要删除选中的 ${selectList.value.length} 项吗？`,
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                },
            )

            const ids = selectList.value.map((item) => item.id)
            const api = getAdminApi()
            await api.batchDeleteBanner(ids)
            ElMessage.success('删除成功')
            selectList.value = []
            loadData()
        } catch (err: unknown) {
            if (err !== 'cancel') {
                ElMessage.error('删除失败')
            }
        }
    }

    const onEdit = (row: BannerItem) => {
        const isRecommendValue = (() => {
            const val = row.isRecommend
            if (val === undefined || val === null) return true
            if (typeof val === 'boolean') return val
            return Number(val) === 1
        })()

        selectedBanner.value = {
            ...JSON.parse(JSON.stringify(row)),
            isRecommend: isRecommendValue,
            goodsId: String(row.goodsId ?? ''),
            goodsName: String(row.goodsName ?? ''),
        }

        showAddModal.value = true
    }

    const onDelete = async (row: BannerItem) => {
        try {
            await ElMessageBox.confirm(
                `确定要删除关联商品 "${row.goodsName}" 的轮播图吗？`,
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                },
            )

            const api = getAdminApi()
            await api.batchDeleteBanner([row.id])
            ElMessage.success('删除成功')
            loadData()
        } catch (err: unknown) {
            if (err !== 'cancel') {
                ElMessage.error('删除失败')
            }
        }
    }

    const recommendLoading = ref<Record<string, boolean>>({})

    const toggleRecommend = async (id: string | number, isRecommend: boolean) => {
        const key = String(id)
        recommendLoading.value[key] = true

        const row = data.value.find((r) => String(r.id) === key)
        const prev: boolean = row ? row.isRecommend : false
        if (row) {
            row.isRecommend = isRecommend
        }

        try {
            const api = getAdminApi()
            await api.updateBannerRecommend(String(id), isRecommend)
            ElMessage.success('设置成功')
        } catch {
            if (row) {
                row.isRecommend = prev
            }
            ElMessage.error('设置失败')
        } finally {
            recommendLoading.value[key] = false
        }
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped></style>
