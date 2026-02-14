import http from '@/utils/http'
import type { GoodsSkuItem, GoodsSpecification } from './goods'

const PREFIX = '/audit'

export enum AuditStatus {
    PENDING = 'PENDING', // 待审核
    APPROVED = 'APPROVED', // 通过
    REJECTED = 'REJECTED', // 拒绝
    REVOKED = 'REVOKED', // 已撤销
    REAUDIT = 'REAUDIT', // 需重新审核
}

export enum TargetType {
    GOODS = 'GOODS', // 商品
    SKU = 'SKU', // SKU
    OTHER = 'OTHER', // 其他
}

export function isValidAuditStatus(value: string): value is AuditStatus {
    return Object.values(AuditStatus).includes(value as AuditStatus)
}


export interface AuditLabel {
  label: string
  type: string
}

export const AuditStatusMap: Record<AuditStatus, AuditLabel> = {
    [AuditStatus.PENDING]: { label: '待审核', type: 'warning' },
    [AuditStatus.APPROVED]: { label: '通过', type: 'success' },
    [AuditStatus.REJECTED]: { label: '拒绝', type: 'danger' },
    [AuditStatus.REVOKED]: { label: '已撤销', type: 'info' },
    [AuditStatus.REAUDIT]: { label: '需重新审核', type: 'warning' },
} as const

/**
 * 审核记录 VO 定义
 */
export interface AuditLogVO {
    /**
     * 审核记录ID
     */
    auditId: string
    /**
     * 被审核对象类型: GOODS / SKU / OTHER
     */
    targetType: TargetType
    /**
     * 被审核对象ID
     */
    targetId: string
    /**
     * 审核状态: PENDING-待审核, APPROVED-通过, REJECTED-拒绝, REVOKED-已撤销
     */
    status: AuditStatus
    /**
     * 审核状态名称
     */
    statusName?: string
    /**
     * 审核备注/拒绝原因
     */
    reason?: string
    /**
     * 申请人ID
     */
    applicantId?: string
    /**
     * 申请人姓名
     */
    applicantName: string
    /**
     * 审核人ID
     */
    auditorId?: string
    /**
     * 审核人姓名
     */
    auditorName?: string
    /**
     * 扩展信息: 存储商品数据的JSON字符串
     */
    extraInfo: string
    /**
     * 申请时间
     */
    createTime: string
    /**
     * 审核时间
     */
    auditTime?: string
}

export interface AuditGoodsListItem {
    auditId: string
    goodsName: string
    mainImgUrl: string
    createTime: string
    auditStatus: AuditStatus
    sellPoint?: string
    storeName?: string
}

/**
 * 商品审核详情（统一数据结构）
 * 包含所有可能的字段，管理员和商家视图各取所需
 */
export interface GoodsAuditDetail {
    auditId: string
    goodsName: string
    sellPoint: string
    displayImageUrls: string[]
    descriptionImageUrls: string[]
    specifications: GoodsSpecification[]
    auditStatus: AuditStatus
    reason?: string
    applicantName: string
    auditorName?: string
    createTime: string
    auditTime?: string
    // 商家视角额外字段（可选）
    categoryId?: string
    categoryPath?: string
    unitName?: string
    storeId?: string
    skus?: GoodsSkuItem[]
}

/**
 * 审核查询参数
 */
export interface AuditPageParams {
    page: number
    pageSize: number
    status?: AuditStatus
    targetType?: string
    applicantId?: string
    [key: string]: string | number | boolean | undefined
}

/**
 * 审核响应结构
 */
export interface AuditPageResult {
    records: AuditLogVO[]
    total: number
    size: number
    current: number
}

/**
 * 分页查询审核记录
 * @param params 查询参数
 */
export function fetchAuditPage(params: AuditPageParams) {
    return http.get<AuditPageResult>(PREFIX, { params })
}

/**
 * 商家撤销审核申请
 * @param auditId 审核ID
 */
export function withdrawAudit(auditId: string) {
    return http.put(`${PREFIX}/${auditId}/withdraw`, {})
}

/**
 * 管理员提交审核结果
 * @param auditId 审核ID
 * @param approved 是否通过
 * @param reason 拒绝原因（审核不通过时必填）
 */
export function submitAudit(auditId: string, approved: boolean, reason?: string) {
    const data = approved ? { approved: true } : { approved: false, reason }
    return http.put(`${PREFIX}/${auditId}`, data)
}
