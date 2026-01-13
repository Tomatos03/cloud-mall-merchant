import { defineStore } from 'pinia'
import { useCategoryStore } from './category'
import type { GoodsSubmitPayload } from '@/api/merchant/goods'
import type { GoodsAuditInfo } from '@/views/goods/audit/model/AuditMerchantView.vue'
import type { AuditStatus, GoodsSkuItem, GoodsSpecification, Image } from '@/api/common'
import { useUnitStore } from './unit'
import { th } from 'element-plus/es/locale/index.mjs'

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
            status: true,
            imgList: [],
            descriptionImgList: [],
            specifications: [],
            skus: [],
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
            return state.formData.descriptionImgList
        },
        specifications: (state): GoodsSpecification[] => {
            return state.formData.specifications
        },
        skuList: (state): GoodsSkuItem[] => {
            return state.formData.skus
        },
        displayImages: (state): Image[] => {
            return state.formData.mainImg
        },
    },

    actions: {
        setSpecifications(specs: GoodsSpecification[]) {
            this.formData.specifications = specs
        },
        setSkuList(skus: GoodsSkuItem[]) {
            this.formData.skus = skus
        },
        setDiscriptionImgList(imgList: Image[]) {
            this.formData.descriptionImgList = imgList
        },
        setDisplayImages(imgList: Image[]) {
            this.formData.mainImg = imgList[0]
            this.formData.imgList = [...imgList.slice(1)]
        },
        /**
         * 设置审核驳回的商品数据（用于重新发布）
         * 直接调用 loadAuditDataForRepublish 方法来完整加载审核数据
         */
        setFormDataForRepublish(auditData: GoodsAuditInfo) {
            this.currentAuditId = auditData.auditId
            this.setFormData(auditData)
        },
        /**
         * 设置表单数据
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
         * 设置当前步骤
         */
        setActiveStep(step: PublishStep) {
            this.activeStep = step
        },
        async initBaseData() {
            Promise.all([useCategoryStore().loadCategoryList(), useUnitStore().loadUnitList()])
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
         * 获取提交的完整数据
         * 注意：需要清理多余字段，确保数据结构符合后端要求
         */
        getSubmitPayload(): GoodsSubmitPayload {},

        /**
         * 检查并重置成功状态
         * 供页面初始化时调用，替代无法使用的 afterRestore 钩子
         */
        checkAndResetIfNecessary() {
            if (this.activeStep === PublishStep.SUCCESS) {
                this.resetPublishFlow()
            }
        },
    },

    persist: {
        key: 'goods-publish-persist',
    },
})
