<template>
    <el-dialog
        v-model="visible"
        title="选择秒杀SKU"
        width="800px"
        destroy-on-close
        class="seckill-apply-dialog"
        @closed="handleReset"
    >
        <div class="p-4 flex flex-col gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div>
                <div class="border border-gray-100 rounded-lg overflow-hidden">
                    <Table
                        v-model:select-list="selectedRows"
                        :columns="skuColumns"
                        :data="skuList"
                        height="400px"
                        :show-id="false"
                        :show-selection="true"
                        :loading="skuLoading"
                    >
                        <template #goods="{ row }">
                            <div class="flex items-center gap-3 py-1">
                                <el-image
                                    v-if="row.imageUrl"
                                    :src="row.imageUrl"
                                    class="w-10 h-10 rounded-lg object-cover"
                                />
                                <div class="flex flex-col">
                                    <span class="font-medium text-gray-700 line-clamp-1">{{
                                        row.goodsName
                                    }}</span>
                                </div>
                            </div>
                        </template>
                        <template #specs="{ row }">
                            <span class="text-gray-600 line-clamp-1">{{
                                row.specs?.join(' / ') || '-'
                            }}</span>
                        </template>
                        <template #price="{ row }">
                            <span class="text-gray-600">¥{{ row.price }}</span>
                        </template>
                    </Table>

                    <div class="p-3 bg-gray-50 flex justify-end">
                        <el-pagination
                            v-model:current-page="page"
                            v-model:page-size="pageSize"
                            :total="total"
                            small
                            layout="total, prev, pager, next"
                            @current-change="loadSkus"
                        />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3 px-4 py-2">
                <el-button @click="visible = false">取消</el-button>
                <el-button
                    type="primary"
                    :disabled="selectedRows.length === 0"
                    @click="handleSubmit"
                >
                    确认选择 ({{ selectedRows.length }})
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import Table from '@/components/table/Table.vue'
    import { fetchGoodsSkuPage, type GoodsSkuListItem } from '@/api/goods'

    interface Props {
        modelValue: boolean
        activityId: number
    }

    const props = defineProps<Props>()
    const emit = defineEmits(['update:modelValue', 'select'])

    const visible = computed({
        get: () => props.modelValue,
        set: (val) => emit('update:modelValue', val),
    })

    const skuLoading = ref(false)
    const skuList = ref<GoodsSkuListItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const selectedRows = ref<GoodsSkuListItem[]>([])

    const skuColumns = [
        { id: '2', label: '商品名称', key: 'goods', minWidth: 200 },
        { id: '3', label: '规格', key: 'specs', minWidth: 180 },
        { id: '4', label: '原价', key: 'price', width: 100 },
    ]

    const loadSkus = async () => {
        skuLoading.value = true
        try {
            const res = await fetchGoodsSkuPage({
                page: page.value,
                pageSize: pageSize.value,
            })
            skuList.value = res.data.records ?? []
            total.value = res.data.total ?? 0
        } finally {
            skuLoading.value = false
        }
    }

    const handleReset = () => {
        selectedRows.value = []
        page.value = 1
    }

    const handleSubmit = () => {
        emit('select', [...selectedRows.value])
        visible.value = false
    }

    watch(
        () => props.modelValue,
        (newVal) => {
            if (newVal) {
                loadSkus()
            }
        },
    )
</script>

<style scoped>
    .seckill-apply-dialog :deep(.el-dialog__body) {
        padding: 0;
    }

    .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 4px;
    }
</style>
