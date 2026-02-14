import { defineStore } from 'pinia'
import { useCategoryStore } from './category'
import type {
    GoodsSkuItem,
    GoodsSpecification,
    GoodsSubmitPayload,
    GoodsListItem,
    GoodsExtraInfo,
} from '@/api/goods'
import { AuditStatus } from '@/api/audit'
import type { Image } from '@/api/common'
import { useUnitStore } from './unit'
import { useUserStore } from './user'
import { urlsToImages } from '@/utils/image'

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

/**
 * 商品发布状态接口
 *
 * 注意：formData 中的图片字段使用 Image[] 类型（包含 uid、name、url），
 * 这是为了满足前端图片上传组件的需求。
 *
 * 在提交给后端时，会通过工具函数将 Image[] 转换为 string[]（URL 数组），
 * 匹配后端 API 期望的 displayImageUrls 和 descriptionUrls 字段。
 */
export interface GoodsPublishState {
    // 发布表单数据（内部使用 Image[] 对象，提交时转换为 string[]）
    formData: GoodsSubmitPayload
    // 当前活动步骤
    activeStep: PublishStep
    // 是否正在提交
    submitting: boolean
    // 加载状态
    loading: boolean
    // 当前审核记录ID
    currentAuditId?: string
}

/**
 * 商品发布页面专用 Store
 * - 用于管理商品发布流程中的所有状态
 * - 支持刷新时重新加载数据
 * - 提供初始化、重置等操作
 * - 重点：发布成功页（步骤2）不持久化，通过页面初始化检查重置
 *
 * 图片数据处理说明：
 * - 内部存储：使用 Image[] 对象（包含 uid、name、url），满足上传组件需求
 * - 数据加载：后端返回 string[] 时，通过 urlsToImages() 转换为 Image[]
 * - 数据提交：通过 imagesToUrls() 将 Image[] 转换为 string[]，匹配后端接口
 */
export const useGoodsPublishStore = defineStore('goodsPublish', {
    state: (): GoodsPublishState => ({
        formData: {
            goodsName: '',
            status: true,
            displayImages: [],
            descriptionImages: [],
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
        currentAuditId: undefined,
    }),
    getters: {
        /**
         * 是否是编辑模式（有商品ID）
         */
        isEdit: (state): boolean => {
            return !!state.formData.goodsId
        },

        isRepublish: (state): boolean => {
            return !!state.currentAuditId
        },
        descriptionImgList: (state): Image[] => {
            return state.formData.descriptionImages || []
        },
        specifications: (state): GoodsSpecification[] => {
            return state.formData.specifications || []
        },
        skuList: (state): GoodsSkuItem[] => {
            return state.formData.skus || []
        },
        displayImages: (state): Image[] => {
            return state.formData.displayImages || []
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
        setCurrentAuditId(auditId: string) {
            this.currentAuditId = auditId
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
                    displayImages: data.displayImages ?? [],
                    descriptionImages: data.descriptionImages,
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
         */
        setFormDataForRepublish(
            data: {
                auditId: string
                auditStatus: AuditStatus
            } & GoodsSubmitPayload,
        ) {
            this.setCurrentAuditId(data.auditId)
            this.setActiveStep(PublishStep.WRITE_INFO)
            const { auditId, auditStatus, ...payload } = data
            this.setFormData(payload)
        },

        /**
         * 加载编辑时的商品数据
         * @param goodsItem 商品列表项数据
         * @param goodsExtraInfo 从 API 获取的商品规格和 SKU 信息
         */
        loadGoodsForEdit(goodsItem: GoodsListItem, goodsExtraInfo: GoodsExtraInfo) {
            this.loading = true
            try {
                // 组合完整的表单数据，将后端返回的 URL 数组转换为 Image 数组
                this.formData = {
                    goodsId: goodsItem.goodsId,
                    goodsName: goodsItem.goodsName,
                    status: !!goodsItem.status,
                    sellPoint: goodsItem.sellPoint || '',
                    unitId: goodsItem.unitId,
                    categoryId: goodsItem.categoryId,
                    displayImages: urlsToImages(goodsItem.displayImageUrls),
                    descriptionImages: urlsToImages(goodsExtraInfo.descriptionImageUrls),
                    specifications: goodsExtraInfo.specifications ?? [],
                    skus: goodsExtraInfo.skus ?? [],
                    storeId: useUserStore().storeId ?? '',
                }
            } finally {
                this.loading = false
            }
        },

        isFormDataEmpty(): boolean {
            const { formData } = this
            return (
                !formData.goodsName?.trim() &&
                !formData.categoryId &&
                !formData.unitId &&
                !formData.sellPoint?.trim() &&
                (!formData.displayImages || formData.displayImages.length === 0) &&
                (!formData.descriptionImages || formData.descriptionImages.length === 0) &&
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
        setLoading(loading: boolean) {
            this.loading = loading
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
                    this.clearFormData()
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

        clearFormData() {
            this.formData = {
                goodsName: '',
                status: true,
                displayImages: [],
                descriptionImages: [],
                specifications: [],
                skus: [],
                categoryId: '',
                unitId: '',
                sellPoint: '',
                storeId: '',
            }
            this.activeStep = PublishStep.MODEL_SELECT
            this.submitting = false
            this.currentAuditId = undefined
        },
        /**
         * 重置整个发布流程
         */
        resetPublishFlow() {
            this.clearFormData()
            this.setActiveStep(PublishStep.MODEL_SELECT)
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
