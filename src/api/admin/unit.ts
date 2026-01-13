import { http } from '@/utils/http'
import type { UnitItem } from '@/api/common/unit'
import { UnitStatus } from '@/api/common/unit'

const PREFIX = '/admin/units'

// 分页查询参数
export interface UnitPageParams {
    page: number
    pageSize: number
    [key: string]: string | number | undefined
}

// 分页响应结构
export interface UnitPageResult {
    records: UnitItem[]
    total: number
    page: number
    pageSize: number
}

/**
 * 分页查询 Unit 列表
 * @param params 分页参数
 */
export function fetchUnitPage(params: UnitPageParams) {
    return http.get<UnitPageResult>(`${PREFIX}`, params)
}

/**
 * 添加单位
 * @param data 单位数据
 */
export function addUnit(data: Partial<UnitItem>) {
    return http.post<UnitItem>(`${PREFIX}`, data)
}

/**
 * 获取单位详情
 * @param id 单位 id
 */
export function getUnitDetail(id: string) {
    return http.get<UnitItem>(`${PREFIX}/${id}`)
}

/**
 * 更新单位信息
 * @param id 单位 id
 * @param data 更新数据
 */
export function updateUnit(id: string, data: Partial<UnitItem>) {
    return http.put<UnitItem>(`${PREFIX}/${id}`, data)
}

/**
 * 删除单位
 * @param id 单位 id
 */
export function deleteUnit(id: string) {
    return http.delete(`${PREFIX}/${id}`)
}

/**
 * 批量删除单位
 * @param ids 单位 ID 数组
 */
export function batchDeleteUnit(ids: string[]) {
    return http.post(`${PREFIX}/batch/delete`, { ids })
}

/**
 * 更新单位状态
 * @param id 单位 id
 * @param status 状态 (UnitStatus.DISABLED: 禁用，UnitStatus.ENABLED: 启用)
 */
export function updateUnitStatus(id: string, status: UnitStatus) {
    return http.patch<UnitItem>(`${PREFIX}/${id}/status`, { status })
}
