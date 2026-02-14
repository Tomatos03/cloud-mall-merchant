<template>
    <div class="p-6 bg-[#f4f7fe] h-full overflow-y-auto text-[#2d3748]" v-loading="loading">
        <!-- 顶部核心指标卡片 -->
        <SummaryCards :summary-data="summaryData" />

        <!-- 中间：销售趋势图和分类占比 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div class="lg:col-span-2">
                <SalesTrendChart :trend-data="trendData" @days-change="handleTrendDaysChange" />
            </div>
            <CategoryRatioChart :category-data="categoryData" />
        </div>

        <!-- 商品销量排行 -->
        <div class="mb-6">
            <TopProductsTable
                :top-products="topProductsData"
                @view-report="handleViewProductReport"
            />
        </div>

        <!-- 收藏商品排行 -->
        <div class="mb-6">
            <TopCollectedProductsTable
                :top-collected-products="topCollectedProductsData"
                @view-report="handleViewCollectReport"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue'
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
    } from '@/api/statistics'
    import { getDashboardData, getSalesTrend } from '@/api/statistics'

    // 状态管理
    const loading = ref(false)
    const summaryData = ref<DashboardOverview | null>(null)
    const trendData = ref<Record<string, number>>({})
    const topProductsData = ref<TopProduct[]>([])
    const categoryData = ref<CategoryRatio[]>([])
    const topCollectedProductsData = ref<TopCollectedProduct[]>([])

    // 获取仪表板数据（一次性获取所有数据）
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
        console.log('Sales trend data:', res.data)
    }

    // 查看商品销售完整报表
    const handleViewProductReport = () => {
        console.log('查看商品销售完整报表')
        // TODO: 导航到完整报表页面
    }

    // 查看收藏商品完整报表
    const handleViewCollectReport = () => {
        console.log('查看收藏商品完整报表')
        // TODO: 导航到完整报表页面
    }

    onMounted(() => {
        fetchAllData()
    })
</script>

<style scoped></style>
