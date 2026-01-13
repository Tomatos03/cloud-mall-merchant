import { http } from '@/utils/http'
import type { CategoryItem, Category, CategoryPageParams, CategoryPageResult, CategoryFormData } from '../common/category'

const PREFIX = '/admin'

/**
 * 获取分类树/列表（前端用于渲染树）
 */
export function getCategoryList() {
    return http.get<Category[]>(`${PREFIX}/category/list`)
}

export function getCategoryAllTree() {
    return http.get<Category[]>(`${PREFIX}/category/allTree`)
}

/**
 * 添加分类
 */
export function addCategory(data: CategoryFormData) {
    return http.post(`${PREFIX}/category/add`, data)
}

/**
 * 更新分类（使用 data.id）
 */
export function updateCategory(data: CategoryFormData) {
    const { id, ...rest } = data
    return http.post(`${PREFIX}/category/update/${id}`, rest)
}

/**
 * 删除分类
 */
export function deleteCategory(id: string) {
    return http.post(`${PREFIX}/category/delete/${id}`)
}


// 导出公共类型
export type { CategoryItem, Category, CategoryPageParams, CategoryPageResult, CategoryFormData }
