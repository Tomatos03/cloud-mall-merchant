/**
 * 审核系统通用类型定义
 */

import type { PageParams, PageResult } from '@/api/common'

// ============ 枚举定义 ============

export enum AuditStatus {
    PENDING = 'PENDING', // 待审核
    APPROVED = 'APPROVED', // 通过
    REJECTED = 'REJECTED', // 拒绝
    REVOKED = 'REVOKED', // 已撤销
}

/**
 * 审核子项状态
 */
export enum AuditItemStatus {
    PENDING = 'PENDING', // 待审核
    APPROVED = 'APPROVED', // 通过
    REJECTED = 'REJECTED', // 拒绝
}

/**
 * 审核业务类型
 */
export enum AuditBizType {
    GOODS = 'GOODS', // 商品
    SECKILL_GOODS = 'SECKILL_GOODS', // 秒杀商品
}

// ============ 类型和接口定义 ============

export interface AuditLabel {
    label: string
    type: string
}

export const AuditStatusMap: Record<AuditStatus, AuditLabel> = {
    [AuditStatus.PENDING]: { label: '待审核', type: 'warning' },
    [AuditStatus.APPROVED]: { label: '通过', type: 'success' },
    [AuditStatus.REJECTED]: { label: '拒绝', type: 'danger' },
    [AuditStatus.REVOKED]: { label: '已撤销', type: 'info' },
} as const

/**
 * 审核子项状态映射
 */
export const AuditItemStatusMap: Record<AuditItemStatus, AuditLabel> = {
    [AuditItemStatus.PENDING]: { label: '待审核', type: 'warning' },
    [AuditItemStatus.APPROVED]: { label: '通过', type: 'success' },
    [AuditItemStatus.REJECTED]: { label: '拒绝', type: 'danger' },
} as const

/**
 * 业务类型映射
 */
export const AuditBizTypeMap: Record<AuditBizType, AuditLabel> = {
    [AuditBizType.GOODS]: { label: '商品', type: 'info' },
    [AuditBizType.SECKILL_GOODS]: { label: '秒杀商品', type: 'warning' },
} as const

export function isValidAuditStatus(value: string): value is AuditStatus {
    return Object.values(AuditStatus).includes(value as AuditStatus)
}

export function isValidAuditItemStatus(value: string): value is AuditItemStatus {
    return Object.values(AuditItemStatus).includes(value as AuditItemStatus)
}

export function isValidAuditBizType(value: string): value is AuditBizType {
    return Object.values(AuditBizType).includes(value as AuditBizType)
}

/**
 * 审核记录 VO 定义
 */
export interface AuditRow {
    /**
     * 审核记录ID
     */
    auditNo: string
    /**
     * 业务类型: 目前支持 GOODS / SECKILL_GOODS
     */
    bizType: AuditBizType
    /**
     * 被审核对象ID
     */
    targetId?: string
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
 * 审核查询参数
 * 继承自通用分页参数
 */
export interface AuditPageParams extends PageParams {
    status?: AuditStatus
    bizType?: AuditBizType
    applicantId?: string
}

/**
 * 审核响应结构
 * 使用通用分页结果类型
 */
export type AuditPageResult = PageResult<AuditRow>
export type AuditSnapshot = string

export interface AuditItem {
    status: AuditItemStatus
    reason?: string
    snapshot: AuditSnapshot
}

export type AuditDetail = AuditItem[]

/**
 * 审核信息（不包含审核对象快照）
 */
export interface AuditInfo {
    auditNo: string
    bizType: AuditBizType
    status: AuditStatus
    applicantId?: string
    applicantName: string
    createTime: string
    auditorId?: string
    auditTime?: string
    auditorName?: string
}

/**
 * 业务渲染器接口
 */
export interface AuditRenderer<T = unknown> {
    /**
     * 解析业务特定数据
     * @param snapshot 单个审核对象快照
     */
    parseSnapshot(snapshot?: AuditSnapshot): T | null

    /**
     * 获取详情显示组件
     */
    getDetailComponent(): unknown
}

export interface AuditRendererProps<T = unknown> {
    data: AuditData<T>[]
}

/**
 * 渲染器注册表类型
 */
export type AuditRendererMap = Record<string, AuditRenderer>

/**
 * 业务特定的审核数据类型
 */
export interface AuditData<T = unknown> {
    status: AuditItemStatus
    reason?: string
    data: T
}
