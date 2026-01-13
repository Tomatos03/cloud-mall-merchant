import { http } from '@/utils/http'

// Unit 状态枚举
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
