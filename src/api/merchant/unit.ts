import http from '@/utils/http'
import type { UnitItem } from '../common/unit'

const PREFIX = 'merchant/units'
/**
 * 获取全部单位列表
 * @returns 单位列表
 */
export function fetchUnitList() {
    return http.get<UnitItem[]>(`${PREFIX}/list`)
}
