import { defineStore } from 'pinia'
import { useCategoryStore } from './category'
import type { GoodsAuditInfo } from '@/views/goods/audit/model/AuditMerchantView.vue'
import type {
    AuditStatus,
    GoodsSkuItem,
    GoodsSpecification,
    GoodsSubmitPayload,
    Image,
} from '@/api/common'
import { useUnitStore } from './unit'

/**
 * 商品发布步骤枚举
 */
export enum PublishStep {
    /** 选择发布方式 */
    MODEL_SELECT = 0,
    /** 商品信息填写 */
    WRITE_INFO = 1,
    /** 发布成功 */
    SUCCESS = 2,
}

export type PublishStepIndex = PublishStep

export interface GoodsPublishState {
    // 发布表单数据
    formData: GoodsSubmitPayload
    // 当前活动步骤
    activeStep: PublishStep
    // 是否正在提交
    submitting: boolean
    // 是否只读模式
    currentGoodsId?: string
    // 加载状态
    loading: boolean
    // 当前审核记录ID
    currentAuditId?: string
    currentAuditStatus?: AuditStatus
}

const DEFAULT_MAIN_IMAGE: Image = {
    url: '',
    uid: -1,
    name: '',
}

/**
 * 商品发布页面专用 Store
 * - 用于管理商品发布流程中的所有状态
 * - 支持刷新时重新加载数据
 * - 提供初始化、重置等操作
 * - 重点：发布成功页（步骤2）不持久化，通过页面初始化检查重置
 */
export const useGoodsPublishStore = defineStore('goodsPublish', {
    state: (): GoodsPublishState => ({
        formData: {
            goodsName: '',
            status: true,
            mainImg: DEFAULT_MAIN_IMAGE,
            imgList: [],
            descriptionImgList: [],
            specifications: [],
            skus: [],
            categoryId: '',
            unitId: '',
            sellPoint: '',
            storeId: '',
        },
        activeStep: PublishStep.MODEL_SELECT,
        submitting: false,
        loading: false,
    }),

    getters: {
        /**
         * 是否是编辑模式（有商品ID）
         */
        isEdit: (state): boolean => {
            return !!state.currentGoodsId
        },

        isRepublish: (state): boolean => {
            return !!state.currentAuditId
        },
        descriptionImgList: (state): Image[] => {
            return state.formData.descriptionImgList || []
        },
        specifications: (state): GoodsSpecification[] => {
            return state.formData.specifications || []
        },
        skuList: (state): GoodsSkuItem[] => {
            return state.formData.skus || []
        },
        displayImages: (state): Image[] => {
            const images: Image[] = []
            // 如果mainImg存在且有url，添加为第一张
            if (state.formData.mainImg?.url) {
                images.push(state.formData.mainImg)
            }
            // 添加其他展示图
            if (state.formData.imgList && state.formData.imgList.length > 0) {
                images.push(...state.formData.imgList)
            }
            return images
        },
    },

    actions: {
        /**
         * 统一的表单数据更新方法
         * 替代之前的多个单独 setter（setSpecifications, setSkuList 等）
         * @param data 要更新的表单数据（支持部分更新）
         */
        updateFormData(data: Partial<GoodsSubmitPayload>) {
            this.formData = {
                ...this.formData,
                ...data,
            }
        },

        /**
         * 设置表单数据（用于初始化或完全替换）
         */
        setFormData(data: GoodsSubmitPayload) {
            this.loading = true
            try {
                this.formData = {
                    goodsId: data.goodsId,
                    goodsName: data.goodsName,
                    categoryId: data.categoryId,
                    unitId: data.unitId,
                    status: !!data.status,
                    sellPoint: data.sellPoint,
                    mainImg: data.mainImg,
                    imgList: data.imgList ?? [],
                    descriptionImgList: data.descriptionImgList,
                    storeId: data.storeId,
                    specifications: data.specifications ?? [],
                    skus: data.skus ?? [],
                }
            } finally {
                this.loading = false
            }
        },

        /**
         * 设置审核驳回的商品数据（用于重新发布）
         * 直接调用 setFormData 方法来完整加载审核数据
         */
        setFormDataForRepublish(auditData: GoodsAuditInfo) {
            this.currentAuditId = auditData.auditId
            this.setFormData(auditData)
        },

        isFormDataEmpty(): boolean {
            const { formData } = this
            return (
                !formData.goodsName?.trim() &&
                !formData.categoryId &&
                !formData.unitId &&
                !formData.sellPoint?.trim() &&
                !formData.mainImg?.url &&
                (!formData.imgList || formData.imgList.length === 0) &&
                (!formData.descriptionImgList || formData.descriptionImgList.length === 0) &&
                (!formData.specifications || formData.specifications.length === 0) &&
                (!formData.skus || formData.skus.length === 0)
            )
        },
        /**
         * 设置当前步骤
         */
        setActiveStep(step: PublishStep) {
            this.activeStep = step
        },
        ensureLoadBaseData() {
            this.initBaseData()
        },
        async initBaseData() {
            await Promise.all([
                useCategoryStore().loadCategoryTree(),
                useUnitStore().loadUnitList(),
            ])
        },

        /**
         * 切换到下一个步骤
         */
        nextStep(): void {
            switch (this.activeStep) {
                case PublishStep.MODEL_SELECT:
                    break
                case PublishStep.WRITE_INFO:
                    this.initBaseData()
                    break
                case PublishStep.SUCCESS:
                    break
            }
            const STEP_NUM = Object.keys(PublishStep).length / 2
            this.activeStep = (this.activeStep + 1) % STEP_NUM
        },

        /**
         * 设置提交状态
         */
        setSubmitting(submitting: boolean) {
            this.submitting = submitting
        },

        /**
         * 重置整个发布流程
         */
        resetPublishFlow() {
            this.$reset()
        },

        /**
         * 检查并重置成功状态
         * 供页面初始化时调用，替代无法使用的 afterRestore 钩子
         */
        checkAndResetIfNecessary() {
            if (
                this.activeStep === PublishStep.SUCCESS ||
                (this.activeStep === PublishStep.WRITE_INFO && this.isFormDataEmpty())
            ) {
                this.resetPublishFlow()
                this.setActiveStep(PublishStep.MODEL_SELECT)
            }
        },
    },

    persist: {
        key: 'goods-publish-persist',
    },
})
