import GoodsDetail from '@/components/goods/GoodsDetail.vue'
import type { AuditRenderer } from '../../types'

/**
 * 商品审核渲染器
 */
const goodsRenderer: AuditRenderer = {
    parseExtraInfo(snapshot: string) {
        return JSON.parse(snapshot)
    },
    getDetailComponent() {
        return GoodsDetail
    },
}

/**
 * 渲染器注册表
 */
export const auditRendererMap: Record<string, AuditRenderer> = {
    GOODS: goodsRenderer,
}

/**
 * 获取指定业务类型的渲染器
 */
export function getAuditRenderer(targetType: string): AuditRenderer | undefined {
    return auditRendererMap[targetType]
}
