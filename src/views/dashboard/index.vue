<template>
    <div class="dashboard-container p-6 bg-[#f4f7fe] h-full overflow-y-auto" v-loading="loading">
        <!-- 顶部核心指标 -->
        <SummaryCards :summary-data="summaryData" />

        <!-- 快捷入口、消息中心与待办事项 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <QuickEntries />
            <RecentMessages
                :chat-sessions="recentChatSessions"
                @message-click="handleMessageClick"
            />
            <TodoList :todos="todos" />
        </div>

        <!-- 销售趋势与分类占比 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div class="lg:col-span-2">
                <SalesTrendChart :trend-data="trendData" @days-change="handleTrendDaysChange" />
            </div>
            <CategoryRatioChart :category-data="categoryData" />
        </div>

        <!-- 排名榜单 -->
        <div class="space-y-6 pb-6">
            <TopProductsTable :top-products="topProductsData" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import SummaryCards from './modules/SummaryCards.vue'
    import QuickEntries from './modules/QuickEntries.vue'
    import RecentMessages from './modules/RecentMessages.vue'
    import TodoList from './modules/TodoList.vue'
    import SalesTrendChart from './modules/SalesTrendChart.vue'
    import CategoryRatioChart from './modules/CategoryRatioChart.vue'
    import TopProductsTable from './modules/TopProductsTable.vue'
    import type {
        DashboardOverview,
        TopProduct,
        CategoryRatio,
        DashboardData,
    } from '@/api/dashboard'
    import { getDashboardData, getSalesTrend } from '@/api/dashboard'
    import { useImStore } from '@/stores/im'

    const router = useRouter()
    const imStore = useImStore()

    // 状态管理
    const loading = ref(false)
    const summaryData = ref<DashboardOverview | null>(null)
    const trendData = ref<Record<string, number>>({})
    const topProductsData = ref<TopProduct[]>([])
    const categoryData = ref<CategoryRatio[]>([])

    // 从 store 获取最近的 5 条聊天会话
    const recentChatSessions = computed(() => {
        return imStore.chatSessions.slice(0, 5)
    })

    // 获取仪表板数据
    const fetchAllData = async () => {
        loading.value = true
        try {
            const res = await getDashboardData()
            const data: DashboardData = res.data

            summaryData.value = data.dashboardOverview
            trendData.value = data.revenueTrend
            topProductsData.value = data.goodsSalesRank
            categoryData.value = data.categorySalesRatio
        } finally {
            loading.value = false
        }
    }

    // 处理趋势天数变化
    const handleTrendDaysChange = async (days: number) => {
        const res = await getSalesTrend(days)
        trendData.value = res.data
    }

    // 静态待办数据
    const todos = ref([
        { id: 1, tag: '待发货', content: '您有 5 个新订单待发货', type: 'warning' },
        { id: 2, tag: '库存预警', content: '3 个商品库存不足 10 件', type: 'danger' },
        { id: 3, tag: '售后', content: '收到 1 个新的退款申请', type: 'info' },
    ])

    const handleMessageClick = async (sessionId: number) => {
        router.push({
            name: 'IM',
        })
        imStore.selectSessionAndMarkRead(sessionId)
    }

    onMounted(async () => {
        await fetchAllData()
        await imStore.fetchChatSessions()
        imStore.initializeIM()
    })
</script>

<style scoped>
    :deep(.el-table) {
        --el-table-border-color: #f0f0f0;
        --el-table-header-bg-color: #fafafa;
        border-radius: 12px;
        overflow: hidden;
    }

    /* 兼容性样式：确保图表能正确填充容器 */
    .chart {
        height: 100%;
        width: 100%;
    }
</style>
