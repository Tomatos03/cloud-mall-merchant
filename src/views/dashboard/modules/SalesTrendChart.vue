<template>
    <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-800">销售趋势</h3>
            <el-radio-group v-model="selectedDays" size="small">
                <el-radio-button :label="7">近7天</el-radio-button>
                <el-radio-button :label="30">近30天</el-radio-button>
            </el-radio-group>
        </div>
        <div class="h-[350px]">
            <v-chart class="chart" :option="trendOption" autoresize />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import { use } from 'echarts/core'
    import { CanvasRenderer } from 'echarts/renderers'
    import { LineChart } from 'echarts/charts'
    import { GridComponent, TooltipComponent } from 'echarts/components'
    import VChart from 'vue-echarts'

    use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

    interface Props {
        trendData: Record<string, number>
    }

    interface Emits {
        (e: 'days-change', days: number): void
    }

    const props = defineProps<Props>()
    const emit = defineEmits<Emits>()

    const selectedDays = ref(7)

    // 转换后的图表数据
    const chartData = computed(() => {
        if (!props.trendData || Object.keys(props.trendData).length === 0) {
            return []
        }
        const dates = Object.keys(props.trendData).sort()
        return dates.map((date) => ({
            date,
            revenue: props.trendData[date],
        }))
    })

    const trendOption = computed(() => ({
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                if (!Array.isArray(params)) return ''
                const param = params[0]
                return `${param.name}<br/>${param.seriesName}: ¥${param.value.toFixed(2)}`
            },
        },
        grid: { left: '5%', right: '5%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: chartData.value.map((item) => item.date),
            axisLine: { lineStyle: { color: '#eee' } },
            axisLabel: { color: '#999' },
        },
        yAxis: {
            type: 'value',
            name: '营收额（元）',
            nameTextStyle: { color: '#606266', fontSize: 12 },
            splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } },
            axisLabel: {
                formatter: (value: number) => {
                    if (value >= 10000) {
                        return (value / 10000).toFixed(1) + '万'
                    }
                    return value.toFixed(0)
                },
                color: '#999',
            },
        },
        series: [
            {
                name: '营收额',
                type: 'line',
                smooth: true,
                data: chartData.value.map((item) => item.revenue),
                itemStyle: { color: '#409eff' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(64,158,255,0.3)' },
                            { offset: 1, color: 'rgba(64,158,255,0)' },
                        ],
                    },
                },
            },
        ],
    }))

    watch(selectedDays, (newDays) => {
        emit('days-change', newDays)
    })
</script>

<style scoped>
    .chart {
        width: 100%;
        height: 100%;
    }

    :deep(.el-radio-button__inner) {
        border-radius: 8px !important;
        margin: 0 4px;
        border: 1px solid #dcdfe6 !important;
    }
</style>
