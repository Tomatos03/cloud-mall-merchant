import { z } from 'zod'

/**
 * SKU 规格单项定义
 */
export const GoodsSkuSpecSchema = z.object({
    name: z.string(),
    value: z.string(),
})

/**
 * 商品 SKU 定义
 */
export const GoodsSkuItemSchema = z.object({
    specs: z.array(GoodsSkuSpecSchema),
    price: z.string(),
    inventory: z.number(),
    status: z.boolean(),
})

/**
 * 商品规格项定义
 */
export const GoodsSpecificationSchema = z.object({
    name: z.string(),
    values: z.array(z.string()),
})

/**
 * 商品审核快照 Zod Schema
 * 对应 AuditBizType.GOODS
 */
export const GoodsAuditSchema = z.object({
    goodsId: z.string().nullish(),
    goodsName: z.string(),
    storeName: z.string(),
    displayImageUrls: z.array(z.string()),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    status: z.boolean().optional(),
    sellPoint: z.string().optional(),
    unitId: z.string(),
    unitName: z.string().optional(),
    categoryId: z.string(),
    descriptionImageUrls: z.array(z.string()).optional(),
    specifications: z.array(GoodsSpecificationSchema).optional(),
    skus: z.array(GoodsSkuItemSchema).optional(),
})

export type GoodsAudit = z.infer<typeof GoodsAuditSchema>
