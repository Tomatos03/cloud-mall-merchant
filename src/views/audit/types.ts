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
 * 审核业务类型
 * 支持商品、SKU等多种业务类型，目前仅使用 GOODS
 */
export enum AuditTargetType {
    GOODS = 'GOODS', // 商品
    // 后续可扩展其他类型
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
 * 业务类型映射
 */
export const AuditTargetTypeMap: Record<AuditTargetType, AuditLabel> = {
    [AuditTargetType.GOODS]: { label: '商品', type: 'info' },
} as const

export function isValidAuditStatus(value: string): value is AuditStatus {
    return Object.values(AuditStatus).includes(value as AuditStatus)
}

export function isValidAuditTargetType(value: string): value is AuditTargetType {
    return Object.values(AuditTargetType).includes(value as AuditTargetType)
}

/**
 * 审核记录 VO 定义
 */
export interface AuditLogVO {
    /**
     * 审核记录ID
     */
    auditId: string
    /**
     * 被审核对象类型: 目前仅支持 GOODS
     */
    targetType: AuditTargetType
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
    snapshot: string
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
    targetType?: AuditTargetType
    applicantId?: string
}

/**
 * 审核响应结构
 * 使用通用分页结果类型
 */
export type AuditPageResult = PageResult<AuditLogVO>

/**
 * 审核通用数据接口
 */
export interface AuditCommonData extends AuditLogVO {
    auditId: string
    applicantName: string
    createTime: string
    auditTime?: string
    auditorName?: string
    reason?: string
}

/**
 * 审核表格列表行数据（通用部分）
 */
export interface AuditListRow {
    auditId: string
    applicantName: string
    createTime: string
    status: AuditStatus
    targetType: AuditTargetType
}

/**
 * 业务渲染器接口
 */
export interface AuditRenderer {
    /**
     * 解析业务特定数据
     * @param extraInfo JSON字符串
     */
    parseExtraInfo(extraInfo: string): Record<string, unknown>

    /**
     * 获取详情显示组件
     */
    getDetailComponent(): unknown
}

/**
 * 渲染器注册表类型
 */
export type AuditRendererMap = Record<string, AuditRenderer>
