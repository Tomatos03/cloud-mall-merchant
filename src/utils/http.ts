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
 * 图片处理逻辑：将相对路径转换为完整的图片URL
 */
const getImageBaseURL = (): string => {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_IMAGE_BASE_URL || window.location.origin
    }
    const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'
    // 如果是相对路径，则补全域名以便 URL 解析
    const urlStr = apiBaseURL.startsWith('http')
        ? apiBaseURL
        : `${window.location.origin}${apiBaseURL}`
    const url = new URL(urlStr)
    return `${url.protocol}//${url.host}`
}

const formatImageUrl = (url: string): string => {
    if (typeof url !== 'string' || !url) return url
    // 如果已经是完整URL或 Base64，直接返回
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url
    }
    const baseURL = getImageBaseURL()
    const path = url.startsWith('/') ? url : `/${url}`
    return `${baseURL}${path}`
}

/**
 * 将完整URL还原为相对路径，用于提交给后端
 */

const IMAGE_KEYS = ['url', 'img', 'avatarUrl', 'banner', 'goodsImg']

/**
 * 递归处理响应对象中的图片字段，将相对路径转为绝对路径
 */
const processImageUrls = (data: any): any => {
    if (!data || typeof data !== 'object') return data

    if (Array.isArray(data)) {
        data.forEach((item) => processImageUrls(item))
        return data
    }

    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key]
            if (IMAGE_KEYS.includes(key) && typeof value === 'string' && value) {
                if (key === 'imgList' || key === 'detailImages') {
                    // 处理可能出现的逗号分隔图片列表
                    data[key] = value
                        .split(',')
                        .filter(Boolean)
                        .map((img: string) => formatImageUrl(img.trim()))
                        .join(',')
                } else {
                    data[key] = formatImageUrl(value)
                }
            } else if (typeof value === 'object' && value !== null) {
                processImageUrls(value)
            }
        }
    }
    return data
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // API 基础路径
    timeout: 15000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    },
})

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

// 请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 在发送请求之前做些什么
        // 可以在这里添加 token
        const userStore = useUserStore()
        const token = userStore.token
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        // 对请求错误做些什么
        console.error('请求错误：', error)
        return Promise.reject(error)
    },
)

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse<ResponseData>) => {
        const res = response.data

        // 根据返回的 code 判断请求是否成功
        if (res.code !== 200 && res.code !== 0) {
            ElMessage.error(res.message || '请求失败')

            // 特殊状态码处理
            if (res.code === 401) {
                handleUnauthorized()
            }

            return Promise.reject(new Error(res.message || '请求失败'))
        }

        // 自动处理返回数据中的图片相对路径
        if (res.data) {
            processImageUrls(res.data)
        }

        // 直接返回数据部分
        return response
    },
    (error) => {
        console.error('响应错误：', error)

        // 处理 HTTP 错误
        const message = handleResponseError(error)

        ElMessage.error(message)
        return Promise.reject(error)
    },
)

// HTTP 工具类
class Http {
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
        return service.get<ResponseData<T>>(url, { params, ...config }).then((res) => res.data)
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
        return service.post<ResponseData<T>>(url, data, config).then((res) => res.data)
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
        return service.put<ResponseData<T>>(url, data, config).then((res) => res.data)
    }

    /**
     * PATCH 请求
     * @param url 请求地址
     * @param data 请求数据
     * @param config 请求配置
     */
    patch<T = unknown>(
        url: string,
        data?: Record<string, unknown> | unknown,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return service.patch<ResponseData<T>>(url, data, config).then((res) => res.data)
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
        return service.delete<ResponseData<T>>(url, { params, ...config }).then((res) => res.data)
    }
}

// 导出 HTTP 实例
export const http = new Http()

// 默认导出
export default http
