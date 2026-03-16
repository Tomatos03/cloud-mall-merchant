import Goods from './Goods.vue'
import SeckillGoods from './SeckillGoods.vue'
import { SeckillGoodsItemSchema, type SeckillGoodsItem } from '../schemas/seckillGoods'
import { GoodsAuditSchema, type GoodsAudit } from '../schemas/goods'
import { AuditBizType, type AuditRenderer, type AuditSnapshot } from '../types'

/**
 * 商品审核渲染器
 */
const goodsRenderer: AuditRenderer<GoodsAudit> = {
    parseSnapshot(snapshot?: AuditSnapshot) {
        const result = GoodsAuditSchema.safeParse(JSON.parse(snapshot || '{}'))
        if (!result.success) {
            console.error('[AuditRenderer][GOODS] parseSnapshot failed', {
                snapshot,
                error: result.error,
            })
            return null
        }

        console.debug('parseSnapshot result:', result)
        return result.data
    },
    getDetailComponent() {
        return Goods
    },
}

/**
 * 秒杀商品审核渲染器
 */
const seckillGoodsRenderer: AuditRenderer<SeckillGoodsItem> = {
    parseSnapshot(snapshot?: AuditSnapshot) {
        const result = SeckillGoodsItemSchema.safeParse(JSON.parse(snapshot || '{}'))
        if (!result.success) {
            console.error('[AuditRenderer][SECKILL_GOODS] parseSnapshot failed', {
                snapshot,
                error: result.error,
            })
            return null
        }

        console.debug('parseSnapshot result:', result)
        return result.data
    },
    getDetailComponent() {
        return SeckillGoods
    },
}

/**
 * 渲染器注册表
 */
export const auditRendererMap: Record<AuditBizType, AuditRenderer> = {
    GOODS: goodsRenderer,
    SECKILL_GOODS: seckillGoodsRenderer,
}

/**
 * 获取指定业务类型的渲染器
 */
export function getAuditRenderer(bizType: AuditBizType): AuditRenderer | undefined {
    return auditRendererMap[bizType]
}
