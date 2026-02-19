import { http } from '@/utils/http'

const PREFIX = '/file/upload'

/**
 * 本地图片项类型
 */
export interface Image {
    uid?: number
    name?: string
    url: string
}

/**
 * 通用分页对象
 */
export interface PageParams {
    page: number
    pageSize: number
    [key: string]: unknown
}

/**
 * 通用分页返回结果
 */
export interface PageResult<T> {
    /**
     * 数据列表
     */
    records: T[]
    /**
     * 总记录数
     */
    total: number
    /**
     * 当前页码
     */
    current: number
    /**
     * 每页数量
     */
    size: number
    /**
     * 总页数
     */
    pages: number
}

/**
 * 上传图片（multipart/form-data）
 * @param formData FormData 包含 file 字段
 */
export function uploadImage(formData: FormData) {
    return http.post<Image>(`${PREFIX}/image`, formData, {
        headers: {
            'Content-Type': 'image/*',
        },
    })
}
