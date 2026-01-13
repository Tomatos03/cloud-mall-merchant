import { http } from '@/utils/http'
import type { AuditPageParams, AuditPageResult } from '../common/audit'

/**
 * 商家分页查询自己的审核记录
 */
export function fetchAuditPage(params: AuditPageParams) {
    return http.get<AuditPageResult>('/merchant/audit/page', params)
}

/**
 * 商家撤回审核申请
 * @param id 审核记录ID
 */
export function withdrawAudit(id: string) {
    return http.post(`/merchant/audit/withdraw/${id}`)
}
