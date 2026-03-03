<template>
    <!-- Dialog 模式 -->
    <el-dialog
        v-if="mode === 'dialog'"
        v-model="visible"
        title="商品详情"
        width="900px"
        destroy-on-close
        class="goods-detail-dialog"
    >
        <div v-if="data" class="h-150 overflow-y-auto pr-2 space-y-6 pb-6">
            <GoodsDetailContent :data="data" />
        </div>
    </el-dialog>

    <!-- Section 模式 -->
    <section
        v-else-if="mode === 'section'"
        class="bg-white rounded border border-gray-100 p-4 space-y-4"
    >
        <GoodsDetailContent :data="data" />
    </section>
</template>

<script setup lang="ts">
    import { computed, toRefs } from 'vue'
    import type { GoodsDetail } from '@/api/goods'
    import GoodsDetailContent from './GoodsDetailContent.vue'

    interface Props {
        data: GoodsDetail
        modelValue?: boolean
        mode?: 'dialog' | 'section'
    }

    const props = withDefaults(defineProps<Props>(), {
        mode: 'dialog',
    })
    const { modelValue } = toRefs<Props>(props)

    const emit = defineEmits<{
        (e: 'update:modelValue', value: boolean): void
    }>()

    const visible = computed({
        get: () => modelValue?.value ?? false,
        set: (value) => emit('update:modelValue', value),
    })
</script>

<style scoped>
    .goods-detail-dialog :deep(.el-dialog) {
        border-radius: 12px;
        overflow: hidden;
    }

    .goods-detail-dialog :deep(.el-dialog__header) {
        margin-right: 0;
        padding: 20px 24px;
        border-bottom: 1px solid #f1f5f9;
    }

    .goods-detail-dialog :deep(.el-dialog__title) {
        font-weight: 700;
        color: #1e293b;
        font-size: 16px;
    }

    .goods-detail-dialog :deep(.el-dialog__body) {
        padding: 24px;
    }

    .goods-detail-dialog :deep(.el-descriptions__title) {
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
    }

    .goods-detail-dialog :deep(.el-descriptions__label) {
        background-color: #f8fafc;
        color: #64748b;
        font-weight: 500;
        width: 120px;
    }

    .goods-detail-dialog :deep(.el-descriptions__content) {
        color: #334155;
    }
</style>
