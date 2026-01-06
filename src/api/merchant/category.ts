import { http } from '@/utils/http'
import type { CategoryItem } from '../common/category'

/**
 * 商家获取分类列表
 */
export function getCategoryList() {
  return http.get<CategoryItem[]>('/merchant/category/list')
}

// 导出类型
export type { CategoryItem }
