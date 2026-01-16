<template>
    <el-dialog
        v-model="visible"
        title="拒绝商品审核申请"
        width="520px"
        append-to-body
        class="audit-dialog"
        @close="resetForm"
    >
        <!-- 商品信息卡片 -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-start gap-4 mb-4">
                <el-image
                    v-if="form.previewImg?.url"
                    :src="form.previewImg.url"
                    class="w-16 h-16 rounded shadow-sm shrink-0"
                    fit="cover"
                />
                <div class="flex-1 overflow-hidden">
                    <div class="font-bold text-gray-800 truncate">{{ form.previewName }}</div>
                    <div class="text-xs text-gray-500 mt-2 line-clamp-2">
                        {{ form.previewSellPoint || '暂无卖点描述' }}
                    </div>
                </div>
            </div>

            <!-- 店铺名称单独一行 -->
            <div class="pt-3 border-t border-gray-200">
                <span class="text-xs text-gray-500">申请店铺：</span>
                <span class="text-sm text-gray-700 font-medium">{{ form.previewStore }}</span>
            </div>
        </div>

        <el-form :model="form" label-position="top">
            <el-form-item label="拒绝原因" required>
                <el-input
                    v-model="form.msg"
                    type="textarea"
                    placeholder="请输入详细的拒绝理由，方便商家修改"
                    :rows="4"
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="flex gap-3 justify-end">
                <el-button @click="visible = false" class="rounded-lg px-6">
                    取消
                </el-button>
                <el-button
                    type="primary"
                    :loading="submitting"
                    @click="handleSubmit"
                    class="rounded-lg px-8"
                >
                    确认拒绝
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, reactive, computed } from 'vue'
    import { ElMessage } from 'element-plus'
    import { getAdminApi } from '@/api/client'
    import type { Image } from '@/api/common/common'

    export interface AuditRejectDialogExposed {
        setData: (
            auditId: string,
            goodsName: string,
            mainImg: Image,
            storeName: string,
            sellPoint?: string,
        ) => void
    }

    interface AuditRejectForm {
        id: string
        msg: string
        previewName: string
        previewImg: Image | null
        previewStore: string
        previewSellPoint: string
    }

    const props = defineProps<{
        modelValue: boolean
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: boolean]
        success: []
    }>()

    const submitting = ref(false)

    const form = reactive<AuditRejectForm>({
        id: '',
        msg: '',
        previewName: '',
        previewImg: null,
        previewStore: '',
        previewSellPoint: '',
    })

    const visible = computed({
        get: () => props.modelValue,
        set: (value: boolean) => emit('update:modelValue', value),
    })

    const resetForm = () => {
        form.id = ''
        form.msg = ''
        form.previewName = ''
        form.previewImg = null
        form.previewStore = ''
        form.previewSellPoint = ''
    }

    const handleSubmit = async () => {
        if (!form.msg.trim()) {
            ElMessage.warning('请填写拒绝原因')
            return
        }

        submitting.value = true
        try {
            await getAdminApi().submitAudit(form.id, false, form.msg)
            ElMessage.success('审核操作已提交')
            visible.value = false
            emit('success')
        } finally {
            submitting.value = false
        }
    }

    // 暴露方法供父组件调用
    defineExpose({
        setData: (
            id: string,
            name: string,
            img: Image,
            storeName: string,
            sellPoint: string = '',
        ) => {
            form.id = id
            form.previewName = name
            form.previewImg = img
            form.previewStore = storeName
            form.previewSellPoint = sellPoint
            visible.value = true
        },
    })
</script>

<style scoped>
    .audit-dialog :deep(.el-dialog) {
        border-radius: 20px;
        overflow: hidden;
    }

    .audit-dialog :deep(.el-dialog__header) {
        border-bottom: 1px solid #f1f5f9;
        padding: 20px 24px;
        margin-right: 0;
    }

    .audit-dialog :deep(.el-dialog__title) {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
    }

    .audit-dialog :deep(.el-dialog__body) {
        padding: 24px;
    }

    .audit-dialog :deep(.el-form-item__label) {
        font-weight: 600;
        color: #475569;
        margin-bottom: 8px;
    }

    .audit-dialog :deep(.el-textarea__inner) {
        border-radius: 12px;
        padding: 12px;
        background-color: #f8fafc;
        border-color: #e2e8f0;
        transition: all 0.2s;
    }

    .audit-dialog :deep(.el-textarea__inner:focus) {
        background-color: white;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>