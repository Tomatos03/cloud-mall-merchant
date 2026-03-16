import { http } from '@/utils/http'
import type { AuditDetail, AuditPageParams, AuditPageResult } from '@/views/audit/types'

const PREFIX = '/audit'

/**
 * 分页查询审核记录
 * POST /merchant/audit/page
 * @param params 查询参数
 * @returns 审核记录分页结果
 */
export function pagetAudit(params: AuditPageParams) {
  return http.get<AuditPageResult>(`${PREFIX}/page`, { ...params })
}

/**
 * 获取审核详情快照
 * GET /merchant/audit/{auditNo}/detail
 * @param auditNo 审核编号
 * @returns 审核对象 JSON 字符串数组
 */
export function getAuditDetail(auditNo: string) {
    return http.get<AuditDetail>(`${PREFIX}/${auditNo}/detail`)
}

/**
 * 撤销审核申请
 * DELETE /merchant/audit/{auditNo}
 * @param auditNo 审核编号
 * @returns 是否撤销成功
 */
export function withdrawAudit(auditNo: string) {
    return http.delete(`${PREFIX}/${auditNo}`)
}
