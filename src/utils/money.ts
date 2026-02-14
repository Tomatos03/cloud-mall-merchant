
/**
 * 比较两个金额的大小（字符串比较，避免数值溢出）
 * @param amount1 - 第一个金额（字符串）
 * @param amount2 - 第二个金额（字符串）
 * @returns 返回 1 表示 amount1 > amount2，-1 表示 amount1 < amount2，0 表示相等
 */
export function compareMoney(amount1: string, amount2: string): number {
    // 比较整数部分长度
    const [intPart1, decPart1] = amount1.split(".")
    const [intPart2, decPart2] = amount2.split(".")
    if (!intPart1 || !intPart2 || !decPart1 || !decPart2) {
        throw new Error('金额格式不正确')
    }

    if (intPart1.length !== intPart2.length) {
        return intPart1.length > intPart2.length ? 1 : -1
    }

    // 整数部分长度相同，比较整数部分
    if (intPart1 !== intPart2) {
        return intPart1 > intPart2 ? 1 : -1
    }

    // 整数部分相同，比较小数部分
    if (decPart1 !== decPart2) {
        return decPart1 > decPart2 ? 1 : -1
    }

    return 0
}

export function formatPrice(min_price: string, max_price?: string): string {
    const compareResult = max_price ? compareMoney(min_price, max_price) : 0
    if (compareResult == 0) {
        return `¥${min_price}`
    }

    return `¥${min_price}-${max_price}`
}
