```vue /home/Tomatos/Projects/ZedProjects/cloud-mall-vue/src/views/order/model/OrderGoodsList.vue
<template>
    <div class="max-h-100 overflow-y-auto pr-1 custom-scrollbar">
        <!-- 管理员视角：展示店铺信息和子订单号 -->
        <template v-if="isAdmin">
            <div v-for="store in orderData" :key="store.orderNo" class="mb-6 last:mb-0">
                <!-- 聚合订单场景：展示店铺名称、状态和子订单号 -->
                <div
                    v-if="orderData.length > 1"
                    class="flex items-center justify-between mb-3 pb-1"
                >
                    <div class="flex items-center gap-2">
                        <el-icon class="text-orange-500"><Shop /></el-icon>
                        <span class="font-bold text-sm text-gray-700">{{ store.storeName }}</span>
                        <el-tag size="small" :type="getStatusInfo(store.status).type" class="ml-1">
                            {{ getStatusInfo(store.status).label }}
                        </el-tag>
                    </div>
                    <div class="text-xs text-gray-400 font-mono px-2 py-0.5 rounded">
                        订单号：{{ store.orderNo }}
                    </div>
                </div>
                <!-- 非聚合订单场景：展示店铺名称即可，状态和单号与主订单重复，故隐藏 -->
                <div v-else class="flex items-center gap-2 mb-3 pb-1">
                    <el-icon class="text-orange-500"><Shop /></el-icon>
                    <span class="font-bold text-sm text-gray-700">{{ store.storeName }}</span>
                </div>

                <div class="flex flex-col gap-3">
                    <div
                        v-for="(goods, idx) in store.items"
                        :key="idx"
                        class="flex gap-3 p-3 border border-gray-100 rounded bg-gray-50"
                    >
                        <div class="shrink-0">
                            <el-image
                                v-if="goods.goodsImg"
                                :src="goods.goodsImg"
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
                            <div class="font-medium text-gray-800 mb-2 leading-snug break-word">
                                {{ goods.goodsName || '-' }}
                            </div>
                            <div class="flex gap-6 mb-2">
                                <span class="text-xs text-gray-500"
                                    >数量：{{ goods.quantity || 0 }}</span
                                >
                                <span class="text-xs text-gray-500"
                                    >单价：<span class="text-rose-500 font-bold"
                                        >￥{{ goods.goodsPriceText }}</span
                                    ></span
                                >
                            </div>
                            <div class="text-xs text-gray-500 text-right">
                                小计：<span class="text-rose-500 font-bold"
                                    >￥{{ goods.totalPriceText }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- 商家视角：直接展示商品列表 -->
        <template v-else>
            <div v-for="store in orderData" :key="store.orderNo" class="mb-6 last:mb-0">
                <!-- 聚合订单场景：需要展示子订单状态和单号 -->
                <div
                    v-if="orderData.length > 1"
                    class="flex items-center justify-between mb-3 pb-1"
                >
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">订单状态：</span>
                        <el-tag size="small" :type="getStatusInfo(store.status).type">
                            {{ getStatusInfo(store.status).label }}
                        </el-tag>
                    </div>
                    <div class="text-xs text-gray-400 font-mono px-2 py-0.5 rounded">
                        订单号：{{ store.orderNo }}
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <div
                        v-for="(goods, index) in store.items"
                        :key="index"
                        class="flex gap-3 p-3 border border-gray-100 rounded bg-gray-50"
                    >
                        <div class="shrink-0">
                            <el-image
                                v-if="goods.goodsImg"
                                :src="goods.goodsImg"
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
                            <div class="font-medium text-gray-800 mb-2 leading-snug break-word">
                                {{ goods.goodsName || '-' }}
                            </div>
                            <div class="flex gap-6 mb-2">
                                <span class="text-xs text-gray-500"
                                    >数量：{{ goods.quantity || 0 }}</span
                                >
                                <span class="text-xs text-gray-500"
                                    >单价：<span class="text-rose-500 font-bold"
                                        >￥{{ goods.goodsPriceText }}</span
                                    ></span
                                >
                            </div>
                            <div class="text-xs text-gray-500 text-right">
                                小计：<span class="text-rose-500 font-bold"
                                    >￥{{ goods.totalPriceText }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!orderData || orderData.length === 0" class="text-gray-400 text-center py-4">
                暂无商品信息
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
    import { Shop } from '@element-plus/icons-vue'
    import type { OrderStoreItem, OrderStatus } from '@/api/common/order'
    import { getOrderStatusInfo, OrderType } from '@/api/common/order'

    defineProps<{
        orderData: OrderStoreItem[]
        isAdmin: boolean
    }>()

    /**
     * 获取店铺订单（子订单）的状态信息
     */
    const getStatusInfo = (status: string) => {
        return getOrderStatusInfo(OrderType.SUB, status as OrderStatus)
    }
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
