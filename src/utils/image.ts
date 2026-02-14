import type { Image } from '@/api/common'

/**
 * 生成唯一ID，优先使用crypto.randomUUID()，降级到时间戳+随机数
 */
function generateUniqueId(): number {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        // 使用UUID的哈希值转为数字
        const uuid = crypto.randomUUID()
        return Math.abs(uuid.split('-').join('').slice(0, 13).split('').reduce((acc, char) => {
            return acc + char.charCodeAt(0)
        }, 0))
    }
    // 降级方案：时间戳 + 随机数
    return Date.now() + Math.floor(Math.random() * 10000)
}

/**
 * 将URL字符串数组转换为Image对象数组
 * @param urls URL字符串数组
 * @returns Image对象数组
 */
export function urlsToImages(urls?: string[]): Image[] {
    if (!urls || urls.length === 0) {
        return []
    }
    
    return urls.map((url) => ({
        uid: generateUniqueId(),
        name: url.split('/').pop() || 'image',
        url,
    }))
}

/**
 * 将Image对象数组转换为URL字符串数组
 * @param images Image对象数组
 * @returns URL字符串数组
 */
export function imagesToUrls(images?: Image[]): string[] {
    if (!images || images.length === 0) {
        return []
    }
    
    return images.map((image) => image.url)
}

/**
 * 解析URL字符串，支持逗号分割的单字符串或字符串数组
 * @param urlData 可能是逗号分割的字符串、字符串数组或undefined
 * @returns URL字符串数组
 */
export function parseUrlString(urlData?: string | string[]): string[] {
    if (!urlData) {
        return []
    }
    
    // 如果已经是数组，直接返回过滤后的结果
    if (Array.isArray(urlData)) {
        return urlData.filter((url) => url && url.trim())
    }
    
    // 如果是字符串，按逗号分割并过滤空字符串
    return urlData
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url)
}
