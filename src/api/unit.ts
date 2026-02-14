import { http } from '@/utils/http'

const PREFIX = '/units'

export enum UnitStatus {
    DISABLED = 0, // 禁用
    ENABLED = 1, // 启用
}

// Unit 项类型
export interface UnitItem {
    id: string
    name: string
    status: UnitStatus
    sort: number
}

export interface Unit extends Omit<UnitItem, 'status' | 'sort'> {}

/**
 * 获取商家的单位列表
 * RESTful: GET /unit/list
 */
export function fetchUnitList() {
    return http.get<UnitItem[]>(`${PREFIX}/list`)
}
