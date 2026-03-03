<template>
    <el-dialog
        v-model="visible"
        title="审核详情"
        width="860px"
        destroy-on-close
        class="audit-detail-v2"
        append-to-body
    >
        <div v-if="data" class="max-h-[75vh] overflow-y-auto custom-scrollbar px-6 py-4">
            <!-- 通用审核信息部分 -->
            <div class="space-y-6 pb-6 mt-1">
                <AuditCommonInfo :data="data" />

                <!-- 业务特定内容部分 -->
                <div class="space-y-6">
                    <component
                        v-if="businessComponent && businessData"
                        :is="businessComponent"
                        :data="businessData"
                        mode="section"
                    />
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import AuditCommonInfo from './AuditCommonInfo.vue'
    import { getAuditRenderer } from './renderers'
    import type { AuditCommonData } from '../types'

    interface Props {
        modelValue: boolean
        data: AuditCommonData
    }

    const props = defineProps<Props>()
    const emit = defineEmits(['update:modelValue'])

    const visible = computed({
        get: () => props.modelValue,
        set: (val) => emit('update:modelValue', val),
    })

    // 获取业务渲染器和数据
    const businessComponent = computed(() => {
        if (!props.data) return null
        const renderer = getAuditRenderer(props.data.targetType)
        return renderer?.getDetailComponent() || null
    })

    const businessData = computed(() => {
        if (!props.data) return null
        const renderer = getAuditRenderer(props.data.targetType)
        if (!renderer) return null
        try {
            return renderer.parseExtraInfo(props.data.snapshot)
        } catch {
            return null
        }
    })
</script>

<style scoped>
    .audit-detail-v2 :deep(.el-dialog) {
        border-radius: 4px;
        overflow: hidden;
    }

    .audit-detail-v2 :deep(.el-dialog__header) {
        margin: 0;
        padding: 20px 24px;
        border-bottom: 1px solid #f1f5f9;
    }

    .audit-detail-v2 :deep(.el-dialog__title) {
        font-weight: 600;
        color: #1e293b;
        font-size: 16px;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
</style>
