import { useUserStore } from '@/stores/user'
import axios from 'axios'
import type {
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
    AxiosResponse,
} from 'axios'
import { ElMessage } from 'element-plus'

export interface ResponseData<T = unknown> {
    code: number
    message: string
    data: T
}

const BIZ_SUCCESS_CODE = 0
const SERVER_INTERNAL_ERROR = '服务器内部异常, 请稍后再试'
const REQUEST_FAILURE = '请求失败'
const UNKNOW_BIZ_ERROR = '未知的业务异常'

const getImageBaseURL = (): string => {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_IMAGE_BASE_URL || window.location.origin
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const url = new URL(baseUrl)
    return `${url.protocol}//${url.host}`
}

const processImageURL = (relativePath: string | undefined | null): string => {
    if (!relativePath) return ''
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath
    }
    const baseURL = getImageBaseURL()
    const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
    return `${baseURL}${path}`
}

const IMAGE_FIELDS = new Set([
    'img',
    'image',
    'avatar',
    'avatarUrl',
    'icon',
    'banner',
    'logo',
    'mainImg',
    'preview',
    'url',
    'goodsImg',
    'goodsMainImageUrl',
    'userAvatar',
    'storeAvatarUrl',
    'subImg',
    'images',
])

const isImageField = (key: string): boolean => IMAGE_FIELDS.has(key)
const isImageString = (value: unknown): value is string => typeof value === 'string'
const isImageArray = (value: unknown): value is unknown[] => Array.isArray(value)

const processImageURLsInData = (data: unknown): unknown => {
    if (Array.isArray(data)) return data.map(processImageURLsInData)
    if (data == null || typeof data !== 'object') return data

    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
            if (!isImageField(key)) {
                return [key, typeof value === 'object' ? processImageURLsInData(value) : value]
            }
            if (isImageString(value)) {
                return [key, processImageURL(value)]
            }
            if (isImageArray(value)) {
                return [key, value.map((item) => processImageURLsInData(item))]
            }
            return [key, processImageURLsInData(value)]
        }),
    )
}

const handleUnauthorized = () => {
    localStorage.removeItem('token')
    const userStore = useUserStore()
    userStore.clearUser()
    window.location.href = '/login'
}

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

const handleResponseError = (error: unknown): string => {
    if (!axios.isAxiosError(error)) return REQUEST_FAILURE

    if (error.response) {
        return getHttpErrorMessage(error.response.status, error.response.data)
    } else if (error.request) {
        return SERVER_INTERNAL_ERROR
    }
    return error.message || REQUEST_FAILURE
}

const assertNoBizError = (response: ResponseData): void => {
    if (response.code !== BIZ_SUCCESS_CODE) {
        ElMessage.error(response.message || UNKNOW_BIZ_ERROR)
        throw new Error(response.message || UNKNOW_BIZ_ERROR)
    }
}

const fillAuthorizationBear = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}

function createAxiosInstantce(baseURL: string): AxiosInstance {
    const instance = axios.create({
        baseURL,
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
    })

    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => fillAuthorizationBear(config),
        (error) => Promise.reject(error),
    )

    instance.interceptors.response.use(
        (response: AxiosResponse<ResponseData>) => {
            const res = response.data
            assertNoBizError(res)
            // 注意：由于后端使用 MinIO，图片 URL 已是完整路径，不需要处理
            // res.data = processImageURLsInData(res.data)
            return response
        },
        (error) => {
            const message = handleResponseError(error)
            ElMessage.error(message)
            return Promise.reject(error)
        },
    )

    return instance
}

class Http {
    constructor(private axiosInstance: AxiosInstance) {}

    get<T = unknown>(
        url: string,
        params?: Record<string, unknown>,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return this.axiosInstance
            .get<ResponseData<T>>(url, { params, ...config })
            .then((res) => res.data)
    }

    post<T = unknown>(
        url: string,
        data?: Record<string, unknown> | unknown,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return this.axiosInstance.post<ResponseData<T>>(url, data, config).then((res) => res.data)
    }

    put<T = unknown>(
        url: string,
        data?: Record<string, unknown> | unknown,
        config?: AxiosRequestConfig,
    ): Promise<ResponseData<T>> {
        return this.axiosInstance.put<ResponseData<T>>(url, data, config).then((res) => res.data)
    }

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

export const http = new Http(createAxiosInstantce(import.meta.env.VITE_API_BASE_URL))
export const comHttp = new Http(createAxiosInstantce(import.meta.env.VITE_COMMON_API_BASE_URL))
export const imHttp = new Http(createAxiosInstantce(import.meta.env.VITE_IM_API_BASE_URL))
