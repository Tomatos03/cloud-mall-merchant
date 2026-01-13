<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <StatisticCard v-for="card in collectStatCards" :key="card.label" :card="card" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatisticCard from './StatisticCard.vue'
import {
  Collection,
  Delete,
  DataAnalysis,
  SuccessFilled
} from '@element-plus/icons-vue'
import type { CollectSummary } from '@/api/common/statistics'

interface Props {
  collectSummaryData: CollectSummary | null
}

const props = defineProps<Props>()

const collectStatCards = computed(() => [
  {
    label: '今日新增收藏',
    value: props.collectSummaryData ? (props.collectSummaryData.todayFavoriteAdd || 0).toString() : '0',
    prefix: '',
    icon: Collection,
    bg: '#fce7f3',
    color: '#ec4899'
  },
  {
    label: '今日取消收藏',
    value: props.collectSummaryData ? (props.collectSummaryData.todayFavoriteCancel || 0).toString() : '0',
    prefix: '',
    icon: Delete,
    bg: '#fee2e2',
    color: '#ef4444'
  },
  {
    label: '今日净增加',
    value: props.collectSummaryData ? (props.collectSummaryData.todayFavoriteNetIncrease || 0).toString() : '0',
    prefix: '',
    icon: DataAnalysis,
    bg: '#e0e7ff',
    color: '#6366f1'
  },
  {
    label: '累计收藏总数',
    value: props.collectSummaryData ? (props.collectSummaryData.totalFavoriteCount || 0).toLocaleString() : '0',
    prefix: '',
    icon: SuccessFilled,
    bg: '#dcfce7',
    color: '#16a34a'
  }
])
</script>

<style scoped></style>
