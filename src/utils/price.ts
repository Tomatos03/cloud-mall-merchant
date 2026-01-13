/**
 * 格式化价格显示
 * 如果最低价和最高价相同，只显示一个价格
 * @param minPrice 最低价格字符串（必传）
 * @param maxPrice 最高价格字符串（必传）
 * @returns 格式化后的价格字符串
 */
export function formatPrice(minPrice: string, maxPrice: string): string {
    if (!minPrice) {
        return '-'
    }

    // 如果价格相同，只显示一个
    if (minPrice === maxPrice) {
        return minPrice
    }

    return `${minPrice} - ${maxPrice}`
}
