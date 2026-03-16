<template>
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-800">最近消息</h3>
            <el-link type="primary" :underline="false" @click="$router.push('/im')"> 全部 </el-link>
        </div>
        <div class="space-y-4">
            <div
                v-for="chatSession in props.data"
                :key="chatSession.id"
                class="flex items-start p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-100"
                @click="handleClick(chatSession.id)"
            >
                <div class="relative mr-3 shrink-0">
                    <el-avatar :size="40" :src="chatSession.avatar || defaultImage" />
                    <span
                        v-if="chatSession.unreadCount > 0"
                        class="absolute bottom-0 right-0 bg-red-500 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg transform translate-x-1 translate-y-1"
                    >
                        {{ chatSession.unreadCount > 99 ? '99+' : chatSession.unreadCount }}
                    </span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-gray-800 truncate text-sm">{{
                            chatSession.name
                        }}</span>
                        <span class="text-xs text-gray-400">{{ chatSession.lastTime }}</span>
                    </div>
                    <p class="text-xs text-gray-500 truncate leading-relaxed">
                        {{ chatSession.lastMessageContent }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { AuditRendererProps } from '@/views/audit/types'

    interface ChatSession {
        id: number
        name: string
        avatar?: string
        unreadCount: number
        lastTime: string
        lastMessageContent: string
    }

    const props = defineProps<AuditRendererProps<ChatSession[]>>()

    const emit = defineEmits<{
        (e: 'message-click', sessionId: number): void
    }>()

    const defaultImage = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

    const handleClick = (sessionId: number) => {
        emit('message-click', sessionId)
    }
</script>
