<template>
    <div class="mb-12 relative px-10">
        <div class="absolute top-4 left-14 right-14 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
                class="h-full bg-blue-500 transition-all duration-700 ease-out"
                :style="{ width: `${(activeStep / 2) * 100}%` }"
            ></div>
        </div>

        <div class="relative flex justify-between items-center">
            <div
                v-for="(step, index) in steps"
                :key="index"
                class="flex flex-col items-center gap-3"
            >
                <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 z-10"
                    :class="[
                        activeStep === index
                            ? 'border-blue-600 bg-white text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-110'
                            : activeStep > index
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-200 bg-white text-gray-400',
                    ]"
                >
                    <span v-if="activeStep <= index">{{ index + 1 }}</span>
                    <el-icon v-else size="14"><Check /></el-icon>
                </div>
                <span
                    class="text-[11px] font-bold transition-colors duration-300"
                    :class="activeStep >= index ? 'text-gray-700' : 'text-gray-400'"
                    >{{ step }}</span
                >
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Check } from '@element-plus/icons-vue'

    defineProps<{
        activeStep: number
        steps: string[]
    }>()
</script>
