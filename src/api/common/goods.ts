import type { AuditStatus } from './audit'
import type { Image } from './common'

/**
 * SKU 规格单项定义
 */
export interface GoodsSkuSpec {
    name: string
    value: string
}

/**
 * 商品规格项定义
 */
export interface GoodsSpecification {
    name: string
    values: string[]
}

/**
 * 商品 SKU 定义
 */
export interface GoodsSkuItem {
    specs: GoodsSkuSpec[]
    price: number
    inventory: number
    status: boolean
    priceStr?: string
}

/**
 * 用于分页查询接口的响应数据
 */
export interface GoodsListItem {
    // 商品ID
    goodsId: string
    // 商品名称
    goodsName: string
    // 店铺名称
    storeName: string
    // 商品主图
    mainImg: string
    // 最低价格(单位:分)
    minPrice?: number
    // 最高价格(单位:分)
    maxPrice?: number
    // 最低价格字符串
    minPriceStr?: string
    // 最高价格字符串
    maxPriceStr?: string
    // 商品上架状态
    status?: boolean
    // 商品卖点
    sellPoint?: string
    // 计量单位名称
    unitName?: string
    // 分类ID路径，数组形式表示 1级、2级、3级分类，例如 [1, 5, 7]
    categoryIdPath?: number[]
}

export interface GoodsDetail extends GoodsExtraInfo, Omit<GoodsListItem, 'categoryIdPath'> {
    categoryPath: string
}

/**
 * 商品表单初始值
 */
export interface GoodsInitialValues {
    goodsId?: string
    goodsName?: string
    categoryId?: string
    unitId?: string
    unitName?: string
    sellPoint?: string
    descriptionImgList?: string
    mainImg?: string
    imgList?: string
    storeId: string
    storeName: string
    minPrice?: number
    maxPrice?: number
    status?: boolean
    specifications?: GoodsSpecification[]
    skus?: GoodsSkuItem[]
}

/**
 * 商品提交载荷
 */
export interface GoodsSubmitPayload {
    goodsId?: string
    goodsName: string
    categoryId: string
    unitId: string
    sellPoint: string
    descriptionImgList: Image[]
    mainImg: Image
    imgList?: Image[]
    storeId: string
    status: boolean
    specifications: GoodsSpecification[]
    skus: GoodsSkuItem[]
}

/**
 * 分页查询参数
 */
export interface GoodsPageParams {
    page: number
    pageSize: number
    // 支持 string | number | boolean | undefined 以兼容各种筛选条件
    [key: string]: string | number | boolean | undefined
}

/**
 * 分页响应结构
 */
export interface GoodsPageResult {
    records: GoodsListItem[]
    total: number
    page: number
    pageSize: number
}

/**
 * 商品规格和SKU详情对象
 * 用于补充商品列表信息中缺失的规格和SKU数据
 */
export interface GoodsExtraInfo {
    imgList?: string[]
    descriptionImgList?: string[]
    // 商品规格列表
    specifications?: GoodsSpecification[]
    // 商品SKU列表
    skus?: GoodsSkuItem[]
}
