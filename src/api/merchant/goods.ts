import { http } from '@/utils/http'
import type {
  GoodsItem,
  GoodsPageParams,
  GoodsPageResult,
  GoodsId,
  CategoryId,
  StoreId,
  GoodsUnit,
  GoodsStatus,
  GoodsSkuSpec,
  GoodsSpecification,
  GoodsSkuItem,
} from '../common/goods'

/**
 * 发布商品所需要的完整信息对象
 */
export interface GoodsPublishPayload {
  id?: GoodsId
  name: string
  categoryId: CategoryId
  unit: string
  status: GoodsStatus
  info: string // 商品简介
  img: string // 商品主图（展示图第一张）
  imgList: string // 商品展示图列表（不包含主图），逗号分隔
  detailImages: string // 商品详情介绍图列表，逗号分隔
  specifications: GoodsSpecification[]
  skus: GoodsSkuItem[]
  storeId: StoreId
  storeName: string
}

/**
 * 本地图片项类型
 */
export interface FileItem {
  name: string
  url: string
  rawUrl: string
  uid: number
}

/**
 * 商家查询商品列表（只能查看自己店铺的商品）
 */
export function fetchGoodsPage(params: GoodsPageParams) {
  return http.get<GoodsPageResult>('/merchant/goods/page', params)
}

/**
 * 商家获取商品详情
 */
export function getGoodsById(id: string) {
  return http.get<GoodsItem>(`/merchant/goods/${id}`)
}

/**
 * 商家添加商品
 */
export function addGoods(data: GoodsPublishPayload) {
  return http.post<void>('/merchant/goods', data)
}

/**
 * 商家更新商品信息
 */
export function updateGoods(data: GoodsPublishPayload) {
  if (!data || data.id === undefined || data.id === null || data.id === '') {
    return Promise.reject(new Error('updateGoods: id is required'))
  }
  return http.put<void>('/merchant/goods', data)
}

/**
 * 商家删除商品
 */
export function deleteGoods(id: string) {
  return http.delete(`/merchant/goods/${id}`)
}

/**
 * 商家更新商品上架状态
 */
export function updateGoodsStatus(id: string, status: GoodsStatus) {
  return http.put<GoodsItem>('/merchant/goods/status', { id, status })
}

/**
 * 获取商品单位列表
 */
export function getGoodsUnitList() {
  return http.get<GoodsUnit[]>('/merchant/goods/units')
}

// 导出公共类型
export type {
  GoodsItem,
  GoodsPageParams,
  GoodsPageResult,
  GoodsId,
  CategoryId,
  StoreId,
  GoodsUnit,
  GoodsStatus,
  GoodsSkuSpec,
  GoodsSpecification,
  GoodsSkuItem,
}