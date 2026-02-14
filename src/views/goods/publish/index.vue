<template>
    <div class="p-6 bg-[#f4f7fe] min-h-full">
        <div class="max-w-5xl mx-auto">
            <!-- 极简注水进度条 (水管风格) -->
            <div class="mb-12 relative px-10">
                <!-- 背景连接线 (水管) -->
                <div
                    class="absolute top-4 left-14 right-14 h-1 bg-gray-200 rounded-full overflow-hidden"
                >
                    <!-- 动态注水效果 -->
                    <div
                        class="h-full bg-blue-500 transition-all duration-700 ease-out"
                        :style="{ width: `${(publishStore.activeStep / 2) * 100}%` }"
                    ></div>
                </div>

                <!-- 步骤节点 -->
                <div class="relative flex justify-between items-center">
                    <div
                        v-for="(step, index) in steps"
                        :key="index"
                        class="flex flex-col items-center gap-3"
                    >
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 z-10"
                            :class="[
                                publishStore.activeStep === index
                                    ? 'border-blue-600 bg-white text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-110'
                                    : publishStore.activeStep > index
                                      ? 'border-blue-500 bg-blue-500 text-white'
                                      : 'border-gray-200 bg-white text-gray-400',
                            ]"
                        >
                            <span v-if="publishStore.activeStep <= index">{{ index + 1 }}</span>
                            <el-icon v-else size="14"><Check /></el-icon>
                        </div>
                        <span
                            class="text-[11px] font-bold transition-colors duration-300"
                            :class="
                                publishStore.activeStep >= index ? 'text-gray-700' : 'text-gray-400'
                            "
                            >{{ step }}</span
                        >
                    </div>
                </div>
            </div>

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
    import { PublishStep, useGoodsPublishStore } from '@/stores/goodsPublish'
    import { ElMessage } from 'element-plus'
    import { Check } from '@element-plus/icons-vue'
    import Step1 from './modules/Step1.vue'
    import Step2 from './modules/Step2.vue'
    import Step3 from './modules/Step3.vue'
    import { useCategoryStore } from '@/stores/category'
    import { useUnitStore } from '@/stores/unit'
    import { submitGoods, republishGoodsFromAudit, toGoodsSubmitRequest } from '@/api/goods'
    import { useUserStore } from '@/stores/user'
    import { onMounted } from 'vue'

    const publishStore = useGoodsPublishStore()
    const categoryStore = useCategoryStore()
    const unitStore = useUnitStore()
    const userStore = useUserStore()

    const steps = ['选择发布方式', '填写商品信息', '发布完成']

    const handleSelectType = (type: 'new' | 'template') => {
        if (type === 'template') {
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
            const request = toGoodsSubmitRequest(publishStore.formData)

            if (publishStore.isRepublish) {
                await republishGoodsFromAudit(publishStore.currentAuditId!, request)
            } else {
                await submitGoods(request)
            }
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
