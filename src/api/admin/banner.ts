import { http } from '@/utils/http'

const PREFIX = '/admin'

// Banner 列表项类型（与后端 DTO 保持一致，前端以 string 接收 id 与 goodsId）
export interface BannerItem {
    // 后端 id（Long）在前端保留为 string，便于与后端反序列化器对接
    id: string
    imageUrl: string
    // 关联商品ID（后端为 Long，但前端以 string 接收并保留原始值）
    goodsId: string
    // 关联商品名称（后端必返，便于列表展示）
    goodsName: string
    // 是否被推荐
    isRecommend: boolean
}

// 分页查询参数
export interface BannerPageParams {
    page: number
    pageSize: number
    [key: string]: string | number | undefined
}

// 分页响应结构
export interface BannerPageResult {
    records: BannerItem[]
    total: number
    page: number
    pageSize: number
}

/**
 * 分页查询 Banner 列表
 * @param params 分页参数
 */
export function fetchBannerPage(params: BannerPageParams) {
    return http.get<BannerPageResult>(`${PREFIX}/banner/page`, params)
}

/**
 * 更新 Banner 推荐状态
 * @param id Banner 的 id（string）
 * @param isRecommend boolean（后端反序列化器会处理）
 */
export function updateBannerRecommend(id: string, isRecommend: boolean) {
    return http.post(`${PREFIX}/banner/recommend/${id}/${isRecommend}`)
}

/**
 * 添加轮播图（注意：创建时必须包含 `goodsId`，用于关联已上架商品）
 * @param data 轮播图数据
 */
export function addBanner(data: Partial<BannerItem>) {
    return http.post(`${PREFIX}/banner/add`, data)
}

/**
 * 更新 Banner 信息
 * @param id Banner 的 id
 * @param data 更新数据
 */
export function updateBanner(id: string, data: Partial<BannerItem>) {
    return http.post(`${PREFIX}/banner/update/${id}`, data)
}

/**
 * 批量删除轮播图
 * @param ids 轮播图ID数组（string）
 */
export function batchDeleteBanner(ids: string[]) {
    return http.post(`${PREFIX}/banner/batch/del`, { ids })
}