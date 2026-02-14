import { http } from '@/utils/http'
import type { OrderItem } from './order'

const PREFIX = '/comments'

/**
 * 评论项类型
 * 继承自 OrderItem，明确评论业务所需的关键字段
 */
export interface CommentItem extends OrderItem {
    commentId: string
    orderNo: string
    goodsName: string
    goodsMainImageUrl: string
    buyerName: string
    rate: number
    comment: string
    reply?: string
    createTime: string
}

/**
 * 评论查询参数
 */
export interface CommentPageParams {
    page: number
    pageSize: number
    hasReply?: boolean // 是否已回复：true 已回复, false 未回复
    goodsName?: string // 商品名称模糊查询
    [key: string]: unknown
}

/**
 * 分页响应结构
 */
export interface CommentPageResult {
    records: CommentItem[]
    total: number
    page: number
    pageSize: number
}

/**
 * 分页查询评论列表 (RESTful: GET /comments)
 * @param params 分页参数
 */
export function fetchCommentPage(params: CommentPageParams) {
    return http.get<CommentPageResult>(`${PREFIX}/page`, params)
}

/**
 * 回复评论 (RESTful: POST /comments/reply)
 * @param commentId 评论ID
 * @param replyContent 回复内容
 */
export function replyComment(commentId: string, replyContent: string) {
    return http.post(`${PREFIX}/reply`, { commentId, replyContent })
}

/**
 * 获取单条评论详情 (RESTful: GET /comments/:orderNo)
 * @param orderNo 订单号
 */
export function getCommentDetail(orderNo: string) {
    return http.get<CommentItem>(`${PREFIX}/${orderNo}`)
}
