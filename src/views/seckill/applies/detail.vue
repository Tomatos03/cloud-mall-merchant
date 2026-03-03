<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <div
            class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4"
        >
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <el-button text @click="router.back()">
                        <el-icon><ArrowLeft /></el-icon>
                        返回
                    </el-button>
                    <span class="ml-2 text-base font-semibold text-gray-700">申请详情</span>
                </div>
            </div>

            <el-descriptions :column="2" border>
                <el-descriptions-item label="活动名称">{{
                    apply?.activityName
                }}</el-descriptions-item>
                <el-descriptions-item label="申请时间">{{
                    apply?.createTime
                }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                    <el-tag :type="ApplyStatusMap[apply?.status || 0]?.type" effect="dark">
                        {{ ApplyStatusMap[apply?.status || 0]?.label }}
                    </el-tag>
                </el-descriptions-item>
            </el-descriptions>
        </div>

        <div
            class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4"
        >
            <h3 class="text-base font-semibold text-gray-700 mb-4">商品信息</h3>
            <div class="flex items-center gap-4">
                <el-image
                    v-if="apply?.productImage"
                    :src="apply.productImage"
                    class="w-24 h-24 rounded-lg"
                    fit="cover"
                />
                <div>
                    <div class="font-medium text-gray-700 text-lg mb-2">
                        {{ apply?.productName }}
                    </div>
                </div>
            </div>
        </div>

        <div
            class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4"
        >
            <h3 class="text-base font-semibold text-gray-700 mb-4">秒杀设置</h3>
            <el-descriptions :column="2" border>
                <el-descriptions-item label="秒杀价格"
                    >¥{{ apply?.seckillPrice }}</el-descriptions-item
                >
                <el-descriptions-item label="秒杀库存">{{ apply?.stock }}件</el-descriptions-item>
            </el-descriptions>
        </div>

        <div
            v-if="apply?.status === ApplyStatus.REJECTED && apply?.rejectReason"
            class="bg-white rounded-lg border border-red-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4"
        >
            <h3 class="text-base font-semibold text-red-600 mb-4">驳回原因</h3>
            <div class="text-red-600 bg-red-50 p-4 rounded-lg">
                {{ apply.rejectReason }}
            </div>
        </div>

        <div
            v-if="editMode && apply?.status === ApplyStatus.REJECTED"
            class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4"
        >
            <h3 class="text-base font-semibold text-gray-700 mb-4">修改申请</h3>
            <el-form :model="editForm" label-width="80px" :rules="rules" ref="formRef">
                <el-form-item label="秒杀价格" prop="seckillPrice">
                    <el-input
                        v-model="editForm.seckillPrice"
                        placeholder="请输入秒杀价格"
                        style="width: 200px"
                    >
                        <template #prefix>¥</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="秒杀库存" prop="stock">
                    <el-input
                        v-model.number="editForm.stock"
                        placeholder="请输入秒杀库存"
                        style="width: 200px"
                    >
                        <template #append>件</template>
                    </el-input>
                </el-form-item>
            </el-form>
        </div>

        <div class="mt-auto flex justify-between">
            <el-button
                v-if="apply?.status === ApplyStatus.PENDING"
                type="danger"
                @click="handleCancel"
            >
                取消申请
            </el-button>
            <div v-else></div>
            <div class="flex gap-3">
                <el-button @click="router.back()">返回</el-button>
                <el-button
                    v-if="editMode && apply?.status === ApplyStatus.REJECTED"
                    type="primary"
                    :loading="submitting"
                    @click="handleUpdate"
                >
                    提交修改
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { ArrowLeft } from '@element-plus/icons-vue'
    import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
    import {
        fetchApplyDetail,
        updateApply,
        cancelApply,
        ApplyStatus,
        ApplyStatusMap,
    } from '@/api/seckill'

    const route = useRoute()
    const router = useRouter()
    const formRef = ref<FormInstance>()

    const applyId = Number(route.params.id)
    const apply = ref<any>()
    const submitting = ref(false)
    const editMode = computed(() => route.query.edit === '1')

    const editForm = ref({
        seckillPrice: '',
        stock: undefined as number | undefined,
    })

    const rules: FormRules = {
        seckillPrice: [{ required: true, message: '请输入秒杀价格', trigger: 'blur' }],
        stock: [
            { required: true, message: '请输入秒杀库存', trigger: 'blur' },
            { type: 'number', min: 1, message: '库存至少为1', trigger: 'blur' },
        ],
    }

    const loadData = async () => {
        const res = await fetchApplyDetail(applyId)
        apply.value = res.data
        editForm.value = {
            seckillPrice: res.data.seckillPrice,
            stock: res.data.stock,
        }
    }

    const handleCancel = () => {
        ElMessageBox.confirm('确定要取消该申请吗？', '提示', {
            type: 'warning',
        }).then(async () => {
            await cancelApply(applyId)
            ElMessage.success('取消成功')
            router.push('/seckill/applies')
        })
    }

    const handleUpdate = async () => {
        const valid = await formRef.value?.validate().catch(() => false)
        if (!valid) return

        submitting.value = true
        try {
            await updateApply(applyId, {
                seckillPrice: editForm.value.seckillPrice,
                stock: editForm.value.stock,
            })
            ElMessage.success('修改成功')
            router.push('/seckill/applies')
        } finally {
            submitting.value = false
        }
    }

    onMounted(() => {
        loadData()
    })
</script>
