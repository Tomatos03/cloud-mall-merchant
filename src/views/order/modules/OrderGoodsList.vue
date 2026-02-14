<template>
    <div class="max-h-100 overflow-y-auto pr-1 custom-scrollbar">
        <div v-if="!orderData || orderData.length === 0" class="text-gray-400 text-center py-4">
            暂无商品信息
        </div>

        <div v-for="store in orderData" :key="store.orderNo" class="mb-6 last:mb-0">
            <!-- 商品列表 -->
            <div class="flex flex-col gap-3">
                <div
                    v-for="(goods, index) in store.items"
                    :key="index"
                    class="flex gap-3 p-3 border border-gray-100 rounded bg-gray-50"
                >
                    <div class="shrink-0">
                        <el-image
                            v-if="goods.goodsMainImageUrl"
                            :src="goods.goodsMainImageUrl"
                            style="width: 80px; height: 80px"
                            fit="cover"
                            class="rounded"
                        />
                        <div
                            v-else
                            class="w-20 h-20 flex items-center justify-center bg-gray-100 rounded text-gray-400 text-xs"
                        >
                            无图
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col justify-between">
                        <!-- 商品名称 -->
                        <div class="font-medium text-gray-800 mb-2 leading-snug break-word">
                            {{ goods.goodsName || '-' }}
                        </div>

                        <!-- 规格信息 -->
                        <div
                            v-if="goods.selectedSpecs && Object.keys(goods.selectedSpecs).length > 0"
                            class="mb-2 text-xs text-gray-600"
                        >
                            <span
                                v-for="(item, idx) in Object.entries(goods.selectedSpecs)"
                                :key="idx"
                            >
                                <span v-if="idx > 0" class="mx-1">/</span>
                                <span class="font-medium">{{ item[0] }}：</span>
                                <span>{{ item[1] }}</span>
                            </span>
                        </div>

                        <!-- 数量和单价 -->
                        <div class="flex gap-6 mb-2">
                            <span class="text-xs text-gray-500">数量：{{ goods.quantity || 0 }}</span>
                            <span class="text-xs text-gray-500">
                                单价：<span class="text-rose-500 font-bold">{{
                                    formatPrice(goods.goodsPrice)
                                }}</span>
                            </span>
                        </div>

                        <!-- 小计 -->
                        <div class="text-xs text-gray-500 text-right">
                            小计：<span class="text-rose-500 font-bold">{{
                                formatPrice(goods.totalPrice)
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { OrderStoreItem } from '@/api/order'
    import { formatPrice } from '@/utils/money'

    defineProps<{
        orderData: OrderStoreItem[]
    }>()
</script>

<style scoped>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #e5e7eb;
        border-radius: 2px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background-color: transparent;
    }
</style>
