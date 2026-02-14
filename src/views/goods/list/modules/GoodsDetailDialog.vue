<template>
    <el-dialog
        v-model="visible"
        title="商品详情"
        width="900px"
        destroy-on-close
        class="goods-detail-dialog"
    >
        <div v-if="data" class="h-150 overflow-y-auto pr-2 space-y-6 pb-6">
            <!-- 审核信息头部 -->
            <div
                v-if="data.auditInfo && isAuditStatus"
                :class="[
                    'rounded-lg border p-4 space-y-4',
                    data.auditStatus === AuditStatus.REJECTED
                        ? 'border-red-200 bg-red-50'
                        : 'border-blue-200 bg-blue-50',
                ]"
            >
                <div class="flex items-center gap-2">
                    <span
                        :class="[
                            'text-lg font-bold',
                            data.auditStatus === AuditStatus.REJECTED
                                ? 'text-red-900'
                                : 'text-blue-900',
                        ]"
                    >
                        审核信息
                    </span>
                    <el-tag
                        v-if="data.auditStatus"
                        :type="AuditStatusMap[data.auditStatus as AuditStatus]?.type || 'info'"
                        effect="dark"
                    >
                        {{
                            AuditStatusMap[data.auditStatus as AuditStatus]?.label ||
                            data.auditStatus
                        }}
                    </el-tag>
                </div>

                <!-- 审核基本信息 -->
                <div v-if="data.auditInfo?.auditId" class="text-sm text-gray-600">
                    <div>审核ID: {{ data.auditInfo?.auditId }}</div>
                    <div v-if="data.auditInfo?.createTime">
                        申请时间: {{ data.auditInfo?.createTime }}
                    </div>
                </div>

                <!-- 审核拒绝原因 -->
                <div
                    v-if="data.auditStatus === AuditStatus.REJECTED && data.auditInfo?.auditReason"
                    class="rounded bg-white p-4 border-l-4 border-red-500"
                >
                    <div class="text-sm font-bold text-red-700 mb-2 flex items-center gap-1">
                        <span class="text-lg">⚠️</span>
                        拒绝原因
                    </div>
                    <div class="text-sm text-gray-700 leading-relaxed">
                        {{ data.auditInfo?.auditReason }}
                    </div>
                </div>

                <!-- 改动摘要 -->
                <div
                    v-if="isChangeAuditStatus && changedFields.length > 0"
                    class="rounded bg-white p-3 border-l-4 border-blue-500"
                >
                    <div class="text-sm font-bold text-blue-700 mb-2">📋 改动字段</div>
                    <div class="flex flex-wrap gap-2">
                        <el-tag
                            v-for="field in changedFields"
                            :key="field"
                            size="small"
                            type="warning"
                            effect="dark"
                        >
                            {{ field }}
                        </el-tag>
                    </div>
                </div>
            </div>

            <!-- 1. 基本信息 -->
            <el-descriptions :title="'基本信息'" :column="2" border>
                <!-- 商品名称 -->
                <el-descriptions-item label="商品名称" :span="2">
                    <div class="w-full">
                        <div v-if="isFieldChanged('goodsName')" class="flex items-center gap-2">
                            <span class="line-through text-gray-400">{{ data.goodsName }}</span>
                            <span class="text-yellow-600 font-semibold"
                                >→ {{ data.auditInfo?.pendingGoodsInfo?.goodsName }}</span
                            >
                        </div>
                        <div v-else class="font-medium text-gray-800">{{ data.goodsName }}</div>
                    </div>
                </el-descriptions-item>

                <!-- 商品卖点 -->
                <el-descriptions-item label="商品卖点" :span="2">
                    <div class="w-full">
                        <div v-if="isFieldChanged('sellPoint')" class="flex items-center gap-2">
                            <span class="line-through text-gray-400">{{
                                data.sellPoint || '(空)'
                            }}</span>
                            <span class="text-yellow-600 font-semibold"
                                >→ {{ data.auditInfo?.pendingGoodsInfo?.sellPoint || '(空)' }}</span
                            >
                        </div>
                        <div v-else class="text-gray-600 italic">
                            {{ data.sellPoint || '暂无卖点描述' }}
                        </div>
                    </div>
                </el-descriptions-item>

                <!-- 商品分类 -->
                <el-descriptions-item label="商品分类">
                    {{ data.categoryPath }}
                </el-descriptions-item>

                <!-- 销售价格 -->
                <el-descriptions-item
                    v-if="data.minPrice !== undefined && data.maxPrice !== undefined"
                    label="销售价格"
                >
                    <span class="text-rose-500 font-bold">
                        {{ formatPrice(data.minPrice, data.maxPrice) }}
                    </span>
                </el-descriptions-item>

                <!-- 计价单位 -->
                <el-descriptions-item label="计价单位">
                    {{ data.unitName }}
                </el-descriptions-item>

                <!-- 商品状态 -->
                <el-descriptions-item
                    v-if="data.status !== undefined && data.status !== null"
                    label="商品状态"
                >
                    <el-tag :type="data.status ? 'success' : 'info'" effect="dark">
                        {{ data.status ? '已上架' : '未上架' }}
                    </el-tag>
                </el-descriptions-item>

                <!-- 审核状态 -->
                <el-descriptions-item label="审核状态">
                    <el-tag
                        v-if="AuditStatusMap[data.auditStatus as AuditStatus]"
                        :type="AuditStatusMap[data.auditStatus as AuditStatus].type"
                        effect="dark"
                    >
                        {{ AuditStatusMap[data.auditStatus as AuditStatus].label }}
                    </el-tag>
                    <el-tag v-else type="info" effect="dark"> - </el-tag>
                </el-descriptions-item>
            </el-descriptions>

            <!-- 3. 图片展示 -->
            <section>
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">商品图示</span>
                </div>
                <div class="flex flex-wrap gap-3">
                    <!-- 原有图片 -->
                    <template v-if="data.displayImageUrls && data.displayImageUrls.length > 0">
                        <div
                            v-for="(img, i) in data.displayImageUrls"
                            :key="i"
                            class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                        >
                            <el-image
                                :src="img"
                                fit="cover"
                                class="w-full h-full cursor-zoom-in"
                                :preview-src-list="data.displayImageUrls"
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

                    <!-- 新增图片 -->
                    <template
                        v-if="isFieldChanged('displayImageUrls') && newDisplayImages.length > 0"
                    >
                        <div
                            v-for="(img, i) in newDisplayImages"
                            :key="`new-${i}`"
                            class="relative w-28 h-28 rounded border border-yellow-300 overflow-hidden"
                        >
                            <el-image
                                :src="img"
                                fit="cover"
                                class="w-full h-full cursor-zoom-in"
                                :preview-src-list="newDisplayImages"
                                :initial-index="i"
                                preview-teleported
                            />
                            <div
                                class="absolute top-0 left-0 px-1.5 py-0.5 bg-yellow-500/80 text-white text-[9px] rounded-br z-10"
                            >
                                待审
                            </div>
                        </div>
                    </template>
                </div>
            </section>

            <!-- 详情描述图 -->
            <section v-if="data.descriptionImageUrls && data.descriptionImageUrls.length > 0 || isFieldChanged('descriptionImageUrls')">
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">商品详情图</span>
                </div>
                <div class="flex flex-wrap gap-3">
                    <!-- 原有图片 -->
                    <template v-if="data.descriptionImageUrls && data.descriptionImageUrls.length > 0">
                        <div
                            v-for="(img, i) in data.descriptionImageUrls"
                            :key="i"
                            class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                        >
                            <el-image
                                :src="img"
                                fit="cover"
                                class="w-full h-full cursor-zoom-in"
                                :preview-src-list="data.descriptionImageUrls"
                                :initial-index="i"
                                preview-teleported
                            />
                        </div>
                    </template>
                    <div v-else>暂无描述图</div>

                    <!-- 新增图片 -->
                    <template
                        v-if="isFieldChanged('descriptionImageUrls') && newDescriptionImages.length > 0"
                    >
                        <div
                            v-for="(img, i) in newDescriptionImages"
                            :key="`new-${i}`"
                            class="relative w-28 h-28 rounded border border-yellow-300 overflow-hidden"
                        >
                            <el-image
                                :src="img"
                                fit="cover"
                                class="w-full h-full cursor-zoom-in"
                                :preview-src-list="newDescriptionImages"
                                :initial-index="i"
                                preview-teleported
                            />
                            <div
                                class="absolute top-0 left-0 px-1.5 py-0.5 bg-yellow-500/80 text-white text-[9px] rounded-br z-10"
                            >
                                待审
                            </div>
                        </div>
                    </template>
                </div>
            </section>

            <!-- 3. SKU 配置 -->
            <section v-if="data.skus && data.skus.length > 0">
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">SKU 详细</span>
                </div>

                <!-- 规格参数 -->
                <div v-if="data.specifications && data.specifications.length > 0" class="my-2.5 border border-gray-200 rounded overflow-hidden">
                    <!-- 规格表头 -->
                    <div class="flex bg-gray-50 border-b border-gray-200">
                        <div class="w-1/3 px-4 py-3 font-semibold text-sm text-gray-700 border-r border-gray-200">规格名称</div>
                        <div class="flex-1 px-4 py-3 font-semibold text-sm text-gray-700">规格值</div>
                    </div>
                    <!-- 规格行 -->
                    <div
                        v-for="(spec, specIndex) in data.specifications"
                        :key="specIndex"
                        class="flex border-b border-gray-200 last:border-b-0"
                    >
                        <!-- 规格名称列 -->
                        <div class="w-1/3 px-4 py-3 border-r border-gray-200 bg-gray-50">
                            <span v-if="!isFieldChanged('specifications') || getPendingSpec(specIndex)?.name === spec.name" class="block truncate">
                                {{ spec.name }}
                            </span>
                            <span v-else class="flex items-center gap-1 whitespace-nowrap overflow-hidden">
                                <span class="truncate">{{ spec.name }}</span>
                                <span class="text-gray-400 flex-shrink-0">→</span>
                                <span class="text-yellow-600 font-semibold truncate">{{ getPendingSpec(specIndex)?.name }}</span>
                            </span>
                        </div>
                        <!-- 规格值列 -->
                        <div class="flex-1 px-4 py-3 flex items-center gap-2 flex-wrap">
                            <div class="flex flex-wrap gap-2">
                                <el-tag
                                    v-for="(val, index) in spec.values"
                                    :key="index"
                                    size="small"
                                    class="rounded"
                                    :class="{
                                        'line-through opacity-50': hasSpecValueChanged(specIndex),
                                    }"
                                >
                                    {{ val }}
                                </el-tag>
                            </div>
                            <!-- 只有值改变时才显示箭头和新值 -->
                            <template v-if="hasSpecValueChanged(specIndex)">
                                <span class="text-gray-400">→</span>
                                <el-tag
                                    v-for="(val, index) in getPendingSpec(specIndex)?.values || []"
                                    :key="`new-${index}`"
                                    size="small"
                                    type="warning"
                                    class="rounded"
                                >
                                    {{ val }}
                                </el-tag>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- SKU表格 -->
                <div>
                    <Table :columns="skuColumns" :data="data.skus">
                        <template #specs="{ row }">
                            <div class="flex flex-wrap gap-1">
                                <el-tag
                                    v-for="s in row.specs"
                                    :key="s.value"
                                    size="small"
                                    type="info"
                                    class="rounded"
                                >
                                    {{ s.value }}
                                </el-tag>
                            </div>
                        </template>
                        <template #priceStr="{ row }">
                            <span class="font-bold text-rose-500">
                                {{ formatPrice(row.price) }}
                            </span>
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
            </section>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
    import { computed, toRefs } from 'vue'
    import type { GoodsDetail } from '@/api/goods'
    import Table from '@/components/table/Table.vue'
    import { formatPrice } from '@/utils/money'
    import { AuditStatus, AuditStatusMap } from '@/api/audit'

    interface Props {
        data: GoodsDetail
        modelValue: boolean
    }

    const props = defineProps<Props>()
    const { data, modelValue } = toRefs<Props>(props)

    const emit = defineEmits<{
        (e: 'update:modelValue', value: boolean): void
    }>()

    const visible = computed({
        get: () => modelValue.value,
        set: (value) => emit('update:modelValue', value),
    })

    // 判断是否为审核状态
    const isAuditStatus = computed(() => {
        if (!data.value?.auditStatus) return false
        return data.value.auditStatus !== AuditStatus.APPROVED
    })

    // 判断是否需要展示待审核信息
    const isChangeAuditStatus = computed(() => {
        if (!data.value?.auditInfo?.pendingGoodsInfo) return false
        return data.value.auditStatus === AuditStatus.REAUDIT
    })

    // 检查字段是否被改动
    const isFieldChanged = (fieldName: string): boolean => {
        if (!isChangeAuditStatus.value) return false

        const pending = data.value?.auditInfo?.pendingGoodsInfo
        if (!pending) return false

        switch (fieldName) {
            case 'goodsName':
                return data.value?.goodsName !== pending.goodsName
            case 'sellPoint':
                return data.value?.sellPoint !== pending.sellPoint
            case 'displayImageUrls':
                return (
                    JSON.stringify(data.value?.displayImageUrls) !==
                    JSON.stringify(pending.displayImageUrls)
                )
            case 'descriptionImageUrls':
                return (
                    JSON.stringify(data.value?.descriptionImageUrls) !==
                    JSON.stringify(pending.descriptionImageUrls)
                )
            case 'specifications':
                return (
                    JSON.stringify(data.value?.specifications) !==
                    JSON.stringify(pending.specifications)
                )
            case 'skus':
                return JSON.stringify(data.value?.skus) !== JSON.stringify(pending.skus)
            default:
                return false
        }
    }

    // 获取改动字段列表
    const changedFields = computed(() => {
        const fields = []
        if (isFieldChanged('goodsName')) fields.push('商品名称')
        if (isFieldChanged('sellPoint')) fields.push('商品卖点')
        if (isFieldChanged('displayImageUrls')) fields.push('展示图')
        if (isFieldChanged('descriptionImageUrls')) fields.push('详情图')
        if (isFieldChanged('specifications')) fields.push('规格参数')
        if (isFieldChanged('skus')) fields.push('SKU配置')
        return fields
    })

    // 获取新增的展示图片
    const newDisplayImages = computed(() => {
        if (!isFieldChanged('displayImageUrls')) return []

        const oldImages = data.value?.displayImageUrls || []
        const newImages = data.value?.auditInfo?.pendingGoodsInfo?.displayImageUrls || []

        return newImages.filter((img, index) => !oldImages.includes(img))
    })

    // 获取新增的描述图片
    const newDescriptionImages = computed(() => {
        if (!isFieldChanged('descriptionImageUrls')) return []

        const oldImages = data.value?.descriptionImageUrls || []
        const newImages = data.value?.auditInfo?.pendingGoodsInfo?.descriptionImageUrls || []

        return newImages.filter((img, index) => !oldImages.includes(img))
    })

    // 根据索引获取待审规格映射（按位置对应，避免规格名称改动导致查找失败）
    const getPendingSpec = (index: number) => {
        if (!isFieldChanged('specifications')) return null
        return data.value?.auditInfo?.pendingGoodsInfo?.specifications?.[index]
    }

    // 检查某个规格的值是否改变
    const hasSpecValueChanged = (index: number): boolean => {
        if (!isFieldChanged('specifications')) return false
        const oldSpec = data.value?.specifications?.[index]
        const newSpec = getPendingSpec(index)
        if (!oldSpec || !newSpec) return false
        return JSON.stringify(oldSpec.values) !== JSON.stringify(newSpec.values)
    }

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
