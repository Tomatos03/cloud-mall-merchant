import { defineStore } from 'pinia'
import {
    pageChatSessions,
    pageMessageHistory,
    type ChatSession,
    type ChatMessage,
    markAsRead,
} from '@/api/chat'
import { getWSManager, destroyWSManager } from '@/utils/websocket'

const PAGE_SIZE = 10

export interface IMState {
    chatSessions: ChatSession[]
    messagesMap: Map<number, ChatMessage[]>
    currentSessionId: number | null
    sessionsLoading: boolean
    sessionsPage: number
    sessionsTotalPages: number
    messagesLoadingMap: Map<number, boolean>
    messagesPageMap: Map<number, number>
    messagesTotalPagesMap: Map<number, number>
    isInIMPage: boolean
    unsubscribeMessage: (() => void) | null
}

export const useImStore = defineStore('im', {
    state: (): IMState => ({
        chatSessions: [],
        messagesMap: new Map(),
        currentSessionId: null,
        sessionsLoading: false,
        sessionsPage: 0,
        sessionsTotalPages: 0,
        messagesLoadingMap: new Map(),
        messagesPageMap: new Map(),
        messagesTotalPagesMap: new Map(),
        isInIMPage: false,
        unsubscribeMessage: null,
    }),

    getters: {
        currentSession: (state) => {
            if (!state.currentSessionId) return null
            return state.chatSessions.find((session) => session.id === state.currentSessionId)
        },

        currentSessionMessages: (state) => {
            if (!state.currentSessionId) return []
            return state.messagesMap.get(state.currentSessionId) || []
        },

        getMessageLoading: (state) => (sessionId: number) => {
            return state.messagesLoadingMap.get(sessionId) || false
        },

        hasMoreSessions: (state) => {
            return state.sessionsPage < state.sessionsTotalPages
        },

        hasMoreMessages: (state) => (sessionId: number) => {
            const currentPage = state.messagesPageMap.get(sessionId) || 0
            const totalPages = state.messagesTotalPagesMap.get(sessionId) || 0
            return currentPage < totalPages
        },
    },

    actions: {
        async fetchChatSessions(page?: number) {
            const targetPage = page ?? 1

            if (targetPage === 1 && this.chatSessions.length > 0) {
                return this.chatSessions
            }

            this.sessionsLoading = true
            try {
                const res = await pageChatSessions({ page: targetPage, pageSize: PAGE_SIZE })
                const records = res.data.records.map((session) => ({
                    ...session,
                    id: Number(session.id),
                }))

                if (targetPage === 1) {
                    this.chatSessions = records
                } else {
                    this.chatSessions.push(...records)
                }

                this.sessionsPage = targetPage
                this.sessionsTotalPages = res.data.pages
                return this.chatSessions
            } finally {
                this.sessionsLoading = false
            }
        },

        async fetchSessionMessages(sessionId: number, page?: number) {
            const targetPage = page ?? 1

            this.messagesLoadingMap.set(sessionId, true)
            try {
                const res = await pageMessageHistory({
                    sessionId,
                    page: targetPage,
                    pageSize: PAGE_SIZE,
                })
                const messages = res.data.records

                if (targetPage === 1) {
                    this.messagesMap.set(sessionId, messages)
                } else {
                    const existing = this.messagesMap.get(sessionId) || []
                    this.messagesMap.set(sessionId, [...messages, ...existing])
                }

                this.messagesPageMap.set(sessionId, targetPage)
                this.messagesTotalPagesMap.set(sessionId, res.data.pages)
                return messages
            } finally {
                this.messagesLoadingMap.set(sessionId, false)
            }
        },

        getSessionMessagesPage(sessionId: number): number {
            return this.messagesPageMap.get(sessionId) || 0
        },

        selectSession(sessionId: number) {
            const session = this.chatSessions.find((s) => Number(s.id) === sessionId)
            if (session) {
                this.currentSessionId = sessionId
                return session
            }
            return null
        },

        selectSessionAndMarkRead(sessionId: number) {
            const session = this.selectSession(sessionId)
            if (session) {
                session.unreadCount = 0
                markAsRead(sessionId)
            }
            return session
        },

        addMessage(sessionId: number, message: ChatMessage) {
            if (!this.messagesMap.has(sessionId)) {
                this.messagesMap.set(sessionId, [])
            }
            this.messagesMap.get(sessionId)!.push(message)

            const session = this.chatSessions.find((s) => s.id === sessionId)
            if (session) {
                session.lastMessageContent = message.content
                session.lastTime = message.time
                if (!this.isInIMPage) {
                    session.unreadCount += 1
                }
            }
        },

        updateSessionLastMessage(sessionId: number, content: string, time: string) {
            const session = this.chatSessions.find((s) => s.id === sessionId)
            if (session) {
                session.lastMessageContent = content
                session.lastTime = time
            }
        },

        receiveMessage(message: ChatMessage) {
            this.addMessage(message.sessionId, message)
        },

        setInIMPage(isIn: boolean) {
            this.isInIMPage = isIn
        },

        initializeIM() {
            if (this.unsubscribeMessage) {
              return;
            }

            const wsManager = getWSManager()
            this.unsubscribeMessage = wsManager.onMessage((message: ChatMessage) => {
                this.receiveMessage(message)
            })
            wsManager.connect()
        },

        cleanupIM() {
            this.unsubscribeMessage?.()
            destroyWSManager()
        },

        clearAll() {
            this.chatSessions = []
            this.messagesMap.clear()
            this.messagesLoadingMap.clear()
            this.messagesPageMap.clear()
            this.messagesTotalPagesMap.clear()
            this.currentSessionId = null
            this.sessionsPage = 0
            this.sessionsTotalPages = 0
        },

        clearSessionMessages(sessionId: number) {
            this.messagesMap.delete(sessionId)
            this.messagesPageMap.delete(sessionId)
            this.messagesTotalPagesMap.delete(sessionId)
        },
    },
})
