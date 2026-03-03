import { http } from '@/utils/http'
import type { AuditPageParams, AuditPageResult, AuditLogVO } from '@/views/audit/types'

const PREFIX = '/audit'

/**
 * 分页查询审核记录
 * POST /merchant/audit/page
 * @param params 查询参数
 * @returns 审核记录分页结果
 */
export function fetchAuditPage(params: AuditPageParams) {
    return http.post<AuditPageResult>(`${PREFIX}/page`, params)
}

/**
 * 获取审核详情
 * GET /merchant/audit/{auditId}
 * @param auditId 审核记录ID
 * @returns 审核记录详情
 */
export function getAuditDetail(auditId: string) {
    return http.get<AuditLogVO>(`${PREFIX}/${auditId}`)
}

/**
 * 撤销审核申请
 * DELETE /merchant/audit/{auditId}
 * @param auditId 审核记录ID
 * @returns 是否撤销成功
 */
export function withdrawAudit(auditId: string) {
    return http.delete(`${PREFIX}/${auditId}`)
}
