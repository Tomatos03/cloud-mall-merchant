import { http } from '@/utils/http'

export enum TreeNodeType {
    LAYOUT = 'layout',
    MENU = 'menu',
    CATALOG = 'catalog',
}
export type TreeNodeTypeWithoutCatalog = Exclude<TreeNodeType, TreeNodeType.CATALOG>


export interface MenuTreeNode {
    title: string
    name: string
    component: string // 组件存放路径(以view目录为根)
    type: TreeNodeType
    path: string
    icon: string
    redirect?: string
    children?: MenuTreeNode[]
}

const PREFIX = '/system'
export function getMenuTree() {
    return http.get<MenuTreeNode>(`${PREFIX}/menu/tree`)
}
