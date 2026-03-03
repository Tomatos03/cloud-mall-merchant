<template>
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-6">待办事项</h3>
        <div class="space-y-4">
            <div
                v-for="todo in todos"
                :key="todo.id"
                class="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
                <div class="flex items-center space-x-3">
                    <span
                        class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                        :class="{
                            'bg-yellow-100 text-yellow-700': todo.type === 'warning',
                            'bg-red-100 text-red-700': todo.type === 'danger',
                            'bg-blue-100 text-blue-700': todo.type === 'info',
                        }"
                    >
                        {{ todo.tag }}
                    </span>
                    <span class="text-xs text-gray-700 font-medium">{{ todo.content }}</span>
                </div>
                <el-button size="small" link type="primary">处理</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    export interface TodoItem {
        id: number
        tag: string
        content: string
        type: 'warning' | 'danger' | 'info'
    }

    defineProps<{
        todos: TodoItem[]
    }>()
</script>
