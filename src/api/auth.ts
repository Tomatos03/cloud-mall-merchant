import { http } from '@/utils/http'

const PREFIX = '/auth'

/**
 * 用户响应DTO - 只包含通用字段
 */
export interface ResponseDTO {
    token: string
}

/**
 * 登录请求参数
 */
export interface LoginParams {
    username: string
    password: string
}

/**
 * 登录：返回用户响应DTO
 */
export function login(params: LoginParams) {
    return http.post<ResponseDTO>(`${PREFIX}/login`, params)
}
