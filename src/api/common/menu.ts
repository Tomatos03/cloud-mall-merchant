import { http } from '@/utils/http'

// MenuItem 类型枚举：layout（布局组件）、view（视图组件）、parentView（非叶子节点视图，仅作为路由容器）
export type MenuItemType = 'layout' | 'view' | 'parentView'

export interface MenuItem {
  name: string
  path: string
  type: MenuItemType
  routePath: string
  redirect?: string
  children?: MenuItem[]
  meta: {
    title: string
    icon?: string
  }
}

export function fetchMenus(role: string) {
    return http.get<MenuItem[]>(`/menu/${role}`)
}
