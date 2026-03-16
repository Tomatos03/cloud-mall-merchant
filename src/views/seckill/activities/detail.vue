<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <div
            class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 mb-6"
        >
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <el-button @click="router.back()" class="mr-4">
                        <el-icon><ArrowLeft /></el-icon>
                        返回
                    </el-button>
                    <h2 class="text-xl font-bold text-gray-800">活动详情: {{ activity?.name }}</h2>
                </div>
                <el-tag
                    :type="
                        activity
                            ? SeckillActivityStatusMap[activity.status]?.type
                            : SeckillActivityStatusMap[SeckillActivityStatus.APPLYING].type
                    "
                    effect="dark"
                    size="large"
                >
                    {{
                        activity
                            ? SeckillActivityStatusMap[activity.status]?.label
                            : SeckillActivityStatusMap[SeckillActivityStatus.APPLYING].label
                    }}
                </el-tag>
            </div>

            <div v-if="activity" class="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
                <div class="space-y-4">
                    <div class="flex items-center">
                        <span class="w-24 font-medium">活动日期:</span>
                        <span>{{ activity.activityDate }}</span>
                    </div>
                    <div class="flex items-center">
                        <span class="w-24 font-medium">场次时间:</span>
                        <span>{{ formatHourRange(activity.startHour) }}</span>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center">
                        <span class="w-24 font-medium">商品上限:</span>
                        <span>{{ activity.maxItems ?? '-' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div
            class="flex-1 flex flex-col min-h-0 bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6"
        >
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <el-icon class="mr-2 text-blue-500"><Goods /></el-icon>
                    秒杀商品列表
                </h3>
                <div class="flex gap-3">
                    <el-button
                        v-if="localDrafts.length > 0"
                        type="success"
                        :loading="submitting"
                        :disabled="!canSubmitForActivity"
                        @click="handleSubmitLocalDrafts"
                    >
                        <el-icon class="mr-1"><Check /></el-icon>
                        提交新增 ({{ localDrafts.length }})
                    </el-button>
                    <el-button
                        type="primary"
                        :disabled="!canSubmitForActivity"
                        @click="applyDialogVisible = true"
                    >
                        <el-icon class="mr-1"><Plus /></el-icon>
                        添加商品
                    </el-button>
                </div>
            </div>

            <div class="flex-1 overflow-hidden">
                <Table
                    :columns="columns"
                    :data="tableRows"
                    height="100%"
                    :show-id="false"
                    :loading="loading"
                >
                    <template #goods="{ row }">
                        <div class="flex items-center gap-3 py-1">
                            <el-image
                                v-if="row.mainImageUrl"
                                :src="row.mainImageUrl"
                                class="w-12 h-12 rounded-lg object-cover border border-gray-100"
                                :preview-src-list="[row.mainImageUrl]"
                                preview-teleported
                            />
                            <div
                                v-else
                                class="w-12 h-12 rounded-lg border border-gray-100 bg-gray-50 text-gray-400 flex items-center justify-center text-xs"
                            >
                                无图
                            </div>
                            <div class="flex flex-col min-w-0">
                                <span class="font-medium text-gray-700 line-clamp-1">
                                    {{ row.goodsName || `SKU#${row.skuId || row.id}` }}
                                </span>
                                <span class="text-xs text-gray-400 line-clamp-1">
                                    {{ getSkuSpecsText(row) }}
                                </span>
                            </div>
                        </div>
                    </template>

                    <template #seckillPrice="{ row }">
                        <el-input-number
                            v-if="isLocalDraft(row)"
                            v-model="row.seckillPrice"
                            :precision="2"
                            :step="1"
                            :min="0"
                            size="small"
                            class="w-28"
                        />
                        <el-input-number
                            v-else-if="isServerEditing(row.id)"
                            :model-value="getEditingPrice(row.id)"
                            :precision="2"
                            :step="1"
                            :min="0"
                            size="small"
                            class="w-28"
                            @update:model-value="onEditingPriceChange(row.id, $event)"
                        />
                        <span v-else class="text-red-500 font-bold">¥{{ row.seckillPrice }}</span>
                    </template>

                    <template #stock="{ row }">
                        <el-input-number
                            v-if="isLocalDraft(row)"
                            v-model="row.stock"
                            :min="1"
                            :step="1"
                            :precision="0"
                            size="small"
                            class="w-28"
                        />
                        <el-input-number
                            v-else-if="isServerEditing(row.id)"
                            :model-value="getEditingStock(row.id)"
                            :min="1"
                            :step="1"
                            :precision="0"
                            size="small"
                            class="w-28"
                            @update:model-value="onEditingStockChange(row.id, $event)"
                        />
                        <span v-else class="font-medium text-gray-600">{{ row.stock }}</span>
                    </template>

                    <template #status="{ row }">
                        <el-tag v-if="isLocalDraft(row)" type="info" size="small">待提交</el-tag>
                        <el-tag v-else :type="getGoodsStatusMeta(row.status).type" size="small">
                            {{ getGoodsStatusMeta(row.status).label }}
                        </el-tag>
                    </template>

                    <template #actions="{ row }">
                        <el-button
                            v-if="isLocalDraft(row)"
                            type="danger"
                            link
                            @click="removeLocalDraft(row.localId)"
                        >
                            移除
                        </el-button>

                        <template v-else-if="isServerEditing(row.id)">
                            <el-button link @click="cancelServerEdit(row.id)">取消</el-button>
                            <el-button
                                type="primary"
                                link
                                :loading="submitting"
                                @click="submitServerEdit(row)"
                            >
                                提交修改
                            </el-button>
                        </template>

                        <template v-else-if="canEditServerRow(row)">
                            <el-button type="primary" link @click="startServerEdit(row)">
                                修改并提交
                            </el-button>
                        </template>

                        <span
                            v-else-if="row.status === SeckillGoodsAuditStatus.PENDING"
                            class="text-xs text-gray-400"
                        >
                            待审核中不可修改
                        </span>
                        <span v-else class="text-xs text-gray-400">-</span>
                    </template>
                </Table>
            </div>

            <div class="mt-6 flex justify-end">
                <el-pagination
                    v-model:current-page="goodsPage"
                    v-model:page-size="goodsPageSize"
                    :total="goodsTotal"
                    :page-sizes="[10, 20, 50, 100]"
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    class="custom-pagination"
                    @current-change="handleGoodsPageChange"
                    @size-change="handleGoodsSizeChange"
                />
            </div>
        </div>

        <SeckillApplyDialog
            v-model="applyDialogVisible"
            :activity-id="activityId"
            @select="handleGoodsSelect"
        />
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { ArrowLeft, Check, Goods, Plus } from '@element-plus/icons-vue'
    import { ElMessage } from 'element-plus'
    import Table from '@/components/table/Table.vue'
    import type { GoodsSkuListItem } from '@/api/goods'
    import SeckillApplyDialog from '../modules/SeckillApplyDialog.vue'
    import {
        fetchSeckillActivityDetail,
        fetchSeckillActivityGoods,
        SeckillActivityStatus,
        SeckillActivityStatusMap,
        SeckillGoodsAuditStatus,
        SeckillGoodsAuditStatusMap,
        submitSeckillActivityGoods,
        type SeckillActivityVO,
        type SeckillGoodsAuditItemDTO,
        type SeckillGoodsDTO,
    } from '@/api/seckill'

    interface LocalDraftItem {
        localId: string
        skuId: string
        goodsName: string
        mainImageUrl: string
        skuSpecs: string[]
        seckillPrice: number
        stock: number
        isLocal: true
    }

    interface EditPayload {
        seckillPrice: number
        stock: number
    }

    const route = useRoute()
    const router = useRouter()
    const activityId = Number(route.params.id)

    const activity = ref<SeckillActivityVO>()
    const serverGoods = ref<SeckillGoodsDTO[]>([])
    const localDrafts = ref<LocalDraftItem[]>([])
    const editingMap = ref<Record<number, EditPayload>>({})

    const loading = ref(false)
    const submitting = ref(false)
    const applyDialogVisible = ref(false)

    const goodsPage = ref(1)
    const goodsPageSize = ref(10)
    const goodsTotal = ref(0)

    const canSubmitForActivity = computed(
        () => activity.value?.status === SeckillActivityStatus.APPLYING,
    )

    const columns = [
        { id: '1', label: '商品信息', key: 'goods', minWidth: 260 },
        { id: '2', label: '秒杀价', key: 'seckillPrice', width: 150 },
        { id: '3', label: '申报库存', key: 'stock', width: 150 },
        { id: '4', label: '审核状态', key: 'status', width: 120 },
        { id: '5', label: '操作', key: 'actions', width: 180 },
    ]

    const tableRows = computed(() => [...serverGoods.value, ...localDrafts.value])

    const isLocalDraft = (row: SeckillGoodsDTO | LocalDraftItem): row is LocalDraftItem => {
        return (row as LocalDraftItem).isLocal === true
    }

    const formatHourRange = (startHour: number): string => {
        const start = String(startHour).padStart(2, '0')
        const end = String((startHour + 1) % 24).padStart(2, '0')
        return `${start}:00 - ${end}:00`
    }

    const getSkuSpecs = (row: SeckillGoodsDTO | LocalDraftItem): string[] => {
        const source = row as SeckillGoodsDTO & {
            specs?: string[]
            skuSpecValues?: string[]
        }
        const specs = source.skuSpecs ?? source.specs ?? source.skuSpecValues ?? []
        if (!Array.isArray(specs)) return []
        return specs.filter((item): item is string => typeof item === 'string' && item.length > 0)
    }

    const getSkuSpecsText = (row: SeckillGoodsDTO | LocalDraftItem): string => {
        const specs = getSkuSpecs(row)
        if (specs.length === 0) {
            return '规格: -'
        }
        return `规格: ${specs.join(' / ')}`
    }

    const loadActivity = async () => {
        const res = await fetchSeckillActivityDetail(activityId)
        activity.value = res.data
    }

    const loadGoods = async () => {
        loading.value = true
        try {
            const res = await fetchSeckillActivityGoods(activityId, {
                page: goodsPage.value,
                pageSize: goodsPageSize.value,
            })
            serverGoods.value = res.data.records ?? []
            goodsTotal.value = res.data.total ?? 0
        } finally {
            loading.value = false
        }
    }

    const handleGoodsPageChange = (page: number) => {
        goodsPage.value = page
        loadGoods()
    }

    const handleGoodsSizeChange = (size: number) => {
        goodsPageSize.value = size
        goodsPage.value = 1
        loadGoods()
    }

    const normalizePrice = (value: unknown): number => {
        const num = Number(value)
        if (!Number.isFinite(num)) return 0
        return Number(num.toFixed(2))
    }

    const toSubmitPrice = (value: unknown): string => {
        return normalizePrice(value).toFixed(2)
    }

    const normalizeStock = (value: unknown): number => {
        const num = Number(value)
        if (!Number.isFinite(num)) return 0
        return Math.trunc(num)
    }

    const isValidPayload = (payload: SeckillGoodsAuditItemDTO): boolean => {
        const price = Number(payload.seckillPrice)
        if (!Number.isFinite(price) || price <= 0) {
            ElMessage.warning('秒杀价必须大于 0')
            return false
        }

        if (!Number.isInteger(payload.stock) || payload.stock <= 0) {
            ElMessage.warning('库存必须是大于 0 的整数')
            return false
        }

        return true
    }

    const submitItems = async (items: SeckillGoodsAuditItemDTO[], successMessage: string) => {
        if (!canSubmitForActivity.value) {
            ElMessage.warning('当前活动状态不允许提交商品')
            return
        }

        submitting.value = true
        try {
            await submitSeckillActivityGoods(activityId, items)
            ElMessage.success(successMessage)
            await loadGoods()
        } finally {
            submitting.value = false
        }
    }

    const handleGoodsSelect = (selectedSkus: GoodsSkuListItem[]) => {
        const existingSkuIds = new Set([
            ...serverGoods.value.map((item) => item.skuId).filter(Boolean),
            ...localDrafts.value.map((item) => item.skuId),
        ])

        const nextDrafts: LocalDraftItem[] = []

        selectedSkus.forEach((sku, index) => {
            const skuId = String(sku.skuId)
            if (existingSkuIds.has(skuId)) {
                return
            }

            const inventory = normalizeStock(sku.inventory)
            const price = sku.price ?? '0'

            nextDrafts.push({
                localId: `${Date.now()}-${index}-${skuId}`,
                skuId,
                goodsName: sku.goodsName,
                mainImageUrl: sku.imageUrl ?? '',
                skuSpecs: sku.specs ?? [],
                seckillPrice: normalizePrice(price),
                stock: inventory,
                isLocal: true,
            })

            existingSkuIds.add(skuId)
        })

        if (nextDrafts.length === 0) {
            ElMessage.info('所选 SKU 已存在于列表或待提交列表中')
            return
        }

        localDrafts.value.push(...nextDrafts)
    }

    const removeLocalDraft = (localId: string) => {
        localDrafts.value = localDrafts.value.filter((item) => item.localId !== localId)
    }

    const handleSubmitLocalDrafts = async () => {
        const payload = localDrafts.value.map((item) => ({
            skuId: item.skuId,
            seckillPrice: toSubmitPrice(item.seckillPrice),
            stock: normalizeStock(item.stock),
        }))

        if (payload.length === 0) return

        const invalid = payload.some((item) => !isValidPayload(item))
        if (invalid) return

        await submitItems(payload, '新增商品提交成功')
        localDrafts.value = []
    }

    const canEditServerRow = (row: SeckillGoodsDTO): boolean => {
        if (!canSubmitForActivity.value) return false
        return (
            row.status === SeckillGoodsAuditStatus.APPROVED ||
            row.status === SeckillGoodsAuditStatus.REJECTED
        )
    }

    const startServerEdit = (row: SeckillGoodsDTO) => {
        if (!canEditServerRow(row)) return

        editingMap.value[row.id] = {
            seckillPrice: normalizePrice(row.seckillPrice),
            stock: normalizeStock(row.stock),
        }
    }

    const cancelServerEdit = (rowId: number) => {
        const next = { ...editingMap.value }
        delete next[rowId]
        editingMap.value = next
    }

    const isServerEditing = (rowId: number): boolean => {
        return !!editingMap.value[rowId]
    }

    const getEditingPrice = (rowId: number): number => {
        return editingMap.value[rowId]?.seckillPrice ?? 0
    }

    const getEditingStock = (rowId: number): number => {
        return editingMap.value[rowId]?.stock ?? 0
    }

    const setEditingPrice = (rowId: number, value: unknown) => {
        if (!editingMap.value[rowId]) return
        editingMap.value[rowId].seckillPrice = normalizePrice(value)
    }

    const setEditingStock = (rowId: number, value: unknown) => {
        if (!editingMap.value[rowId]) return
        editingMap.value[rowId].stock = normalizeStock(value)
    }

    const onEditingPriceChange = (rowId: number, value: unknown) => {
        setEditingPrice(rowId, value)
    }

    const onEditingStockChange = (rowId: number, value: unknown) => {
        setEditingStock(rowId, value)
    }

    const getGoodsStatusMeta = (status: unknown): { label: string; type: string } => {
        const safeStatus =
            typeof status === 'string' && status in SeckillGoodsAuditStatusMap
                ? (status as SeckillGoodsAuditStatus)
                : SeckillGoodsAuditStatus.PENDING

        return SeckillGoodsAuditStatusMap[safeStatus]
    }

    const submitServerEdit = async (row: SeckillGoodsDTO) => {
        const editPayload = editingMap.value[row.id]
        if (!editPayload) return

        if (!row.skuId) {
            ElMessage.warning('当前数据缺少 skuId，暂无法提交修改')
            return
        }

        const payload: SeckillGoodsAuditItemDTO = {
            skuId: String(row.skuId),
            seckillPrice: toSubmitPrice(editPayload.seckillPrice),
            stock: normalizeStock(editPayload.stock),
        }

        if (!isValidPayload(payload)) return

        await submitItems([payload], '商品修改已重新提交审核')
        cancelServerEdit(row.id)
    }

    onMounted(async () => {
        if (!Number.isFinite(activityId) || activityId <= 0) {
            ElMessage.error('活动ID无效')
            router.back()
            return
        }

        await Promise.all([loadActivity(), loadGoods()])
    })
</script>

<style scoped>
    .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
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
