import { http } from '@/utils/http'
import type {
    GoodsItem,
    GoodsPageParams,
    GoodsPageResult,
    GoodsInitialValues,
    GoodsInfo,
} from '../common/goods'

/**
 * 管理员查询商品列表（可查看所有商家的商品）
 */
export function fetchGoodsPage(params: GoodsPageParams) {
    return http.get<GoodsPageResult>('/admin/goods', params)
}

/**
 * 管理员获取商品详情
 */
export function getGoodsById(id: string) {
    return http.get<GoodsItem>(`/admin/goods/${id}`)
}

/**
 * 管理员更新商品状态（上架/下架）
 */
export function updateGoodsStatus(id: string, status: boolean) {
    return http.put<GoodsItem>('/admin/goods/status', { id, status })
}

/**
 * 管理员删除商品
 */
export function deleteGoods(id: string) {
    return http.delete(`/admin/goods/${id}`)
}

/**
 * 管理员更新商品信息
 */
/**
 * 管理员审核商品
 * @param id 商品ID
 * @param auditStatus 审核状态：1-通过，2-驳回
 * @param auditMsg 审核意见
 */
export function auditGoods(id: string, auditStatus: 1 | 2, auditMsg?: string) {
    return http.put('/admin/goods/audit', { id, auditStatus, auditMsg })
}

/**
 * 管理员更新商品信息
 */
export function updateGoods(data: Partial<GoodsItem>) {
    if (!data || data.id === undefined || data.id === null || data.id === '') {
        return Promise.reject(new Error('updateGoods: id is required'))
    }
    return http.put<GoodsItem>('/admin/goods', data)
}

// 通用 API 函数（不关联到特定角色）
/**
 * 分页查询 Goods 列表
 * @param params 分页参数
 */
export async function fetchGoodsPageGeneral(params: GoodsPageParams) {
    // 不再进行运行时字段映射，直接返回后端原始字段名
    return http.get<GoodsPageResult>('/goods/page', params)
}

/**
 * 添加商品
 * @param data 商品数据
 */
export function addGoods(data: Omit<GoodsItem, 'id'>) {
    // 直接将前端对象发送给后端，后端负责字段解析
    return http.post<GoodsItem>('/goods', data)
}

/**
 * 更新商品
 * @param data 商品数据（包含 id）
 */
export function updateGoodsGeneral(data: Partial<GoodsItem>) {
    // 确保 id 存在
    if (!data || data.id === undefined || data.id === null || data.id === '') {
        return Promise.reject(new Error('updateGoods: id is required'))
    }
    // 直接发送前端对象，不再进行 toSnake 转换
    return http.put<GoodsItem>('/goods', data)
}

/**
 * 删除商品
 * @param id 商品ID
 */
export function deleteGoodsGeneral(id: string) {
    return http.delete(`/goods/${id}`)
}

/**
 * 更新商品上架状态（使用统一的键名和类型）
 */
export function updateGoodsStatusGeneral(id: string, status: boolean) {
    // 将 id 与 status 一起传入 updateGoods，由 updateGoods 发送完整对象
    return updateGoodsGeneral({ id, status })
}

/**
 * 获取商品详情
 * @param id 商品ID
 */
export async function getGoodsByIdGeneral(id: string) {
    // 直接返回后端原始字段名
    const res = await http.get<GoodsItem>(`/goods/${id}`)
    return res
}

// 导出类型
export type {
    GoodsItem,
    GoodsPageParams,
    GoodsPageResult,
    GoodsInitialValues,
    GoodsInfo as GoodsSubmitPayload,
}
