/**
 * 公共的商品类型定义
 */

export type GoodsId = string
export type CategoryId = string
export type StoreId = string

/**
 * 商品状态：1-上架/启用，0-下架/禁用
 */
export type GoodsStatus = 1 | 0

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
  status: GoodsStatus
}

// Goods 列表项类型（使用后端原始字段名）
export interface GoodsItem {
    id: string
    name: string
    price?: number
    // 后端字段为 inventory
    inventory?: number
    category?: string
    categoryId?: CategoryId | null
    storeId: string
    storeName: string
    info?: string
    // 后端字段为 img（首图）或 imgList
    img?: string
    imgList?: string
    // 商品详情介绍图列表
    detailImages?: string
    unit?: string
    // 后端字段为 status（是否上架），前端使用 boolean
    status?: boolean | GoodsStatus
    // 商品规格和SKU信息
    specifications?: GoodsSpecification[]
    skus?: GoodsSkuItem[]
    [key: string]: string | number | boolean | null | undefined | GoodsSpecification[] | GoodsSkuItem[] | unknown
}

export interface GoodsInitialValues {
    id?: GoodsId
    name?: string
    price?: number
    inventory?: number
    categoryId?: CategoryId | null
    storeId: StoreId
    storeName: string
    info?: string
    img?: string
    imgList?: string
    detailImages?: string
    unit?: string
    status?: boolean | number | string
    specifications?: GoodsSpecification[]
    skus?: GoodsSkuItem[]
    [k: string]: unknown
}

export interface GoodsSubmitPayload {
    id?: GoodsId
    name: string
    price?: number
    inventory?: number
    categoryId: CategoryId | null
    storeId: StoreId
    info: string
    img: string
    imgList?: string
    detailImages?: string
    unit: string
    status: GoodsStatus
    specifications?: GoodsSpecification[]
    skus?: GoodsSkuItem[]
}

// 分页查询参数
export interface GoodsPageParams {
    page: number
    pageSize: number
    // 支持 string | number | boolean | undefined 以兼容 status 等筛选条件
    [key: string]: string | number | boolean | undefined
}

// 分页响应结构
export interface GoodsPageResult {
    records: GoodsItem[]
    total: number
    page: number
    pageSize: number
}

// 商品单位类型定义
export interface GoodsUnit {
    id: string
    name: string
    status?: number | boolean
    sort?: number
}

export type GoodsUnitId = string
