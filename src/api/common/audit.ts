import type { Image } from './common'

export enum AuditStatus {
    PENDING = 0, // 待审核
    APPROVED = 1, // 通过
    REJECTED = 2, // 拒绝
    REVOKED = 3, // 已撤销
}

export function isValidAuditStatus(value: number): value is AuditStatus {
    return Object.values(AuditStatus).includes(value)
}

export const AuditStatusMap: Record<AuditStatus, { label: string; type: string }> = {
    [AuditStatus.PENDING]: { label: '待审核', type: 'warning' },
    [AuditStatus.APPROVED]: { label: '通过', type: 'success' },
    [AuditStatus.REJECTED]: { label: '拒绝', type: 'danger' },
    [AuditStatus.REVOKED]: { label: '已撤销', type: 'info' },
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
    targetType: 'GOODS' | 'SKU' | 'OTHER'
    /**
     * 被审核对象ID
     */
    targetId: string
    /**
     * 审核状态: 0-待审核, 1-通过, 2-拒绝, 3-已撤销
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
    mainImg: Image
    createTime: string
    auditStatus: AuditStatus
    sellPoint?: string
    storeName?: string
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
