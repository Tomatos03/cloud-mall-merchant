<template>
  <div :class="gridColsClass">
    <StatisticCard v-for="card in summaryCards" :key="card.label" :card="card" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatisticCard from './StatisticCard.vue'
import {
  Money,
  ShoppingCart,
  UserFilled,
  TrendCharts
} from '@element-plus/icons-vue'
import type { DashboardOverview } from '@/api/common/statistics'
import { useUserStore } from '@/stores/user'

interface Props {
  summaryData: DashboardOverview | null
}

const props = defineProps<Props>()
const userStore = useUserStore()

const gridColsClass = computed(() => {
  const colCount = summaryCards.value.length
  const baseClass = 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'
  if (colCount === 3) {
    return `${baseClass} lg:grid-cols-3`
  }
  return `${baseClass} lg:grid-cols-4`
})

const summaryCards = computed(() => {
  const cards = [
    {
      label: '今日营收',
      value: props.summaryData ? (props.summaryData.todayRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
      prefix: '¥',
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
    }
  ]

  // 只有管理员才显示今日新增用户
  if (userStore.role === 'ADMIN') {
    cards.push({
      label: '今日新增用户',
      value: props.summaryData ? (props.summaryData.todayNewUserCount || 0).toString() : '0',
      prefix: '',
      icon: UserFilled,
      bg: '#fdf6ec',
      color: '#e6a23c'
    })
  }

  cards.push({
    label: '累计营收',
    value: props.summaryData ? (props.summaryData.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
    prefix: '¥',
    icon: TrendCharts,
    bg: '#fef0f0',
    color: '#f56c6c'
  })

  return cards
})
</script>

<style scoped></style>
