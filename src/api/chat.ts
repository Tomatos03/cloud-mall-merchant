import { imHttp } from '@/utils/http'
import type { PageParams, PageResult } from './common'

/**
 * 会话信息类型（对应后端Conversation）
 */
export interface ChatSession {
    id: number // 会话ID
    userId: string // 对方用户ID
    name: string // 对方名称
    avatar: string // 对方头像URL
    lastMessageContent: string // 最后一条消息内容
    lastTime: string // 最后一条消息时间 (ISO 8601格式)
    unreadCount: number // 未读消息数
}

export interface ChatMessage {
    sessionId: number
    userId: string
    content: string
    type: string
    time: string
    status?: string
}

/**
 * 消息项类型（对应后端ChatMessage）
 */
export enum MessageStatus {
    Sending = 'sending',
    Sent = 'sent',
    Failed = 'failed',
}

export interface MessageItem {
    sessionId: number // 会话ID
    userId: number // 消息发送者ID
    content: string // 消息内容（文本或图片URL）
    type: string // 消息类型
    time: string // ISO 8601 格式的时间字符串
    // 以下为前端计算字段
    status?: MessageStatus // 消息发送状态
}

/**
 * 获取历史消息参数
 */
export interface ChatParams extends PageParams {
    sessionId: number
}

/**
 * 发送消息请求体
 */
export interface SendMessagePayload {
    conversationId: number
    content: string
}

/**
 * 发送消息响应
 */
export interface SendMessageResult {
    message: MessageItem
}

/**
 * 获取会话列表 (GET /chat/conversations)
 * @param params 分页参数
 */
export function pageChatSessions(params: PageParams) {
    return imHttp.get<PageResult<ChatSession>>(`/sessions`, params)
}

/**
 * 获取历史消息 (GET /chat/history/{conversationId})
 * @param conversationId 会话ID
 * @param params 分页参数
 */
export function pageMessageHistory(params: ChatParams) {
    return imHttp.get<PageResult<ChatMessage>>(`/history`, params)
}

/**
 * 标记会话为已读 (POST /chat/read/{sessionId})
 * @param sessionId 会话ID
 */
export function markAsRead(sessionId: number) {
    return imHttp.put(`/read/${sessionId}`)
}
