import { http } from '@/utils/http'

const PREFIX = '/store'

/**
 * 商家信息接口定义 - 登录后获取
 * 包含商家用户的基本信息和关联的店铺信息
 */
export interface MerchantInfo {
    uid: string         // 用户ID
    username: string    // 用户名
    nickname: string    // 用户昵称
    role: string        // 用户角色
    storeId: string     // 店铺ID
    storeName: string   // 店铺名称
    avatarUrl?: string  // 用户头像URL
}

/**
 * 店铺信息接口定义
 * 对应后端 StoreItemVO
 */
export interface StoreInfo {
    id: string          // 店铺唯一标识 ID
    name: string        // 店铺名称
    info: string        // 店铺简介/描述
    avatarUrl: string   // 店铺头像 URL
    banner?: string     // 店铺顶部横幜背景图 URL（可选）
}

/**
 * 更新店铺信息的请求载体
 */
export interface UpdateStorePayload {
    name?: string
    info?: string
    avatarUrl?: string
    banner?: string
}

/**
 * 登录认证通过后，获取当前商家信息
 * RESTful: GET /store/merchant/info
 */
export function getMerchantInfo() {
    return http.get<MerchantInfo>(`${PREFIX}/info`)
}

/**
 * 获取当前登录商家的店铺信息
 * RESTful: GET /stores
 */
export function getMyStoreInfo() {
    return http.get<StoreInfo>(`${PREFIX}`)
}

/**
 * 更新店铺信息
 * RESTful: PATCH /stores/:id (部分更新)
 * @param id 店铺ID
 * @param data 更新的数据
 */
export function updateStore(id: string, data: UpdateStorePayload) {
    return http.patch<StoreInfo>(`${PREFIX}/${id}`, data)
}
