import { http } from '@/utils/http'
import type { AuditPageParams, AuditPageResult } from '../common/audit'

/**
 * 分页查询审核记录
 */
export function fetchAuditPage(params: AuditPageParams) {
    return http.post<AuditPageResult>('/admin/audit/page', params)
}

/**
 * 提交审核结果
 * @param auditId 审核记录ID
 * @param approved 审核结果: true-通过, false-拒绝
 * @param reason 审核备注/原因
 */
export function submitAudit(auditId: string, approved: boolean, reason?: string) {
    return http.post('/admin/audit/goods/decision', { auditId, approved, reason })
}
