import { useUserStore } from '@/stores/user'
import axios from 'axios'
import type {
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
    AxiosResponse,
} from 'axios'
import { ElMessage } from 'element-plus'

// 响应数据接口
export interface ResponseData<T = unknown> {
    code: number
    message: string
    data: T
}

/**
 * 处理 401 未授权错误
 */
const handleUnauthorized = () => {
    const userStore = useUserStore()
    userStore.clearUser()
    window.location.href = '/login'
}

/**
 * 根据 HTTP 状态码获取错误消息
 * @param status HTTP 状态码
 * @param errorData 错误响应数据
 */
const getHttpErrorMessage = (status: number, errorData?: ResponseData): string => {
    switch (status) {
        case 400:
            return '请求参数错误'
        case 401:
            handleUnauthorized()
            return '未授权，请重新登录'
        case 403:
            return '拒绝访问'
        case 404:
            return '请求资源不存在'
        case 500:
            return '服务器内部错误'
        case 502:
            return '网关错误'
        case 503:
            return '服务不可用'
        case 504:
            return '网关超时'
        default:
            return errorData?.message || `请求失败(${status})`
    }
}

/**
 * 处理响应错误
 * @param error axios 错误对象
 */
const handleResponseError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            // 服务器返回了错误状态码
            return getHttpErrorMessage(error.response.status, error.response.data)
        } else if (error.request) {
            // 请求已发出但没有收到响应
            return '网络连接失败，请检查网络'
        }
    }
    return '请求失败'
}

// 工厂函数：创建带拦截器的 axios 实例
function createAxiosInstantce(baseURL: string): AxiosInstance {
    const instance = axios.create({
        baseURL,
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
    })

    // 请求拦截器
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const userStore = useUserStore()
            const token = userStore.token
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error) => {
            console.error('请求错误：', error)
            return Promise.reject(error)
        },
    )

    // 响应拦截器
    instance.interceptors.response.use(
        (response: AxiosResponse<ResponseData>) => {
            const res = response.data

            if (res.code !== 200 && res.code !== 0) {
                ElMessage.error(res.message || '请求失败')
                throw new Error(res.message || '请求失败')
            }

            return response
        },
        (error) => {
            console.error('响应错误：', error)
            const message = handleResponseError(error)
            ElMessage.error(message)
            return Promise.reject(error)
        },
    )

    return instance
}

// HTTP 工具类
class Http {
    constructor(private axiosInstance: AxiosInstance) {}

    /**
     * GET 请求
     * @param url 请求地址
     * @param params 请求参数
     * @param config 请求配置
     */
    get<T = unknown>(
        url: string,
        params?: Record<string, unknown>,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return this.axiosInstance
            .get<ResponseData<T>>(url, { params, ...config })
            .then((res) => res.data)
    }

    /**
     * POST 请求
     * @param url 请求地址
     * @param data 请求数据
     * @param config 请求配置
     */
    post<T = unknown>(
        url: string,
        data?: Record<string, unknown> | unknown,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return this.axiosInstance.post<ResponseData<T>>(url, data, config).then((res) => res.data)
    }

    /**
     * PUT 请求
     * @param url 请求地址
     * @param data 请求数据
     * @param config 请求配置
     */
    put<T = unknown>(
        url: string,
        data?: Record<string, unknown> | unknown,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return this.axiosInstance.put<ResponseData<T>>(url, data, config).then((res) => res.data)
    }

    /**
     * DELETE 请求
     * @param url 请求地址
     * @param params 请求参数
     * @param config 请求配置
     */
    delete<T = unknown>(
        url: string,
        params?: Record<string, unknown>,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return this.axiosInstance
            .delete<ResponseData<T>>(url, { params, ...config })
            .then((res) => res.data)
    }
}

// 导出 HTTP 实例
export const http = new Http((createAxiosInstantce(import.meta.env.VITE_API_BASE_URL)))
export const imHttp = new Http((createAxiosInstantce(import.meta.env.VITE_IM_API_BASE_URL)))
