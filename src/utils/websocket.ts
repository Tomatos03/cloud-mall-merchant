import type { ChatMessage } from '@/api/chat'
import { useUserStore } from '@/stores/user'

/**
 * WebSocket消息类型定义
 */

export enum WSMessageType {
    TEXT = 'text',
    IMAGE = 'image',
}

export interface WSMessage {
    sessionId: number
    content: string
    type: WSMessageType
    receiverId: string
}

/**
 * WebSocket事件监听器回调类型
 */
export type WSMessageHandler = (data: ChatMessage) => void
export type WSConnectHandler = () => void
export type WSDisconnectHandler = () => void

/**
 * 简化版WebSocket管理类 - 纯事件驱动
 */
class WSManager {
    private static instance: WSManager | null = null
    private ws: WebSocket | null = null
    private messageHandlers: Set<WSMessageHandler> = new Set()
    private connectHandlers: Set<WSConnectHandler> = new Set()
    private disconnectHandlers: Set<WSDisconnectHandler> = new Set()
    private isConnecting = false

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): WSManager {
        if (!this.instance) {
            this.instance = new WSManager()
        }
        return this.instance
    }

    /**
     * 获取WebSocket URL
     */
    private getWSUrl(): string {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const token = useUserStore().token
        const host = import.meta.env.VITE_IM_PORT
        const address = import.meta.env.VITE_IM_ADDRESS
        return `${protocol}//${address}:${host}/chat/ws?token=${encodeURIComponent(token)}`
    }

    /**
     * 连接WebSocket - 纯事件驱动，不返回Promise
     */
    connect(): void {
        // 已连接则直接返回
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('[WebSocket] 已连接')
            this.connectHandlers.forEach((handler) => handler())
            return
        }

        // 正在连接中则直接返回
        if (this.isConnecting) {
            console.log('[WebSocket] 正在连接中，跳过重复连接')
            return
        }

        try {
            this.isConnecting = true
            const url = this.getWSUrl()
            console.log('[WebSocket] 连接URL:', url)
            this.ws = new WebSocket(url)

            this.ws.onopen = () => {
                console.log('[WebSocket] 连接成功')
                this.isConnecting = false
                this.connectHandlers.forEach((handler) => handler())
            }

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as ChatMessage
                    console.log('[WebSocket] 收到消息类型:', message.type)
                    this.messageHandlers.forEach((handler) => handler(message))
                } catch (error) {
                    console.error('[WebSocket] 消息解析失败:', error, '原始数据:', event.data)
                }
            }

            this.ws.onerror = (event) => {
                console.error('[WebSocket] 连接错误:', event)
                this.isConnecting = false
            }

            this.ws.onclose = () => {
                console.log('[WebSocket] 连接关闭')
                this.disconnectHandlers.forEach((handler) => handler())
            }
        } catch (error) {
            console.error('[WebSocket] 连接异常:', error)
            this.isConnecting = false
        }
    }

    /**
     * 发送数据到服务器
     */
    send(message: WSMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
            console.log('[WebSocket] 发送消息类型:', message.type)
        } else {
            console.warn('[WebSocket] 未连接，无法发送消息')
        }
    }

    /**
     * 检查连接状态
     */
    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN
    }

    /**
     * 注册消息处理器
     */
    onMessage(handler: WSMessageHandler): () => void {
        this.messageHandlers.add(handler)
        return () => {
            this.messageHandlers.delete(handler)
        }
    }

    /**
     * 注册连接事件处理器
     */
    onConnect(handler: WSConnectHandler): () => void {
        this.connectHandlers.add(handler)
        return () => {
            this.connectHandlers.delete(handler)
        }
    }

    /**
     * 注册断开连接事件处理器
     */
    onDisconnect(handler: WSDisconnectHandler): () => void {
        this.disconnectHandlers.add(handler)
        return () => {
            this.disconnectHandlers.delete(handler)
        }
    }

    /**
     * 断开WebSocket连接
     */
    disconnect() {
        this.isConnecting = false
        if (this.ws) {
            console.log('[WebSocket] 主动断开连接')
            this.ws.close()
            this.ws = null
        }
    }

    /**
     * 重置状态（用于登出等场景）
     */
    reset() {
        this.disconnect()
        this.messageHandlers.clear()
        this.connectHandlers.clear()
        this.disconnectHandlers.clear()
        console.log('[WebSocket] 状态已重置')
    }
}

/**
 * 获取WebSocket管理器单例
 */
export function getWSManager(): WSManager {
    return WSManager.getInstance()
}

/**
 * 销毁WebSocket管理器
 */
export function destroyWSManager() {
    const manager = WSManager.getInstance()
    manager.reset()
}
