<template>
    <el-dialog
        v-model="visible"
        :title="isAdmin ? '商品审核' : '商品详情预览'"
        width="860px"
        destroy-on-close
        class="audit-detail-v2"
        append-to-body
    >
        <div
            v-if="data"
            v-loading="loading"
            class="max-h-[75vh] overflow-y-auto custom-scrollbar px-6 py-4"
        >
            <!-- 管理员视角组件 -->
            <audit-admin-view v-if="isAdmin" :data="data" />

            <!-- 商家视角组件 -->
            <audit-merchant-view v-else :data="data" @edit="handleEdit" @close="handleClose" />
        </div>

        <template v-if="isAdmin && data?.auditStatus === 0" #footer>
            <div class="flex justify-end gap-2 px-4 py-3">
                <el-button
                    type="danger"
                    plain
                    @click="handleReject"
                    :loading="loading"
                    class="rounded px-6"
                >
                    拒绝驳回
                </el-button>
                <el-button
                    type="primary"
                    @click="handlePass"
                    :loading="loading"
                    class="rounded px-8"
                >
                    审核通过
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { ElMessageBox, ElMessage } from 'element-plus'
    import { getAdminApi } from '@/api/client'
    import AuditAdminView from './AuditAdminView.vue'
    import AuditMerchantView, { type GoodsAuditInfo } from './AuditMerchantView.vue'

    interface Props {
        modelValue: boolean
        data: GoodsAuditInfo
        isAdmin?: boolean
    }

    const props = defineProps<Props>()
    const emit = defineEmits(['update:modelValue', 'success', 'reject'])

    const router = useRouter()

    const visible = computed({
        get: () => props.modelValue,
        set: (val) => emit('update:modelValue', val),
    })

    const loading = ref(false)

    const handleEdit = (goods: GoodsAuditInfo) => {
        visible.value = false
        router.push({
            path: '/goods/publish',
            query: { id: goods.goodsId },
        })
    }

    const handlePass = async () => {
        if (!props.data || !props.isAdmin) return
        await ElMessageBox.confirm(`确认该商品描述合规并准予通过审核吗？`, '核验确认', {
            confirmButtonText: '核验通过',
            cancelButtonText: '取消',
            type: 'success',
            draggable: true,
        })
        loading.value = true
        try {
            await getAdminApi().submitAudit(props.data.auditId, true)
            ElMessage.success('审核已通过')
            visible.value = false
            emit('success')
        } finally {
            loading.value = false
        }
    }

    const handleReject = () => {
        if (!props.data || !props.isAdmin) return
        visible.value = false
        emit('reject', props.data)
    }

    const handleClose = () => {
        visible.value = false
    }
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