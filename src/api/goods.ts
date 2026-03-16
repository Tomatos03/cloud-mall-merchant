import type { FileMeta, PageResult } from './common'
import { imagesToUrls } from '@/utils/image'
import { http } from '@/utils/http'

const PREFIX = '/goods'

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
    price: string
    inventory: number
    status: boolean
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
    // 商品展示图, 第一张是主图
    displayImageUrls: string[]
    // 最低价格(单位:元，字符串格式)
    minPrice?: string
    // 最高价格(单位:元，字符串格式)
    maxPrice?: string
    // 商品上架状态
    status?: boolean
    // 商品卖点
    sellPoint?: string
    unitId: string
    // 计量单位名称
    unitName?: string
    // 分类ID路径，数组形式表示 1级、2级、3级分类，例如 [1, 5, 7]
    categoryId: string
    categoryIdPath?: number[]
    // 商品审核状态
    auditStatus?: string
}

/**
 * SKU 分页查询项
 */
export interface GoodsSkuListItem {
    skuId: string
    goodsName: string
    imageUrl?: string
    price: string
    specs: string[]
    inventory?: number
}

export interface GoodsDetail extends GoodsExtraInfo, Omit<GoodsListItem, 'categoryIdPath'> {
    categoryPath: string
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

export interface GoodsExtraInfo {
    descriptionImageUrls?: string[]
    // 商品规格列表
    specifications?: GoodsSpecification[]
    // 商品SKU列表
    skus?: GoodsSkuItem[]
}

/**
 * 商家获取商品的规格和SKU详细信息
 * @param goodsId 商品ID
 * @returns 包含规格和SKU的对象
 */
export function getGoodsSpecsAndSkus(goodsId: string) {
    return http.get<GoodsExtraInfo>(`${PREFIX}/detail/${goodsId}`)
}

/**
 * 更新商品状态
 * @param goodsId 商品ID
 * @param status 状态
 */
export function updateGoodsStatus(goodsId: string, status: boolean) {
    return http.put(`${PREFIX}/${goodsId}/status`, { status })
}

/**
 * 分页查询商品列表
 * @param params 分页查询参数
 */
export function fetchGoodsPage(params: GoodsPageParams) {
    return http.get<PageResult<GoodsListItem>>(PREFIX, { params })
}

/**
 * 分页查询商品 SKU 列表
 * @param params 分页查询参数
 */
export function fetchGoodsSkuPage(params: GoodsPageParams) {
    return http.get<PageResult<GoodsSkuListItem>>(`${PREFIX}/skus`, params)
}

/**
 * 删除商品
 * @param goodsId 商品ID
 */
export function deleteGoods(goodsId: string) {
    return http.delete(`${PREFIX}/${goodsId}`)
}

export interface GoodsFormData {
    goodsId?: string
    goodsName: string
    categoryId: string
    unitId: string
    sellPoint: string
    displayImages: FileMeta[]
    descriptionImages: FileMeta[]
    storeId: string
    status: boolean
    specifications: GoodsSpecification[]
    skus: GoodsSkuItem[]
}

export interface GoodsSubmitPayload
    extends Omit<GoodsFormData, 'displayImages' | 'descriptionImages'> {
    displayImageUrls: string[]
    descriptionImageUrls: string[]
}

export function submitGoods(payload: GoodsFormData) {
    const request: GoodsSubmitPayload = {
        goodsId: payload.goodsId,
        goodsName: payload.goodsName,
        categoryId: payload.categoryId,
        unitId: payload.unitId,
        sellPoint: payload.sellPoint,
        displayImageUrls: imagesToUrls(payload.displayImages),
        descriptionImageUrls: imagesToUrls(payload.descriptionImages),
        storeId: payload.storeId,
        status: payload.status,
        specifications: payload.specifications,
        skus: payload.skus,
    }
    return http.post(`${PREFIX}/publish`, request)
}
