<template>
    <div class="flex h-[calc(100vh-100px)] bg-white rounded-lg shadow-lg overflow-hidden m-4">
        <!-- 左侧联系人列表 -->
        <div class="w-70 border-r border-gray-100 flex flex-col">
            <div class="p-4 border-b border-gray-100">
                <el-button link @click="$router.back()">
                    <el-icon><ArrowLeft /></el-icon> 返回控制台
                </el-button>
            </div>

            <!-- 加载骨架屏 -->
            <div v-if="loading" class="flex-1 overflow-y-auto p-3">
                <div v-for="i in 5" :key="i" class="flex p-3 animate-pulse">
                    <div class="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
                        <div class="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            </div>

            <!-- 联系人列表 -->
            <ul
                v-else
                class="flex-1 overflow-y-auto list-none p-0 m-0"
                ref="sessionListRef"
                @scroll="handleSessionListScroll"
            >
                <li
                    v-for="session in chatSessions"
                    :key="session.id"
                    :class="[
                        'flex p-3 cursor-pointer transition-colors hover:bg-gray-50 relative',
                        { 'bg-[#e6f7ff]': curSession?.id === session.id },
                    ]"
                    @click="selectChatSession(session.id)"
                >
                    <img
                        :src="session.avatar || DEFAULT_IMAGE"
                        class="w-10 h-10 rounded-full object-cover mr-3 shrink-0"
                        alt="avatar"
                    />
                    <div class="flex-1 overflow-hidden">
                        <div class="flex justify-between mb-1">
                            <span class="font-medium text-gray-800">{{ session.name }}</span>
                            <span class="text-xs text-gray-400">{{ session.lastTime }}</span>
                        </div>
                        <p class="text-xs text-gray-500 truncate m-0">
                            {{ session.lastMessageContent }}
                        </p>
                    </div>
                    <span
                        v-if="session.unreadCount > 0"
                        class="absolute right-2.5 bottom-2.5 bg-red-500 text-white text-[10px] px-1.5 rounded-full leading-4"
                    >
                        {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
                    </span>
                </li>

                <li v-if="imStore.hasMoreSessions" class="flex justify-center py-3">
                    <el-button
                        :loading="imStore.sessionsLoading"
                        size="small"
                        @click="loadMoreSessions"
                    >
                        加载更多会话
                    </el-button>
                </li>
            </ul>
        </div>

        <!-- 右侧聊天窗口 -->
        <div class="flex-1 flex flex-col bg-gray-50/50">
            <template v-if="curSession">
                <div class="p-4 border-b border-gray-100 bg-white">
                    <span class="font-medium text-gray-800">{{ curSession.name }}</span>
                </div>

                <!-- 消息列表 -->
                <div class="flex-1 p-5 overflow-y-auto flex flex-col" ref="messageListRef">
                    <div
                        v-if="imStore.hasMoreMessages(curSession.id)"
                        class="flex justify-center pb-4"
                    >
                        <el-button :loading="messageLoading" size="small" @click="loadMoreMessages">
                            加载更多历史消息
                        </el-button>
                    </div>

                    <div
                        v-for="(msg, idx) in computedMessages"
                        :key="idx"
                        class="flex mb-5 flex-col"
                        :class="msg.isSelf ? 'items-end' : 'items-start'"
                    >
                        <div
                            class="flex items-center max-w-full"
                            :class="msg.isSelf ? 'flex-row-reverse' : 'flex-row'"
                        >
                            <img
                                :src="
                                    msg.isSelf
                                        ? userStore.avatarUrl || DEFAULT_IMAGE
                                        : curSession?.avatar || DEFAULT_IMAGE
                                "
                                class="w-9 h-9 rounded-full mx-2.5 shrink-0 object-cover"
                                alt="avatar"
                            />
                            <div
                                :class="[
                                    'py-2.5 px-3.5 rounded-lg shadow-sm text-sm leading-relaxed break-all max-w-[70%]',
                                    msg.isSelf
                                        ? 'bg-[#1890ff] text-white'
                                        : 'bg-white text-gray-800',
                                ]"
                            >
                                {{ msg.content }}
                            </div>
                        </div>
                        <div
                            class="mt-1"
                            :style="{ [msg.isSelf ? 'margin-right' : 'margin-left']: '56px' }"
                        >
                            <span class="text-xs text-gray-400">{{ msg.time }}</span>
                        </div>
                    </div>

                    <div
                        v-if="!messageLoading && curSessionMessages.length === 0"
                        class="flex-1 flex items-center justify-center text-gray-400"
                    >
                        <p>暂无消息</p>
                    </div>
                </div>

                <!-- 输入框 -->
                <div class="p-4 bg-white border-t border-gray-100">
                    <textarea
                        v-model="inputMessage"
                        class="w-full h-20 border border-gray-200 rounded resize-none outline-none focus:border-[#1890ff] focus:shadow-lg p-2 transition-all"
                        placeholder="请输入消息... (Enter 发送)"
                        @keyup.enter.prevent="handleMessageSend"
                    ></textarea>
                    <div class="flex justify-end mt-2">
                        <el-button :loading="sending" type="primary" @click="handleMessageSend">
                            发送
                        </el-button>
                    </div>
                </div>
            </template>

            <div v-else class="flex-1 flex items-center justify-center text-gray-400">
                <p>{{ messageLoading ? '加载中...' : '请选择左侧联系人开始聊天' }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue'
    import { ArrowLeft } from '@element-plus/icons-vue'
    import { ElMessage } from 'element-plus'
    import { getWSManager, WSMessageType } from '@/utils/websocket'
    import { type ChatMessage } from '@/api/chat'
    import { useUserStore } from '@/stores/user'
    import { useImStore } from '@/stores/im'
    import { useRoute } from 'vue-router'

    const DEFAULT_IMAGE = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

    const imStore = useImStore()
    const userStore = useUserStore()
    const route = useRoute()

    const inputMessage = ref('')
    const sending = ref(false)
    const loading = ref(false)
    const sessionListRef = ref<HTMLUListElement>()
    const messageListRef = ref<HTMLDivElement>()

    const chatSessions = computed(() => imStore.chatSessions)
    const curSession = computed(() => imStore.currentSession)
    const curSessionMessages = computed(() => imStore.currentSessionMessages)
    const messageLoading = computed(() => imStore.getMessageLoading(imStore.currentSessionId || 0))
    const computedMessages = computed(() =>
        curSessionMessages.value.map((msg) => ({ ...msg, isSelf: msg.userId === userStore.uid })),
    )

    const selectChatSession = async (sessionId: number) => {
        imStore.selectSession(sessionId)
        if (imStore.currentSessionMessages.length === 0) {
            await imStore.fetchSessionMessages(sessionId)
        }
    }

    const handleMessageSend = async () => {
        const content = inputMessage.value.trim()
        if (!content) return

        if (!curSession.value) throw new Error('未知的会话')

        const sessionId = curSession.value.id
        const tempMessage: ChatMessage = {
            sessionId,
            userId: userStore.uid,
            content,
            type: WSMessageType.TEXT,
            time: new Date().toLocaleTimeString(),
        }

        imStore.addMessage(sessionId, tempMessage)
        const preLastMessage = curSession.value.lastMessageContent
        const preLastTime = curSession.value.lastTime
        inputMessage.value = ''

        try {
            sending.value = true
            getWSManager().send({
                sessionId,
                receiverId: curSession.value.userId,
                content,
                type: WSMessageType.TEXT,
            })
            imStore.updateSessionLastMessage(sessionId, content, tempMessage.time)
        } catch {
            const messages = imStore.messagesMap.get(sessionId)
            messages?.pop()
            imStore.updateSessionLastMessage(sessionId, preLastMessage, preLastTime)
            inputMessage.value = content
            ElMessage.error('消息发送失败')
        } finally {
            sending.value = false
        }
    }

    const loadMoreSessions = async () => {
        try {
            await imStore.fetchChatSessions(imStore.sessionsPage + 1)
        } catch {
            ElMessage.error('加载更多会话失败')
        }
    }

    const loadMoreMessages = async () => {
        if (!curSession.value) return

        try {
            const sessionId = curSession.value.id
            const messageListEl = messageListRef.value
            const scrollHeightBefore = messageListEl?.scrollHeight || 0
            const scrollTopBefore = messageListEl?.scrollTop || 0

            await imStore.fetchSessionMessages(
                sessionId,
                imStore.getSessionMessagesPage(sessionId) + 1,
            )

            setTimeout(() => {
                if (messageListEl) {
                    messageListEl.scrollTop =
                        scrollTopBefore + (messageListEl.scrollHeight - scrollHeightBefore)
                }
            }, 0)
        } catch {
            ElMessage.error('加载更多消息失败')
        }
    }

    const handleSessionListScroll = () => {
        const el = sessionListRef.value
        if (!el) return
        const { scrollTop, scrollHeight, clientHeight } = el
        if (
            scrollHeight - scrollTop - clientHeight < 100 &&
            imStore.hasMoreSessions &&
            !imStore.sessionsLoading
        ) {
            loadMoreSessions()
        }
    }

    onMounted(async () => {
        try {
            loading.value = true
            imStore.setInIMPage(true)
            await imStore.fetchChatSessions()

            imStore.initializeIM()
        } catch {
            ElMessage.error('初始化IM模块失败')
        } finally {
            loading.value = false
        }
    })
</script>
