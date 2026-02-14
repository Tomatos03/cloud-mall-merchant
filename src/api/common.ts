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
