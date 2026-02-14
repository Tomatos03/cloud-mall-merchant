/**
 * 公共的分类类型定义
 */

import http from '@/utils/http'

const PREFIX = '/category'

export interface CategoryNode {
    id: string
    name: string
    description?: string
    parentId?: string | null
    level?: number | string
    status?: number | boolean
    sort?: number
    children?: CategoryNode[]
}

export interface CategoryPageParams {
    page: number
    pageSize: number
    [key: string]: string | number | undefined
}

export interface CategoryPageResult {
    records: CategoryNode[]
    total: number
    page: number
    pageSize: number
}

export interface CategoryFormData {
    id?: string
    name: string
    status: number
    sort: number
    level?: number | string
    parentId?: string | null
}

/**
 * 获取分类列表（扁平化）
 * RESTful: GET /common/list
 */
export function getCategoryList() {
    return http.get<CategoryNode[]>(`${PREFIX}/list`)
}

/**
 * 获取分类树（用于级联选择）
 * RESTful: GET /common/tree
 */
export function getCategoryTree() {
    return http.get<CategoryNode[]>(`${PREFIX}/tree`)
}
