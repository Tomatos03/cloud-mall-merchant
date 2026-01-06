<template>
    <div class="capsule-toggle">
        <!-- 滑块背景 -->
        <div
            class="slider"
            :style="{
                transform: `translateX(${activeIndex * 100}%)`,
                width: `${100 / options.length}%`
            }"
        ></div>

        <div
            v-for="(option) in options"
            :key="String(option.value)"
            class="capsule-item"
            :class="{ active: modelValue === option.value }"
            @click="handleClick(option.value)"
        >
            {{ option.label }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Option {
    label: string
    value: string | number | boolean
}

const props = defineProps<{
    modelValue: string | number | boolean
    options: [Option, Option]
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string | number | boolean]
    change: [value: string | number | boolean]
}>()

const activeIndex = computed(() => {
    return props.options.findIndex(opt => opt.value === props.modelValue)
})

const handleClick = (value: string | number | boolean) => {
    if (props.modelValue === value) return
    emit('update:modelValue', value)
    emit('change', value)
}
</script>

<style scoped>
.capsule-toggle {
    position: relative;
    display: inline-flex;
    background-color: #fff;
    border-radius: 4px;
    padding: 2px;
    cursor: pointer;
    user-select: none;
    border: 1px solid #f0f0f0; /* 淡淡的边框 */
    height: 32px;
    box-sizing: border-box;
    align-items: center;
    vertical-align: middle;
    min-width: 120px; /* 保证两个选项有足够宽度 */
}

.slider {
    position: absolute;
    left: 2px;
    top: 2px;
    height: calc(100% - 4px);
    background-color: #409eff;
    border-radius: 2px;
    transition: transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    z-index: 0;
}

.capsule-item {
    position: relative;
    flex: 1;
    padding: 0 16px;
    font-size: 13px;
    height: 100%;
    transition: color 0.3s;
    color: #606266;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}

.capsule-item.active {
    color: #ffffff;
}

.capsule-item:not(.active):hover {
    color: #409eff;
}
</style>
