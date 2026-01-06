<template>
    <div class="h-full flex flex-col p-5">
        <div class="mb-4 space-x-2">
            <el-button type="primary" :icon="Plus" @click="onAdd">添加单位</el-button>
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
                <template #status="{ row }">
                    <el-switch
                        v-model="row.status"
                        :active-value="1"
                        :inactive-value="0"
                        :loading="statusLoading[String(row.id)]"
                        @change="(val: number) => toggleStatus(row.id, val as 0 | 1)"
                    />
                </template>

                <template #action="{ row }">
                    <el-button size="small" type="warning" @click="onEdit(row)">编辑</el-button>
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

        <UnitFormDialog
            v-model:visible="showAddModal"
            :unit="selectedUnit"
            :loading="submitLoading"
            @confirm="handleSubmit"
        />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import Table from '@/components/table/Table.vue'
    import type { UnitItem } from '@/api/admin/unit'
    import { Plus, Delete } from '@element-plus/icons-vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { getAdminApi } from '@/api/client'
    import UnitFormDialog from './model/UnitFormDialog.vue'

    const columns = [
        { id: '1', label: '单位名称', key: 'name' },
        { id: '3', label: '排序值', key: 'sort' },
        { id: '2', label: '状态', key: 'status' },
    ]

    let isInit = true;
    const data = ref<UnitItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const selectList = ref<UnitItem[]>([])

    const loadData = async () => {
        const api = getAdminApi()
        const res = await api.fetchUnitPage({ page: page.value, pageSize: pageSize.value })
        data.value = res.data.records
        total.value = Number(res.data.total) || 0
        isInit = false;
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
    const selectedUnit = ref<Partial<UnitItem> | null>(null)
    const submitLoading = ref(false)

    const onAdd = () => {
        selectedUnit.value = null
        showAddModal.value = true
    }

    const handleSubmit = async (payload: Partial<UnitItem>) => {
        submitLoading.value = true
        try {
            const api = getAdminApi()
            if (payload.id) {
                await api.updateUnit(String(payload.id), payload)
                ElMessage.success('更新成功')
            } else {
                await api.addUnit(payload)
                ElMessage.success('添加成功')
            }

            showAddModal.value = false
            selectedUnit.value = null
            loadData()
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
            await api.batchDeleteUnit(ids)
            ElMessage.success('删除成功')
            selectList.value = []
            loadData()
        } catch (err: unknown) {
            if (err !== 'cancel') {
                ElMessage.error('删除失败')
            }
        }
    }

    const onEdit = (row: UnitItem) => {
        selectedUnit.value = {
            ...JSON.parse(JSON.stringify(row)),
        }
        showAddModal.value = true
    }

    const statusLoading = ref<Record<string, boolean>>({})

    const toggleStatus = async (id: string | number, newStatus: 0 | 1) => {
        if (isInit) return;

        const key = String(id)
        statusLoading.value[key] = true

        const row = data.value.find((r) => String(r.id) === key)
        const prevStatus = newStatus === 1 ? 0 : 1

        try {
            const api = getAdminApi()
            await api.updateUnitStatus(String(id), newStatus)
            ElMessage.success('设置成功')
        } catch {
            if (row) {
                row.status = prevStatus
            }
        } finally {
            statusLoading.value[key] = false
        }
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped></style>
