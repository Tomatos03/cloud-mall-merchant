<template>
    <div class="h-full flex flex-col p-6 bg-gray-50/50">
        <!-- 顶部筛选卡片 -->
        <el-card shadow="never" class="mb-6 border-none rounded-xl!">
            <div class="flex flex-wrap gap-6 items-center">
                <div class="flex items-center gap-3">
                    <span class="text-sm font-semibold text-gray-600">商品名称</span>
                    <el-input
                        v-model="searchQuery.goodsName"
                        placeholder="搜索商品名称..."
                        clearable
                        class="w-64"
                        @keyup.enter="handleSearch"
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-sm font-semibold text-gray-600">回复状态</span>
                    <el-select
                        v-model="searchQuery.replyStatus"
                        placeholder="选择状态"
                        class="!w-40"
                        @change="handleSearch"
                    >
                        <el-option label="全部评价" value="ALL" />
                        <el-option label="待回复" value="PENDING" />
                        <el-option label="已回复" value="REPLIED" />
                    </el-select>
                </div>
                <div class="flex gap-3 ml-auto">
                    <el-button type="primary" @click="handleSearch" class="!rounded-lg px-6">
                        查询
                    </el-button>
                    <el-button @click="handleReset" class="!rounded-lg px-6">
                        重置
                    </el-button>
                </div>
            </div>
        </el-card>

        <!-- 评论列表区域 -->
        <div class="flex-1 overflow-auto pr-2 custom-scrollbar">
            <div v-loading="loading" class="space-y-6">
                <el-empty v-if="data.length === 0 && !loading" :image-size="200" description="暂无评论数据" />

                <div
                    v-for="item in data"
                    :key="item.orderNo"
                    class="comment-item-card group bg-white rounded-2xl border border-transparent transition-all duration-300 hover:border-blue-100"
                >
                    <div class="flex gap-6 p-5">
                        <!-- 左侧商品预览 -->
                        <div class="relative flex-shrink-0">
                            <el-image
                                :src="item.goodsImage"
                                class="w-24 h-24 rounded-xl shadow-sm border border-gray-100"
                                fit="cover"
                            >
                                <template #error>
                                    <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <el-icon :size="24"><Picture /></el-icon>
                                    </div>
                                </template>
                            </el-image>
                            <div class="absolute -top-2 -left-2">
                                <el-tag
                                    :type="item.reply ? 'success' : 'warning'"
                                    effect="dark"
                                    size="small"
                                    class="!border-none shadow-sm"
                                >
                                    {{ item.reply ? '已回复' : '待回复' }}
                                </el-tag>
                            </div>
                        </div>

                        <!-- 右侧内容区 -->
                        <div class="flex-1 min-w-0">
                            <!-- 头部：商品名与评分 -->
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h4 class="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer truncate">
                                        {{ item.goodsName }}
                                    </h4>
                                    <div class="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                                        <span class="flex items-center gap-1">
                                            <el-icon><User /></el-icon> {{ item.buyerName }}
                                        </span>
                                        <span class="flex items-center gap-1">
                                            <el-icon><Document /></el-icon> {{ item.orderNo }}
                                        </span>
                                        <span class="flex items-center gap-1">
                                            <el-icon><Clock /></el-icon> {{ item.createTime }}
                                        </span>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <el-rate v-model="item.rate" disabled show-score text-color="#F7BA2A" />
                                </div>
                            </div>

                            <!-- 评价内容 -->
                            <div class="relative bg-white border border-gray-100 p-4 rounded-xl mb-4 group-hover:border-blue-100 transition-colors">
                                <div class="absolute -top-2 left-4 px-2 bg-white text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                                    买家评价
                                </div>
                                <p class="text-gray-700 text-sm leading-relaxed">
                                    {{ item.comment }}
                                </p>
                            </div>

                            <!-- 商家回复 -->
                            <div v-if="item.reply" class="relative bg-blue-50/50 border border-blue-100/50 p-4 rounded-xl">
                                <div class="absolute -top-2 left-4 px-2 bg-blue-50 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                                    我的回复
                                </div>
                                <p class="text-gray-700 text-sm leading-relaxed italic">
                                    {{ item.reply }}
                                </p>
                            </div>

                            <div v-else class="flex justify-end mt-2">
                                <el-button
                                    type="primary"
                                    size="default"
                                    class="!rounded-lg shadow-sm hover:shadow-md transition-all"
                                    @click="onReply(item)"
                                >
                                    <el-icon class="mr-1"><ChatDotRound /></el-icon> 立即回复
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页区域 -->
        <div class="mt-4 flex justify-end">
            <el-pagination
                v-model:current-page="page"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50]"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Picture, User, Document, Clock, ChatDotRound } from '@element-plus/icons-vue'
import type { CommentItem, CommentPageParams } from '@/api/merchant/comment'
import { getMerchantApi } from '@/api/client'

const loading = ref(false)
const data = ref<CommentItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchQuery = reactive({
    goodsName: '',
    replyStatus: 'ALL'
})

const loadData = async () => {
    loading.value = true
    try {
        const params: CommentPageParams = {
            page: page.value,
            pageSize: pageSize.value,
            goodsName: searchQuery.goodsName || undefined
        }

        if (searchQuery.replyStatus === 'PENDING') {
            params.hasReply = false
        } else if (searchQuery.replyStatus === 'REPLIED') {
            params.hasReply = true
        }

        const api = getMerchantApi()
        const res = await api.fetchCommentPage(params)
        data.value = res.data.records
        total.value = Number(res.data.total) || 0
    } catch (error) {
        console.error('加载评论失败:', error)
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    page.value = 1
    loadData()
}

const handleReset = () => {
    searchQuery.goodsName = ''
    searchQuery.replyStatus = 'ALL'
    handleSearch()
}

const handlePageChange = (val: number) => {
    page.value = val
    loadData()
}

const handleSizeChange = (val: number) => {
    pageSize.value = val
    page.value = 1
    loadData()
}

const onReply = (row: CommentItem) => {
    ElMessageBox.prompt('请输入回复内容', '回复评价', {
        confirmButtonText: '提交回复',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '回复内容不能为空',
        inputType: 'textarea',
        customClass: 'reply-message-box'
    }).then(async ({ value }) => {
        try {
            const api = getMerchantApi()
            await api.replyComment(row.commentId, value)
            ElMessage.success('回复成功')
            loadData()
        } catch (error) {
            console.error('回复失败:', error)
        }
    })
}

onMounted(() => {
    loadData()
})
</script>

<style scoped>
.comment-item-card {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.02);
}

.comment-item-card:hover {
    box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1);
    transform: translateY(-2px);
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background-color: transparent;
}

:deep(.el-rate__text) {
    font-size: 12px;
    font-weight: bold;
    margin-left: 4px;
}

.el-card :deep(.el-input__wrapper) {
    border-radius: 8px !important;
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
}

.el-card :deep(.el-select .el-input__wrapper) {
    border-radius: 8px !important;
}
</style>
