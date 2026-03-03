import type { FileMeta } from './common'
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
/**
 * 审核信息
 */
export interface AuditGoodsVO {
    // 审核ID
    auditId?: string
    // 审核状态（待审核、已通过、已拒绝等）
    auditStatus?: string
    // 审核拒绝原因
    auditReason?: string
    // 审核时间
    auditTime?: string
    // 待审核的商品信息（变更待审核时显示）
    pendingGoodsInfo?: {
        displayImageUrls?: string[]
        descriptionImageUrls?: string[]
        goodsName?: string
        sellPoint?: string
        specifications?: GoodsSpecification[]
        skus?: GoodsSkuItem[]
    }
}

export interface GoodsExtraInfo {
    descriptionImageUrls?: string[]
    // 商品规格列表
    specifications?: GoodsSpecification[]
    // 商品SKU列表
    skus?: GoodsSkuItem[]
    // 审核信息
    auditInfo?: AuditGoodsVO
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
    return http.get<GoodsPageResult>(PREFIX, { params })
}

/**
 * 删除商品
 * @param goodsId 商品ID
 */
export function deleteGoods(goodsId: string) {
    return http.delete(`${PREFIX}/${goodsId}`)
}

export interface AuditRequest {
    type: string
    applicantId: string
    applicantName: string
    targetId: string | null
}

export interface GoodsAuditRequest extends AuditRequest {
    goodsId: string | null
    goodsName: string
    categoryId: string
    unitId: string
    unitName: string
    sellPoint: string
    displayImageUrls: string[]
    descriptionImageUrls: string[]
    storeId: string
    storeName: string
    status: boolean
    specifications: GoodsSpecification[]
    skus: GoodsSkuItem[]
    auditId?: string
}

export interface GoodsSubmitPayload {
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

export function toGoodsAuditRequest(
    payload: GoodsSubmitPayload,
    options: {
        applicantId: string
        applicantName: string
        storeName: string
        unitName: string
        auditId?: string
    },
): GoodsAuditRequest {
    return {
        type: 'GOODS',
        applicantId: options.applicantId,
        applicantName: options.applicantName,
        targetId: payload.goodsId || null,
        goodsId: payload.goodsId || null,
        goodsName: payload.goodsName,
        categoryId: payload.categoryId,
        unitId: payload.unitId,
        unitName: options.unitName,
        sellPoint: payload.sellPoint,
        displayImageUrls: imagesToUrls(payload.displayImages),
        descriptionImageUrls: imagesToUrls(payload.descriptionImages),
        storeId: payload.storeId,
        storeName: options.storeName,
        status: payload.status,
        specifications: payload.specifications,
        skus: payload.skus,
        auditId: options.auditId,
    }
}

export function submitGoodsAudit(request: GoodsAuditRequest) {
    return http.post(`${PREFIX}/publish`, request)
}
