<template>
    <div
        class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md"
    >
        <div class="flex justify-between items-start mb-4">
            <div class="p-3 rounded-xl" :style="{ backgroundColor: card.bg }">
                <el-icon :size="24" :style="{ color: card.color }">
                    <component :is="card.icon" />
                </el-icon>
            </div>
            <div
                v-if="card.trend !== undefined && card.trend !== null"
                :class="[
                    'flex items-center text-sm font-bold',
                    card.trend >= 0 ? 'text-green-500' : 'text-red-500',
                ]"
            >
                {{ card.trend >= 0 ? '+' : '' }}{{ card.trend }}%
                <el-icon class="ml-1">
                    <CaretTop v-if="card.trend >= 0" />
                    <CaretBottom v-else />
                </el-icon>
            </div>
        </div>
        <div class="text-gray-500 text-sm mb-1">{{ card.label }}</div>
        <div class="text-2xl font-bold text-gray-800">{{ card.prefix }}{{ card.value }}</div>
    </div>
</template>

<script setup lang="ts">
    import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

    interface Card {
        label: string
        value: string | number
        prefix: string
        trend?: number | null
        icon: any
        bg: string
        color: string
    }

    withDefaults(
        defineProps<{
            card: Card
        }>(),
        {},
    )
</script>

<style scoped></style>
