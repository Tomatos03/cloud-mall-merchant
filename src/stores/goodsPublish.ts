import { defineStore } from 'pinia'
import { getMerchantApi } from '@/api/client'
import type {
  GoodsPublishPayload,
  FileItem,
  GoodsUnit,
} from '@/api/merchant/goods'
import type { CategoryItem } from '@/api/common/category'
import type { GoodsSpecification, GoodsSkuItem } from '@/api/common/goods'

export interface GoodsPublishState {
  // 发布表单数据
  formData: GoodsPublishPayload
  // 展示图列表
  displayImages: FileItem[]
  // 详情图列表
  detailImages: FileItem[]
  // 商品规格
  specifications: GoodsSpecification[]
  // SKU列表
  skuList: GoodsSkuItem[]
  // 分类列表
  categoryList: CategoryItem[]
  // 单位列表
  unitList: GoodsUnit[]
  // 当前活动步骤
  activeStep: number
  // 是否正在提交
  submitting: boolean
  // 是否只读模式
  isReadonly: boolean
  // 当前编辑的商品ID
  currentGoodsId: string | undefined
  // 加载状态
  loading: boolean
  // 是否已初始化基础数据
  baseDataLoaded: boolean
}

/**
 * 商品发布页面专用 Store
 * - 用于管理商品发布流程中的所有状态
 * - 支持刷新时重新加载数据
 * - 提供初始化、重置等操作
 */
export const useGoodsPublishStore = defineStore('goodsPublish', {
  state: (): GoodsPublishState => ({
    formData: {
      name: '',
      categoryId: '',
      unit: '件',
      status: 1,
      info: '',
      img: '',
      imgList: '',
      detailImages: '',
      specifications: [],
      skus: [],
      storeId: '',
      storeName: '',
    },
    displayImages: [],
    detailImages: [],
    specifications: [{ name: '', values: [] }],
    skuList: [],
    categoryList: [],
    unitList: [],
    activeStep: 0,
    submitting: false,
    isReadonly: false,
    currentGoodsId: undefined,
    loading: false,
    baseDataLoaded: false,
  }),

  getters: {
    /**
     * 检查表单是否有效
     */
    isFormValid: (state) => {
      return (
        state.formData.name
 &&
        state.formData.categoryId &&
        state.formData.unit &&
        state.displayImages.length > 0
      )
    },

    /**
     * 检查规格是否有效
     */
    hasValidSpec: (state) => {
      return state.specifications.some((s) => s.name && s.values.length > 0)
    },

    /**
     * 获取有效的规格（过滤空的规格）
     */
    validSpecifications: (state) => {
      return state.specifications.filter((s) => s.name && s.values.length > 0)
    },
  },

  actions: {
    /**
     * 初始化基础数据（分类、单位等）
     */
    async initBaseData() {
      if (this.baseDataLoaded) return

      this.loading = true
      try {
        const api = getMerchantApi()
        const [categoryRes, unitRes] = await Promise.all([
          api.getCategoryTree(),
          api.getGoodsUnitList(),
        ])

        this.categoryList = categoryRes.data || []
        this.unitList = unitRes.data || []
        this.baseDataLoaded = true
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载商品数据（编辑模式）
     */
    async loadGoodsData(goodsId: string) {
      this.loading = true
      try {

        const api = getMerchantApi()
        const res = await api.getGoodsById(goodsId)
        const data = res.data

        // 设置表单数据
        this.formData = {
          id: data.id,
          name: data.name || '',
          categoryId: data.categoryId || '',
          unit: data.unit || '件',
          status: data.status ? 1 : 0,
          info: data.info || '',
          img: data.img || '',
          imgList: data.imgList || '',
          detailImages: data.detailImages || '',
          storeId: data.storeId || '',
          storeName: data.storeName || '',
          specifications: [],
          skus: [],
        }

        // 处理展示图
        const displayList: FileItem[] = []
        if (data.img) {
          displayList.push({
            name: 'main-image',
            url: data.img,
            rawUrl: data.img,
            uid: Date.now(),
          })
        }
        if (data.imgList && typeof data.imgList === 'string') {
          data.imgList.split(',').forEach((url, index) => {
            displayList.push({
              name: `display-${index}`,
              url: url,
              rawUrl: url,
              uid: Date.now() + index + 1,
            })
          })
        }
        this.displayImages = displayList

        // 处理详情图
        if (data.detailImages && typeof data.detailImages === 'string') {
          this.detailImages = data.detailImages.split(',').map((url, index) => ({
            name: `detail-${index}`,
            url: url,
            rawUrl: url,
            uid: Date.now() + index + 100,
          }))
        }

        // 处理规格和SKU
        if (Array.isArray(data.specifications)) {
          this.specifications = data.specifications
        }
        if (Array.isArray(data.skus)) {
          this.skuList = data.skus
        }

        this.currentGoodsId = goodsId
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置店铺信息
     */
    setStoreInfo(storeId: string, storeName: string)
 {
      this.formData.storeId = storeId
      this.formData.storeName = storeName
    },

    /**
     * 更新表单数据
     */
    updateFormData(data: Partial<GoodsPublishPayload>) {
      Object.assign(this.formData, data)
    },

    /**
     * 更新展示图列表
     */
    setDisplayImages(images: FileItem[]) {
      this.displayImages = images
    },

    /**
     * 更新详情图列表
     */
    setDetailImages(images: FileItem[]) {
      this.detailImages = images
    },

    /**
     * 更新规格列表
     */
    setSpecifications(specs: GoodsSpecification[]) {
      this.specifications = specs
    },

    /**
     * 更新SKU列表
     */
    setSkuList(skus: GoodsSkuItem[]) {
      this.skuList = skus
    },

    /**
     * 设置当前步骤
     */
    setActiveStep(step: number) {
      this.activeStep = step
    },

    /**
     * 设置提交状态
     */
    setSubmitting(submitting: boolean) {
      this.submitting = submitting
    },

    /**
     * 设置只读模式
     */
    setReadonly(readonly: boolean) {
      this.isReadonly = readonly
    },

    /**
     * 重置整个发布流程
     */
    resetPublishFlow() {
      this.$reset()
      this.baseDataLoaded = false
    },

    /**
     * 重置表单数据（保留基础数据）
     */
    resetFormData(storeId: string, storeName: string) {
      this.formData = {
        name: '',
        categoryId: '',
        unit: '件',
        status: 1,
        info: '',
        img: '',
        imgList: '',
        detailImages: '',
        specifications: [],
        skus: [],
        storeId,
        storeName,
      }
      this.displayImages = []
      this.detailImages = []
      this.specifications = [{ name: '', values: [] }]
      this.skuList = []
      this.activeStep = 0
      this.currentGoodsId = undefined
    },

    /**
     * 获取提交的完整数据
     */
    getSubmitPayload(): GoodsPublishPayload {
      return {
        ...this.formData,
        specifications: this.validSpecifications,
        skus: this.skuList,
      }
    },
  },

  persist: true,
})