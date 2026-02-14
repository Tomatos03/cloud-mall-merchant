<template>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
    <StatisticCard v-for="card in summaryCards" :key="card.label" :card="card" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatisticCard from './StatisticCard.vue'
import {
  Money,
  ShoppingCart,
  TrendCharts
} from '@element-plus/icons-vue'
import type { DashboardOverview } from '@/api/statistics'

interface Props {
  summaryData: DashboardOverview | null
}

const props = defineProps<Props>()

const summaryCards = computed(() => [
  {
    label: '今日营收',
    value: props.summaryData ? (props.summaryData.todayRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
    prefix: '',
    icon: Money,
    bg: '#ecf5ff',
    color: '#409eff'
  },
  {
    label: '今日订单',
    value: props.summaryData ? (props.summaryData.todayOrderCount || 0).toString() : '0',
    prefix: '',
    icon: ShoppingCart,
    bg: '#f0f9eb',
    color: '#67c23a'
  },
  {
    label: '累计营收',
    value: props.summaryData ? (props.summaryData.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
    prefix: '',
    icon: TrendCharts,
    bg: '#fef0f0',
    color: '#f56c6c'
  }
])
</script>

<style scoped></style>
