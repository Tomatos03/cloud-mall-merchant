import { http } from '@/utils/http'
import type { PageParams, PageResult } from './common'

const PREFIX = '/seckill'

export enum SeckillActivityStatus {
    APPLYING = 0,
    IN_PROGRESS = 1,
    ENDED = 2,
}

export enum SeckillGoodsAuditStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export const SeckillActivityStatusMap: Record<
    SeckillActivityStatus,
    { label: string; type: string }
> = {
    [SeckillActivityStatus.APPLYING]: { label: '报名中', type: 'primary' },
    [SeckillActivityStatus.IN_PROGRESS]: { label: '进行中', type: 'success' },
    [SeckillActivityStatus.ENDED]: { label: '已结束', type: 'info' },
}

export const SeckillGoodsAuditStatusMap: Record<
    SeckillGoodsAuditStatus,
    { label: string; type: string }
> = {
    [SeckillGoodsAuditStatus.PENDING]: { label: '待审核', type: 'warning' },
    [SeckillGoodsAuditStatus.APPROVED]: { label: '已通过', type: 'success' },
    [SeckillGoodsAuditStatus.REJECTED]: { label: '已驳回', type: 'danger' },
}

export interface SeckillActivityVO {
    id: number
    name: string
    startHour: number
    activityDate: string
    status: SeckillActivityStatus
    maxItems?: number
    createTime: string
    updateTime: string
}

export interface FetchSeckillActivitiesParams extends PageParams {
    name?: string
    status?: SeckillActivityStatus
}

export interface SeckillGoodsAuditItemDTO {
    skuId: string
    seckillPrice: string
    stock: number
}

export interface SeckillGoodsDTO {
    id: number
    auditItemId: number
    status: SeckillGoodsAuditStatus
    seckillPrice: number
    stock: number
    skuId?: string
    goodsName?: string
    mainImageUrl?: string
    skuSpecs?: string[]
}

export type FetchSeckillActivityGoodsParams = PageParams

export function fetchSeckillActivities(params: FetchSeckillActivitiesParams) {
    return http.get<PageResult<SeckillActivityVO>>(`${PREFIX}/activities`, { ...params })
}

export function fetchSeckillActivityDetail(id: number) {
    return http.get<SeckillActivityVO>(`${PREFIX}/activities/${id}`)
}

export function submitSeckillActivityGoods(
    activityId: number,
    items: SeckillGoodsAuditItemDTO[],
) {
    return http.post<void>(`${PREFIX}/activities/${activityId}/goods`, items)
}

export function fetchSeckillActivityGoods(
    activityId: number,
    params: FetchSeckillActivityGoodsParams,
) {
    return http.get<PageResult<SeckillGoodsDTO>>(`${PREFIX}/activities/${activityId}/goods`, {
        ...params,
    })
}
