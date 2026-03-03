import { http } from '@/utils/http'

const PREFIX = '/merchant/seckill'

export interface SeckillActivity {
    id: number
    name: string
    startHour: number
    activityDate: string
    status: number
    maxItems?: number
    createTime: string
    updateTime: string
}

export interface SeckillActivityItem extends SeckillActivity {
    passedItems: number
    startTime: string
    endTime: string
}

export interface SeckillApply {
    id: number
    activityId: number
    activityName: string
    merchantId: number
    productId: number
    productName: string
    productImage: string
    seckillPrice: string
    stock: number
    status: number
    rejectReason?: string
    createTime: string
    updateTime: string
}

export interface SeckillProduct {
    id: number
    activityId: number
    productId: number
    productName: string
    productImage: string
    seckillPrice: string
    stock: number
    soldCount: number
    merchantId: number
    merchantName: string
}

export interface SeckillStats {
    pv: number
    orderCount: number
    paidCount: number
    gmv: number
    products: SeckillProductStat[]
}

export interface SeckillProductStat {
    productId: number
    productName: string
    productImage: string
    seckillPrice: string
    stock: number
    soldCount: number
    pv: number
    conversionRate: string
}

export interface GoodsSimple {
    goodsId: string
    goodsName: string
    displayImageUrls: string[]
    price: string
    inventory: number
    categoryIdPath: string[]
}

export const ApplyStatus = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
} as const

export const ActivityStatus = {
    APPLYING: 0,
    IN_PROGRESS: 1,
    ENDED: 2,
} as const

export const ApplyStatusMap: Record<number, { label: string; type: string }> = {
    0: { label: '待审核', type: 'warning' },
    1: { label: '已通过', type: 'success' },
    2: { label: '已驳回', type: 'danger' },
}

export const ActivityStatusMap: Record<number, { label: string; type: string }> = {
    0: { label: '报名中', type: 'primary' },
    1: { label: '进行中', type: 'success' },
    2: { label: '已结束', type: 'info' },
}

export function fetchActivityList(params: {
    page: number
    pageSize: number
    name?: string
    status?: number
}) {
    return http.get<{ records: SeckillActivityItem[]; total: number }>(`${PREFIX}/activities`, {
        params,
    })
}

export function fetchActivityDetail(id: number) {
    return http.get<SeckillActivityItem>(`${PREFIX}/activities/${id}`)
}

export function fetchApplyList(params: {
    page: number
    pageSize: number
    status?: number
    activityId?: number
}) {
    return http.get<{ records: SeckillApply[]; total: number }>(`${PREFIX}/applies`, { params })
}

export function fetchApplyDetail(id: number) {
    return http.get<SeckillApply>(`${PREFIX}/applies/${id}`)
}

export function submitApply(data: {
    activityId: number
    productId: number
    seckillPrice: string
    stock: number
}) {
    return http.post(`${PREFIX}/applies`, data)
}

export function updateApply(
    id: number,
    data: {
        seckillPrice?: string
        stock?: number
    },
) {
    return http.put(`${PREFIX}/applies/${id}`, data)
}

export function cancelApply(id: number) {
    return http.delete(`${PREFIX}/applies/${id}`)
}

export function fetchMyGoodsForApply(activityId: number) {
    return http.get<GoodsSimple[]>(`${PREFIX}/my-products`, {
        params: { activityId },
    })
}

export function fetchActivityProducts(activityId: number) {
    return http.get<SeckillProduct[]>(`${PREFIX}/activities/${activityId}/products`)
}

export function fetchActivityStats(activityId: number) {
    return http.get<SeckillStats>(`${PREFIX}/stats/${activityId}`)
}
