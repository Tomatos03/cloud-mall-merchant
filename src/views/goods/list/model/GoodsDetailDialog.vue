<template>
    <el-dialog
        v-model="visible"
        title="商品详情"
        width="900px"
        destroy-on-close
        class="goods-detail-dialog"
    >
        <div v-if="data" class="h-[600px] overflow-y-auto pr-2 space-y-6 pb-6">
            <!-- 1. 基本信息 -->
            <el-descriptions :title="'基本信息'" :column="2" border>
                <el-descriptions-item label="商品名称" :span="2">
                    <span class="font-medium text-gray-800">{{ data.goodsName }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="商品卖点" :span="2">
                    <span class="text-gray-600 italic">{{ data.sellPoint || '暂无卖点描述' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="商品分类">
                    {{ data.categoryPath }}
                </el-descriptions-item>
                <el-descriptions-item
                    v-if="data.minPriceStr !== undefined && data.maxPriceStr !== undefined"
                    label="销售价格"
                >
                    <span class="text-rose-500 font-bold">
                        {{ formatPrice(data.minPriceStr, data.maxPriceStr) }}
                    </span>
                </el-descriptions-item>
                <el-descriptions-item label="计价单位">
                    {{ data.unitName }}
                </el-descriptions-item>
                <el-descriptions-item
                    v-if="data.status !== undefined && data.status !== null"
                    label="商品状态"
                >
                    <el-tag :type="data.status ? 'success' : 'info'" effect="dark">
                        {{ data.status ? '已上架' : '未上架' }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item v-if="isAdmin" label="所属店铺" :span="2">
                    {{ data.storeName || '-' }}
                </el-descriptions-item>
            </el-descriptions>

            <!-- 2. 图片展示 -->
            <section>
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">商品图示</span>
                </div>
                <div class="flex flex-wrap gap-3">
                    <template v-if="images">
                        <div
                            v-for="(img, i) in images"
                            :key="i"
                            class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                        >
                            <el-image
                                :src="img"
                                fit="cover"
                                class="w-full h-full cursor-zoom-in"
                                :preview-src-list="images"
                                :initial-index="i"
                                preview-teleported
                            />
                            <div
                                v-if="i === 0"
                                class="absolute top-0 left-0 px-1.5 py-0.5 bg-blue-500/80 text-white text-[9px] rounded-br z-10"
                            >
                                主图
                            </div>
                        </div>
                    </template>
                    <div v-else>暂无展示图</div>
                </div>
            </section>

            <!-- 详情描述图 -->
            <section v-if="data.descriptionImgList && data.descriptionImgList.length > 0">
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">商品详情图</span>
                </div>
                <div class="flex flex-wrap gap-3">
                    <div
                        v-for="(img, i) in data.descriptionImgList"
                        :key="i"
                        class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                    >
                        <el-image
                            :src="img"
                            fit="cover"
                            class="w-full h-full cursor-zoom-in"
                            :preview-src-list="data.descriptionImgList"
                            :initial-index="i"
                            preview-teleported
                        />
                    </div>
                </div>
            </section>

            <!-- 3. 规格配置 -->
            <section
                v-if="
                    (data.specifications && data.specifications.length > 0) ||
                    (data.skus && data.skus.length > 0)
                "
            >
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">规格详细</span>
                </div>

                <div class="space-y-4">
                    <!-- 规格映射 -->
                    <div
                        v-if="data.specifications && data.specifications.length > 0"
                        class="rounded border border-gray-100 divide-y divide-gray-100 overflow-hidden"
                    >
                        <div
                            v-for="spec in data.specifications"
                            :key="spec.name"
                            class="flex text-xs"
                        >
                            <div
                                class="w-30 bg-slate-50 text-slate-500 shrink-0 px-4 py-3 font-medium flex items-center border-r border-gray-100"
                            >
                                {{ spec.name }}
                            </div>
                            <div class="flex-1 flex flex-wrap gap-2 p-3 bg-white items-center">
                                <el-tag
                                    v-for="(val, index) in spec.values"
                                    :key="index"
                                    size="small"
                                    class="rounded"
                                    >{{ val }}</el-tag
                                >
                            </div>
                        </div>
                    </div>

                    <!-- SKU 规格组合 -->
                    <div v-if="data.skus && data.skus.length > 0">
                        <Table :columns="skuColumns" :data="data.skus">
                            <template #specs="{ row }">
                                <div class="flex flex-wrap gap-1">
                                    <el-tag
                                        v-for="s in row.specs"
                                        :key="s.value"
                                        size="small"
                                        type="info"
                                        class="rounded"
                                        >{{ s.value }}</el-tag
                                    >
                                </div>
                            </template>
                            <template #priceStr="{ row }">
                                <span class="font-bold text-rose-500">{{ row.priceStr }}</span>
                            </template>
                            <template #inventory="{ row }">
                                <span
                                    :class="
                                        row.inventory > 10
                                            ? 'text-green-600'
                                            : 'text-rose-600 font-medium'
                                    "
                                >
                                    {{ row.inventory }}
                                </span>
                            </template>
                            <template #status="{ row }">
                                <el-tag :type="!!row.status ? 'success' : 'info'" size="small">
                                    {{ !!row.status ? '上架' : '下架' }}
                                </el-tag>
                            </template>
                        </Table>
                    </div>
                </div>
            </section>


        </div>
    </el-dialog>
</template>

<script setup lang="ts">
    import { computed, toRefs } from 'vue'
    import { useUserStore } from '@/stores/user'
    import type { GoodsDetail } from '@/api/common'
    import { formatPrice } from '@/utils/price'
    import Table from '@/components/table/Table.vue'

    interface Props {
        data: GoodsDetail
        modelValue: boolean
    }

    const props = defineProps<Props>()
    const userStore = useUserStore()
    const { data, modelValue } = toRefs<Props>(props)

    const emit = defineEmits<{
        (e: 'update:modelValue', value: boolean): void
    }>()

    const visible = computed({
        get: () => modelValue.value,
        set: (value) => emit('update:modelValue', value),
    })

    // 判断是否为管理员
    const isAdmin = computed(() => userStore.isAdmin)

    // 合并 mainImg 和 imgList 成一个图片列表
    const images = computed(() => {
        const images: string[] = [data.value.mainImg]
        if (data.value?.imgList && data.value.imgList.length > 0) {
            images.push(...data.value.imgList)
        }

        return images
    })

    // SKU 表格列配置
    const skuColumns = computed(() => [
        {
            id: 'specs',
            label: '规格组合',
            key: 'specs',
        },
        {
            id: 'priceStr',
            label: '单价',
            key: 'priceStr',
        },
        {
            id: 'inventory',
            label: '库存',
            key: 'inventory',
        },
        {
            id: 'status',
            label: '状态',
            key: 'status',
        },
    ])
</script>

<style scoped>
    .goods-detail-dialog :deep(.el-dialog) {
        border-radius: 12px;
        overflow: hidden;
    }

    .goods-detail-dialog :deep(.el-dialog__header) {
        margin-right: 0;
        padding: 20px 24px;
        border-bottom: 1px solid #f1f5f9;
    }

    .goods-detail-dialog :deep(.el-dialog__title) {
        font-weight: 700;
        color: #1e293b;
        font-size: 16px;
    }

    .goods-detail-dialog :deep(.el-dialog__body) {
        padding: 24px;
    }

    .goods-detail-dialog :deep(.el-descriptions__title) {
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
    }

    .goods-detail-dialog :deep(.el-descriptions__label) {
        background-color: #f8fafc;
        color: #64748b;
        font-weight: 500;
        width: 120px;
    }

    .goods-detail-dialog :deep(.el-descriptions__content) {
        color: #334155;
    }
</style>
