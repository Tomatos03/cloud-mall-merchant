import http from '@/utils/http'
import type { Image } from './common'
import { imagesToUrls } from '@/utils/image'

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
 * 商品提交载荷（用于商品发布页面）
 *
 * 注意：此接口专门用于商品发布页面的内部表单数据结构，
 * 使用 Image[] 类型（包含 uid、name、url）以满足图片上传组件需求。
 *
 * 提交给后端时，需要使用 toGoodsSubmitRequest() 转换为 GoodsSubmitRequest 类型。
 */
export interface GoodsSubmitPayload {
    goodsId?: string
    goodsName: string
    categoryId: string
    unitId: string
    sellPoint: string
    // 展示图列表（前端内部使用 Image 对象，提交时转为 URL 数组）
    displayImages: Image[]
    // 详情描述图列表（前端内部使用 Image 对象，提交时转为 URL 数组）
    descriptionImages: Image[]
    storeId: string
    status: boolean
    specifications: GoodsSpecification[]
    skus: GoodsSkuItem[]
}

/**
 * 商品提交请求（后端接口所需的数据结构）
 *
 * 此接口用于与后端 API 通信，使用 string[] 类型存储图片 URL。
 * 从 GoodsSubmitPayload 转换而来，使用 toGoodsSubmitRequest() 函数。
 */
export interface GoodsSubmitRequest extends Omit<GoodsSubmitPayload, 'displayImages' | 'descriptionImages'> {
    // 展示图 URL 数组（后端接收）
    displayImageUrls: string[]
    // 详情描述图 URL 数组（后端接收）
    descriptionImageUrls: string[]
}

/**
 * 将前端表单数据转换为后端请求数据
 * @param payload 前端表单数据（包含 Image[] 对象）
 * @returns 后端请求数据（包含 string[] URL）
 */
export function toGoodsSubmitRequest(payload: GoodsSubmitPayload): GoodsSubmitRequest {
    return {
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
 * 提交商品
 * @param request 商品提交请求
 */
export function submitGoods(request: GoodsSubmitRequest) {
    return http.post(PREFIX, request)
}

/**
 * 从审核重新发布商品
 * @param auditId 审核ID
 * @param request 商品提交请求
 */
export function republishGoodsFromAudit(auditId: string, request: GoodsSubmitRequest) {
    return http.post(`${PREFIX}/republish`, { auditId, ...request })
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
