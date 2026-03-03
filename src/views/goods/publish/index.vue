<template>
    <div class="p-6 bg-[#f4f7fe] min-h-full">
        <div class="max-w-5xl mx-auto">
            <!-- 极简注水进度条 (水管风格) -->
            <StepProgress :activeStep="publishStore.activeStep" :steps="steps" />

            <!-- 步骤内容区域 -->
            <div class="step-content">
                <!-- 第一步：选择发布方式 -->
                <Step1
                    v-if="publishStore.activeStep === PublishStep.MODEL_SELECT"
                    @select="handleSelectType"
                />

                <!-- 第二步：填写详细信息 -->
                <Step2
                    v-else-if="publishStore.activeStep === PublishStep.WRITE_INFO"
                    v-model:formData="publishStore.formData"
                    :categoryTree="categoryStore.categoryTree"
                    :unitList="unitStore.unitList"
                    :submitting="publishStore.submitting"
                    @prev="handlePrev"
                    @submit="submitForm"
                />

                <!-- 第三步：发布完成 -->
                <Step3
                    v-else-if="publishStore.activeStep === PublishStep.SUCCESS"
                    @reset="resetForm"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { PublishStep, useGoodsPublishStore, PublishType } from '@/stores/goodsPublish'
    import { ElMessage } from 'element-plus'
    import Step1 from './modules/Step1.vue'
    import Step2 from './modules/Step2.vue'
    import Step3 from './modules/Step3.vue'
    import StepProgress from './modules/StepProgress.vue'
    import { useUnitStore } from '@/stores/unit'
    import { useUserStore } from '@/stores/user'
    import { submitGoodsAudit, toGoodsAuditRequest } from '@/api/goods'
    import { onMounted } from 'vue'
    import { useCategoryStore } from '@/stores/category'

    const publishStore = useGoodsPublishStore()
    const categoryStore = useCategoryStore()
    const unitStore = useUnitStore()
    const userStore = useUserStore()

    const steps = ['选择发布方式', '填写商品信息', '发布完成']

    const handleSelectType = (type: PublishType) => {
        if (type === PublishType.TEMPLATE) {
            ElMessage.info('模板功能开发中，已为您切换至普通发布')
        }
        publishStore.nextStep()
    }

    const handlePrev = () => {
        publishStore.resetPublishFlow()
    }

    const resetForm = () => {
        publishStore.resetPublishFlow()
    }

    const submitForm = async () => {
        publishStore.setSubmitting(true)
        try {
            if (userStore.storeId == null) {
                throw new Error('商户未关联店铺，无法发布商品')
            }

            publishStore.formData.storeId = userStore.storeId

            const unitName = unitStore.getUnitName(publishStore.formData.unitId)

            const request = toGoodsAuditRequest(publishStore.formData, {
                applicantId: userStore.uid,
                applicantName: userStore.displayName,
                storeName: userStore.storeName,
                unitName,
                auditId: publishStore.currentAuditId,
            })

            await submitGoodsAudit(request)
            publishStore.nextStep()
        } finally {
            publishStore.setSubmitting(false)
        }
    }

    onMounted(() => {
        publishStore.checkAndResetIfNecessary()
    })
</script>

<style scoped>
    .step-content {
        animation: slide-up 0.4s ease-out;
    }

    @keyframes slide-up {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
