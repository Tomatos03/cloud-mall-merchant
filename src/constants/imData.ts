/**
 * IM 模块类型定义和常量
 * 接口定义已移至 @/api/chat 模块
 * 本文件保留向后兼容的类型导出
 */

// 向后兼容：直接从 chat API 导出类型
export type { ChatSession as Contact } from '@/api/chat'
export type { MessageItem as Message } from '@/api/chat'

/**
 * @deprecated 已弃用 - 改为使用真实后端API (useImStore)
 * 原Mock数据已删除，如需查看可查看git历史记录
 */
export const mockContacts = []

/**
 * @deprecated 已弃用 - 改为使用真实后端API (useImStore)
 */
export const getMockMessages = () => []
