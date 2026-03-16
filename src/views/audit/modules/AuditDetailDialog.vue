<template>
    <el-dialog
        v-model="visible"
        title="审核详情"
        width="860px"
        destroy-on-close
        class="audit-detail-v2"
        append-to-body
    >
        <div v-if="auditInfo" class="max-h-[75vh] overflow-y-auto custom-scrollbar px-6 py-4">
            <!-- 通用审核信息部分 -->
            <div class="space-y-6 pb-6 mt-1">
                <AuditCommonInfo :data="auditInfo" />

                <!-- 业务特定内容部分 -->
                <div class="space-y-6">
                    <component
                        v-if="businessComponent && businessData"
                        :is="businessComponent"
                        :data="businessData"
                        mode="section"
                    />
                    <div
                        v-else
                        class="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500"
                    >
                        暂无审核对象数据
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import AuditCommonInfo from './AuditCommonInfo.vue'
    import { getAuditRenderer } from '../renderers'
    import type { AuditInfo, AuditData } from '../types'

    interface Props {
        modelValue: boolean
        auditInfo: AuditInfo | null
        auditData: AuditData[] | null
    }
    const props = defineProps<Props>()
    console.debug('AuditDetailDialog props:', props)

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
    }>()
    const activeObjectKey = ref('0')

    const visible = computed({
        get: () => props.modelValue,
        set: (val) => emit('update:modelValue', val),
    })

    const auditInfo = computed(() => props.auditInfo)

    watch(
        () => props.auditData,
        () => {
            activeObjectKey.value = '0'
        },
    )

    // 获取业务渲染器和数据
    const businessComponent = computed(() => {
        if (!auditInfo.value) return null
        const renderer = getAuditRenderer(auditInfo.value.bizType)
        return renderer?.getDetailComponent() ?? null
    })

    const businessData = computed(() => props.auditData)
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

    .audit-object-tabs {
        margin-bottom: 8px;
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
