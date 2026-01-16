import { http } from '@/utils/http'
import type {
    GoodsListItem,
    GoodsPageParams,
    GoodsPageResult,
    GoodsSkuSpec,
    GoodsSpecification,
    GoodsSkuItem,
    GoodsExtraInfo,
    GoodsSubmitPayload,
} from '../common/goods'
import type { UnitItem } from '../common/unit'

/**
 * 商家查询商品列表（只能查看自己店铺的商品）
 */
export function fetchGoodsPage(params: GoodsPageParams) {
    return http.get<GoodsPageResult>('/merchant/goods', params)
}

/**
 * 商家获取商品的规格和SKU详细信息
 * @param goodsId 商品ID
 * @returns 包含规格和SKU的对象
 */
export function getGoodsSpecsAndSkus(goodsId: string) {
    return http.get<GoodsExtraInfo>(`/merchant/goods/detail/${goodsId}`)
}

/**
 * 商家添加商品
 */
export function addGoods(data: GoodsSubmitPayload) {
    return http.post<void>('/merchant/goods', data)
}

/**
 * 商家重新发布审核驳回/撤回的商品
 */
export function republishGoodsFromAudit(auditId: string, data: GoodsSubmitPayload) {
    return http.post<void>(`/merchant/goods/republish/${auditId}`, data)
}

/**
 * 商家删除商品
 */
export function deleteGoods(goodsId: string) {
    return http.delete(`/merchant/goods/${goodsId}`)
}

/**
 * 商家更新商品上架状态
 */
export function updateGoodsStatus(goodsId: string, status: boolean) {
    return http.put<GoodsListItem>('/merchant/goods/status', { goodsId, status })
}

/**
 * 获取商品单位列表
 */
export function getGoodsUnitList() {
    return http.get<UnitItem[]>('/merchant/goods/units')
}

// 导出公共类型
export type {
    GoodsListItem,
    GoodsPageParams,
    GoodsPageResult,
    GoodsSkuSpec,
    GoodsSpecification,
    GoodsSkuItem,
    GoodsExtraInfo as GoodsSpecsAndSkus,
}
