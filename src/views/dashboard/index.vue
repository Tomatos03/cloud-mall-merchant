<template>
    <div class="dashboard-container p-6 bg-[#f4f7fe] h-full overflow-y-auto" v-loading="loading">
        <!-- 顶部核心指标 -->
        <SummaryCards :summary-data="summaryData" />

        <!-- 快捷入口、消息中心与待办事项 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- 快捷入口 -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-6">快捷入口</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div
                        class="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                        @click="$router.push('/goods/publish')"
                    >
                        <div
                            class="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl mb-2"
                        >
                            <Plus />
                        </div>
                        <span class="text-sm text-gray-600 font-medium">发布商品</span>
                    </div>
                    <div
                        class="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                        @click="$router.push('/order')"
                    >
                        <div
                            class="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white text-xl mb-2"
                        >
                            <List />
                        </div>
                        <span class="text-sm text-gray-600 font-medium">订单管理</span>
                    </div>
                    <div
                        class="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                        @click="$router.push('/store')"
                    >
                        <div
                            class="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white text-xl mb-2"
                        >
                            <Brush />
                        </div>
                        <span class="text-sm text-gray-600 font-medium">店铺装修</span>
                    </div>
                </div>
            </div>

            <!-- 消息中心 -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-gray-800">最近消息</h3>
                    <el-link type="primary" :underline="false" @click="$router.push('/im')">
                        全部
                    </el-link>
                </div>
                <div class="space-y-4">
                    <div
                        v-for="chatSession in recentChatSessions"
                        :key="chatSession.id"
                        class="flex items-start p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-100"
                        @click="handleMessageClick(chatSession.id)"
                    >
                        <div class="relative mr-3 shrink-0">
                            <el-avatar :size="40" :src="chatSession.avatar || DEFAULT_IMAGE" />
                            <span
                                v-if="chatSession.unreadCount > 0"
                                class="absolute bottom-0 right-0 bg-red-500 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg transform translate-x-1 translate-y-1"
                            >
                                {{ chatSession.unreadCount > 99 ? '99+' : chatSession.unreadCount }}
                            </span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-center mb-1">
                                <span class="font-bold text-gray-800 truncate text-sm">{{
                                    chatSession.name
                                }}</span>
                                <span class="text-xs text-gray-400">{{
                                    chatSession.lastTime
                                }}</span>
                            </div>
                            <p class="text-xs text-gray-500 truncate leading-relaxed">
                                {{ chatSession.lastMessageContent }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 待办事项 -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-6">待办事项</h3>
                <div class="space-y-4">
                    <div
                        v-for="todo in todos"
                        :key="todo.id"
                        class="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                        <div class="flex items-center space-x-3">
                            <span
                                class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                :class="{
                                    'bg-yellow-100 text-yellow-700': todo.type === 'warning',
                                    'bg-red-100 text-red-700': todo.type === 'danger',
                                    'bg-blue-100 text-blue-700': todo.type === 'info',
                                }"
                            >
                                {{ todo.tag }}
                            </span>
                            <span class="text-xs text-gray-700 font-medium">{{
                                todo.content
                            }}</span>
                        </div>
                        <el-button size="small" link type="primary">处理</el-button>
                    </div>
                </div>
            </div>
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
            <TopCollectedProductsTable :top-collected-products="topCollectedProductsData" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { Plus, List, Brush } from '@element-plus/icons-vue'
    import SummaryCards from './modules/SummaryCards.vue'
    import SalesTrendChart from './modules/SalesTrendChart.vue'
    import CategoryRatioChart from './modules/CategoryRatioChart.vue'
    import TopProductsTable from './modules/TopProductsTable.vue'
    import TopCollectedProductsTable from './modules/TopCollectedProductsTable.vue'
    import type {
        DashboardOverview,
        TopProduct,
        CategoryRatio,
        TopCollectedProduct,
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
    const topCollectedProductsData = ref<TopCollectedProduct[]>([])
    const DEFAULT_IMAGE = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

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
            topCollectedProductsData.value = data.goodsFavoriteRank
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
