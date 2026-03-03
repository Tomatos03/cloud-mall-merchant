<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <div
            class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4"
        >
            <div class="flex items-center justify-between mb-4">
                <el-button text @click="router.back()">
                    <el-icon><ArrowLeft /></el-icon>
                    返回
                </el-button>
                <el-button
                    v-if="activity?.status === ActivityStatus.APPLYING"
                    type="primary"
                    @click="onApply"
                >
                    申请加入
                </el-button>
            </div>

            <el-descriptions :column="2" border>
                <el-descriptions-item label="活动名称">
                    <span class="font-medium">{{ activity?.name }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="活动状态">
                    <el-tag :type="ActivityStatusMap[activity?.status || 0]?.type" effect="dark">
                        {{ ActivityStatusMap[activity?.status || 0]?.label }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="活动时间">
                    {{ activity?.activityDate }} {{ activity?.startHour }}:00 ~
                    {{ (activity?.startHour || 0) + 1 }}:00
                </el-descriptions-item>
                <el-descriptions-item label="商品数量">
                    {{ activity?.passedItems || 0 }} / {{ activity?.maxItems || '不限' }}
                </el-descriptions-item>
            </el-descriptions>
        </div>

        <div class="flex-1 overflow-hidden">
            <div
                class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 h-full"
            >
                <h3 class="text-base font-semibold text-gray-700 mb-4">秒杀商品</h3>
                <Table
                    :columns="columns"
                    :data="products"
                    height="calc(100% - 40px)"
                    :showId="false"
                    :loading="loading"
                >
                    <template #mainImg="{ row }">
                        <el-image
                            v-if="row.productImage"
                            :src="row.productImage"
                            class="w-12 h-12 rounded-lg"
                            fit="cover"
                        />
                        <span v-else class="text-gray-400 text-xs">无图片</span>
                    </template>

                    <template #productName="{ row }">
                        <span class="font-medium text-gray-700">{{ row.productName }}</span>
                    </template>

                    <template #seckillPrice="{ row }">
                        <span class="text-red-500 font-semibold">¥{{ row.seckillPrice }}</span>
                    </template>

                    <template #stock="{ row }">
                        <span>{{ row.stock }}</span>
                    </template>

                    <template #soldCount="{ row }">
                        <span>{{ row.soldCount }}</span>
                    </template>

                    <template #merchantName="{ row }">
                        <span class="text-gray-500">{{ row.merchantName }}</span>
                    </template>
                </Table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { ArrowLeft } from '@element-plus/icons-vue'
    import Table from '@/components/table/Table.vue'
    import {
        fetchActivityDetail,
        fetchActivityProducts,
        ActivityStatus,
        ActivityStatusMap,
        type SeckillActivityItem,
        type SeckillProduct,
    } from '@/api/seckill'

    const route = useRoute()
    const router = useRouter()

    const activityId = Number(route.params.id)

    const columns = [
        { id: '1', label: '商品图片', key: 'mainImg', width: 80 },
        { id: '2', label: '商品名称', key: 'productName', minWidth: 150 },
        { id: '3', label: '秒杀价', key: 'seckillPrice', width: 100 },
        { id: '4', label: '库存', key: 'stock', width: 80 },
        { id: '5', label: '已售', key: 'soldCount', width: 80 },
        { id: '6', label: '商家', key: 'merchantName', width: 120 },
    ]

    const activity = ref<SeckillActivityItem>()
    const products = ref<SeckillProduct[]>([])
    const loading = ref(false)

    const loadData = async () => {
        loading.value = true
        try {
            const [activityRes, productsRes] = await Promise.all([
                fetchActivityDetail(activityId),
                fetchActivityProducts(activityId),
            ])
            activity.value = activityRes.data
            products.value = productsRes.data || []
        } finally {
            loading.value = false
        }
    }

    const onApply = () => {
        router.push(`/seckill/apply/${activityId}`)
    }

    onMounted(() => {
        loadData()
    })
</script>
