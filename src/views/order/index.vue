<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <!-- 搜索筛选区域 -->
        <OrderFilter v-model="selectedStatus" @change="handleStatusChange" @reset="handleReset" />

        <!-- 表格区域 -->
        <div class="flex-1 overflow-hidden">
            <Table :columns="columns" :data="data" height="100%" :showId="false">
                <template #orderNo="{ row }">
                    <span class="font-medium text-gray-700 break-all">{{ row.orderNo }}</span>
                </template>
                <template #orderType="{ row }">
                    <el-tag
                        :type="getOrderTypeTag(row.orderType)"
                        effect="light"
                        class="border-none px-2 rounded-full text-xs"
                    >
                        {{ getOrderTypeLabel(row.orderType) }}
                    </el-tag>
                </template>
                <template #totalPrice="{ row }">
                    <span class="text-rose-500 font-bold">{{ formatPrice(row.totalPrice) }}</span>
                </template>
                <template #buyerName="{ row }">
                    <span class="text-gray-600">{{ row.buyerName }}</span>
                </template>
                <template #phone="{ row }">
                    <span class="text-gray-500 font-mono text-xs">{{ row.phone }}</span>
                </template>
                <template #detailAddress="{ row }">
                    <span class="text-gray-600 text-sm line-clamp-2">{{ row.detailAddress }}</span>
                </template>
                <template #orderStatus="{ row }">
                    <el-tag
                        :type="getOrderStatusInfo(row.orderStatus).type"
                        effect="light"
                        class="border-none px-3 rounded-full"
                    >
                        {{ getOrderStatusInfo(row.orderStatus).label }}
                    </el-tag>
                </template>
                <template #createTime="{ row }">
                    <span class="text-gray-400 text-xs">{{ row.createTime }}</span>
                </template>
                <template #action="{ row }">
                    <el-button link type="primary" size="small" @click="onDetail(row)">
                        详情
                    </el-button>
                    <el-button
                        v-if="row.orderStatus === OrderStatus.CREATED"
                        link
                        type="danger"
                        size="small"
                        @click="onCancel(row)"
                    >
                        取消
                    </el-button>
                    <el-button
                        v-if="row.orderStatus === OrderStatus.PAID"
                        link
                        type="warning"
                        size="small"
                        @click="onShip(row)"
                    >
                        发货
                    </el-button>
                </template>
            </Table>
        </div>

        <!-- 分页区域 -->
        <div class="mt-6 flex justify-end">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                class="custom-pagination"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
        </div>

        <!-- 订单详情对话框 -->
        <OrderDetailDialog v-model="detailDialogVisible" :order="selectedOrder" />
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import Table from '@/components/table/Table.vue'
    import OrderFilter from './modules/OrderFilter.vue'
    import OrderDetailDialog from './modules/OrderDetailDialog.vue'
    import type { OrderItem, OrderPageParams } from '@/api/order'
    import {
        OrderType,
        OrderStatus,
        getOrderTypeLabel,
        getOrderStatusInfo,
        fetchOrderPage,
        cancelOrder,
        shipOrder,
    } from '@/api/order'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { formatPrice } from '@/utils/money'

    const columns = [
        { id: '1', label: '订单号', key: 'orderNo' },
        { id: '2', label: '订单类型', key: 'orderType' },
        { id: '4', label: '总价', key: 'totalPrice' },
        { id: '5', label: '买家', key: 'buyerName' },
        { id: '6', label: '手机', key: 'phone' },
        { id: '7', label: '地址', key: 'detailAddress' },
        { id: '8', label: '状态', key: 'orderStatus' },
        { id: '9', label: '下单时间', key: 'createTime' },
    ]

    const data = ref<OrderItem[]>([])
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const detailDialogVisible = ref(false)
    const selectedOrder = ref<OrderItem | undefined>()
    const selectedStatus = ref<string>('ALL')


    /**
     * 根据订单类型获取标签类型
     */
    const getOrderTypeTag = (orderType: OrderType | string): 'primary' | 'success' | 'warning' => {
        switch (orderType) {
            case OrderType.PARENT:
                return 'success'
            case OrderType.SUB:
                return 'primary'
            case OrderType.NORMAL:
                return 'warning'
            default:
                return 'primary'
        }
    }

    const loadData = async () => {
        const params: OrderPageParams = {
            page: page.value,
            pageSize: pageSize.value,
        }

        if (selectedStatus.value !== 'ALL') {
            params.status = selectedStatus.value
        }

        const res = await fetchOrderPage(params)
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

    const handleStatusChange = () => {
        page.value = 1
        loadData()
    }

    const handleReset = () => {
        selectedStatus.value = 'ALL'
        page.value = 1
        loadData()
    }

    const onDetail = (row: OrderItem) => {
        selectedOrder.value = row
        detailDialogVisible.value = true
    }

    const onCancel = (row: OrderItem) => {
        ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
            type: 'warning',
            confirmButtonClass: 'el-button--danger',
        }).then(async () => {
            await cancelOrder(row.orderNo)
            ElMessage.success('订单已取消')
            loadData()
        })
    }

    const onShip = (row: OrderItem) => {
        ElMessageBox.confirm('确定要发货吗？', '提示', {
            type: 'info',
        }).then(async () => {
            await shipOrder(row.orderNo)
            ElMessage.success('发货成功')
            loadData()
        })
    }

    onMounted(() => {
        loadData()
    })
</script>

<style scoped>
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
        transition: all 0.2s;
    }

    .custom-pagination :deep(.el-pager li.is-active) {
        background-color: #3b82f6 !important;
        border-color: #3b82f6 !important;
        color: white !important;
        box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.2);
    }
</style>