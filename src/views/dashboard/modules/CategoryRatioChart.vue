<template>
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6">类目销售占比</h3>
        <div class="h-[350px]">
            <v-chart class="chart" :option="categoryOption" autoresize />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { use } from 'echarts/core'
    import { CanvasRenderer } from 'echarts/renderers'
    import { PieChart } from 'echarts/charts'
    import { TooltipComponent, LegendComponent } from 'echarts/components'
    import VChart from 'vue-echarts'
    import type { CategoryRatio } from '@/api/dashboard'

    use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

    interface Props {
        categoryData: CategoryRatio[]
    }

    const props = defineProps<Props>()

    // 预定义的颜色集合
    const chartColors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FFA07A',
        '#98D8C8',
        '#F7DC6F',
        '#BB8FCE',
        '#85C1E2',
        '#F8B195',
        '#C7CEEA',
    ]

    const categoryOption = computed(() => ({
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                const ratio = (params.value * 100).toFixed(2)
                return `${params.name}<br/>销售占比: ${ratio}%`
            },
        },
        legend: { bottom: '0', left: 'center', icon: 'circle', itemWidth: 8 },
        series: [
            {
                name: '销售占比',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: false },
                data: props.categoryData.map((item, index) => ({
                    value: item.saleRatio,
                    name: item.categoryName,
                    itemStyle: { color: chartColors[index % chartColors.length] },
                })),
            },
        ],
    }))
</script>

<style scoped>
    .chart {
        width: 100%;
        height: 100%;
    }
</style>
