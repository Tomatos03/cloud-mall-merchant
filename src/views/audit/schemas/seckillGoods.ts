import { z } from "zod"

export const SeckillGoodsItemSchema = z.object({
  goodsId: z.string(),
  goodsName: z.string(),
  mainImageUrl: z.string(),
  seckillPrice: z.string(),
  stock: z.number()
})

export type SeckillGoodsItem = z.infer<typeof SeckillGoodsItemSchema>
