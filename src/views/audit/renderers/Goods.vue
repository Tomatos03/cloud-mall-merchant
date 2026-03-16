<template>
    <div v-if="auditItem" class="space-y-4">
        <!-- 审核状态信息 -->
        <div
            v-if="auditItem.reason"
            class="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between"
        >
            <div class="flex items-center gap-3">
                <span class="text-sm text-red-600">
                    拒绝原因：{{ auditItem.reason }}
                </span>
            </div>
        </div>

        <!-- 商品基本信息 -->
        <section class="bg-white rounded border border-gray-100 p-4 space-y-3">
            <div class="flex items-center justify-between gap-4">
                <span class="text-xs text-gray-500 font-medium">商品名称</span>
                <span class="text-sm text-gray-900 text-right break-all">
                    {{ auditItem.data.goodsName || '-' }}
                </span>
            </div>
            <div class="flex items-center justify-between gap-4">
                <span class="text-xs text-gray-500 font-medium">商品卖点</span>
                <span class="text-sm text-gray-900 text-right break-all">
                    {{ auditItem.data.sellPoint || '-' }}
                </span>
            </div>
            <div class="flex items-center justify-between gap-4">
                <span class="text-xs text-gray-500 font-medium">价格区间</span>
                <span class="text-sm text-red-500">{{ getPriceRange(auditItem.data) }}</span>
            </div>
            <!-- <div class="flex items-center justify-between gap-4">
                <span class="text-xs text-gray-500 font-medium">分类</span>
                <span class="text-sm text-gray-900 text-right break-all">
                    {{ categoryName || '-' }}
                </span>
            </div> -->
            <div class="flex items-center justify-between gap-4">
                <span class="text-xs text-gray-500 font-medium">单位</span>
                <span class="text-sm text-gray-900">{{ auditItem.data.unitName || '-' }}</span>
            </div>

            <div class="border-t border-gray-100"></div>

            <section>
                <span class="text-xs text-gray-500 block mb-3 font-medium">商品图示</span>
                <div class="flex flex-wrap gap-3">
                    <div
                        v-for="(img, index) in auditItem.data.displayImageUrls || []"
                        :key="img"
                        class="w-48 rounded border border-gray-100 overflow-hidden"
                    >
                        <div class="relative h-40 bg-gray-50">
                            <el-image
                                :src="img"
                                fit="contain"
                                class="w-full h-full cursor-zoom-in p-1"
                                :preview-src-list="auditItem.data.displayImageUrls"
                                :initial-index="index"
                                preview-teleported
                            />
                            <div
                                v-if="index === 0"
                                class="absolute bottom-0 left-0 px-2 py-1 bg-gray-800/80 text-white text-[9px] rounded-tr"
                            >
                                主图
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="!auditItem.data.displayImageUrls?.length"
                        class="w-48 h-40 rounded border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400 text-sm"
                    >
                        暂无图片
                    </div>
                </div>
            </section>

            <section v-if="auditItem.data.descriptionImageUrls?.length">
                <div class="border-t border-gray-100 pt-3">
                    <span class="text-xs text-gray-500 block mb-3 font-medium">商品详情图</span>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        <div
                            v-for="(url, imgIndex) in auditItem.data.descriptionImageUrls"
                            :key="imgIndex"
                            class="aspect-square rounded border border-gray-50 overflow-hidden relative group"
                        >
                            <el-image
                                :src="url"
                                fit="cover"
                                class="w-full h-full cursor-zoom-in"
                                :preview-src-list="auditItem.data.descriptionImageUrls"
                                :initial-index="imgIndex"
                                preview-teleported
                            />
                            <div
                                class="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                图 {{ imgIndex + 1 }}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>

        <!-- 规格与库存 -->
        <section
            v-if="auditItem.data.skus?.length"
            class="bg-white rounded border border-gray-100 p-4 space-y-3"
        >
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-900 font-bold">规格与库存</span>
                <span class="text-xs text-gray-500"
                    >共 {{ auditItem.data.skus.length }} 个 SKU</span
                >
            </div>
            <div class="border-t border-gray-50"></div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead>
                        <tr class="text-gray-400 border-b border-gray-50">
                            <th class="py-2 font-medium">规格</th>
                            <th class="py-2 font-medium w-24 text-right">价格</th>
                            <th class="py-2 font-medium w-24 text-right">库存</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr
                            v-for="(sku, skuIndex) in auditItem.data.skus"
                            :key="skuIndex"
                            class="text-gray-700"
                        >
                            <td class="py-2.5">
                                <div class="flex flex-wrap gap-1">
                                    <span
                                        v-for="spec in sku.specs"
                                        :key="spec.name"
                                        class="px-1.5 py-0.5 bg-gray-50 rounded text-xs text-gray-600"
                                    >
                                        {{ spec.name }}: {{ spec.value }}
                                    </span>
                                </div>
                            </td>
                            <td class="py-2.5 text-right font-mono text-red-500">
                                ¥{{ sku.price }}
                            </td>
                            <td class="py-2.5 text-right font-mono">{{ sku.inventory }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import type { AuditRendererProps } from '../types'
    import type { GoodsAudit } from '../schemas/goods'

    const props = defineProps<AuditRendererProps<GoodsAudit>>()

    // 取数组中的第一个元素
    const auditItem = computed(() => props.data?.[0] ?? null)

    const getPriceRange = (goodsData: GoodsAudit) => {
        const { minPrice, maxPrice } = goodsData
        console.debug('Calculating price range with minPrice:', minPrice, 'maxPrice:', maxPrice)
        if (minPrice && maxPrice && minPrice !== maxPrice) {
            return `¥${minPrice} - ¥${maxPrice}`
        }
        return `¥${minPrice ?? '0.00'}`
    }
</script>
