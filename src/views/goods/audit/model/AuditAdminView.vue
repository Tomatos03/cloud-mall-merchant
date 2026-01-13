<template>
    <div class="space-y-6 pb-6 mt-1">
        <!-- 基础状态与反馈信息 (表单式布局) -->
        <div class="bg-white rounded border border-gray-100 p-5">
            <div class="flex flex-wrap gap-x-12 gap-y-6">
                <div class="space-y-1.5 min-w-30">
                    <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium"
                        >当前审核状态</span
                    >
                    <div class="flex items-center gap-2">
                        <div
                            class="w-2 h-2 rounded-full"
                            :class="getStatusColorClass(data.auditStatus)"
                        ></div>
                        <span class="text-sm font-bold text-gray-900 whitespace-nowrap">
                            {{ getStatusLabel(data.auditStatus) }}
                        </span>
                    </div>
                </div>

                <div class="space-y-1.5 min-w-30">
                    <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium"
                        >申请人</span
                    >
                    <span class="text-sm text-gray-700 font-medium whitespace-nowrap">{{
                        data.applicantName || '-'
                    }}</span>
                </div>

                <div class="space-y-1.5 min-w-40">
                    <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium"
                        >申请提交时间</span
                    >
                    <span class="text-sm text-gray-700 font-medium whitespace-nowrap">{{
                        data.createTime || '-'
                    }}</span>
                </div>

                <div v-if="data.auditStatus !== 0" class="space-y-1.5 min-w-40">
                    <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium"
                        >最后处理时间</span
                    >
                    <span class="text-sm text-gray-700 font-medium whitespace-nowrap">{{
                        data.auditTime || '-'
                    }}</span>
                </div>

                <div
                    v-if="data.auditStatus === 1 || data.auditStatus === 2"
                    class="space-y-1.5 min-w-30"
                >
                    <span class="text-xs text-gray-500 block tracking-wider uppercase font-medium"
                        >审核执行人</span
                    >
                    <span class="text-sm text-gray-700 font-medium whitespace-nowrap">{{
                        data.auditorName || '系统'
                    }}</span>
                </div>

                <!-- 驳回理由与撤销提示占用全宽 -->
                <div class="w-full">
                    <!-- 驳回理由 -->
                    <div
                        v-if="data.auditStatus === 2"
                        class="mt-2 pt-4 border-t border-gray-50 bg-white"
                    >
                        <span
                            class="text-xs text-gray-500 block mb-2 tracking-wider uppercase font-medium"
                            >审核驳回意见</span
                        >
                        <div
                            class="bg-red-50/50 border border-red-100 rounded p-3 text-sm text-red-600 leading-relaxed"
                        >
                            {{ data.reason || '描述信息不符合平台入驻规范，请核对后重试' }}
                        </div>
                    </div>

                    <!-- 撤销提示 -->
                    <div
                        v-if="data.auditStatus === 3"
                        class="mt-2 pt-4 border-t border-gray-50 bg-white"
                    >
                        <div
                            class="bg-gray-50 border border-gray-100 rounded p-3 text-xs text-gray-500 italic"
                        >
                            该审核申请已被商家撤回，当前信息仅供留档查看。
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 预览核验内容 -->
        <div class="space-y-8">
            <!-- 1. 基本信息 -->
            <section>
                <div class="mb-4">
                    <div class="mb-4">
                        <span class="text-xs text-gray-500 block mb-1 font-medium">商品名称</span>
                        <h1 class="text-lg font-bold text-gray-900">{{ data.goodsName }}</h1>
                    </div>

                    <div class="mb-4">
                        <span class="text-xs text-gray-500 block mb-1 font-medium">商品卖点</span>
                        <div
                            class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-4 rounded border border-gray-100"
                        >
                            {{ data.sellPoint || '暂无详细描述文字' }}
                        </div>
                    </div>
                </div>
            </section>

            <!-- 2. 图片展示 -->
            <section>
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">图示素材核验</span>
                </div>
                <div class="space-y-4">
                    <!-- 主图与轮播 -->
                    <div>
                        <label class="text-xs text-gray-500 block mb-2 font-medium"
                            >主图与轮播图</label
                        >
                        <div class="flex flex-wrap gap-3">
                            <div
                                v-for="(img, i) in allImages"
                                :key="i"
                                class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                            >
                                <el-image
                                    :src="img"
                                    fit="cover"
                                    class="w-full h-full cursor-zoom-in"
                                    :preview-src-list="allImages"
                                    :initial-index="i"
                                    preview-teleported
                                />
                                <div
                                    v-if="i === 0"
                                    class="absolute top-0 left-0 px-1.5 py-0.5 bg-gray-800/80 text-white text-[9px] rounded-br z-10"
                                >
                                    主图
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 详情描述图 -->
                    <div>
                        <label class="text-xs text-gray-500 block mb-2 font-medium"
                            >商品描述图</label
                        >
                        <div class="flex flex-wrap gap-3">
                            <div
                                v-for="(img, i) in descriptionImgList"
                                :key="i"
                                class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                            >
                                <el-image
                                    :src="img"
                                    fit="cover"
                                    class="w-full h-full cursor-zoom-in"
                                    :preview-src-list="descriptionImgList"
                                    :initial-index="i"
                                    preview-teleported
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 3. 规格配置 (仅展示规格参数，不展示 SKU 详情) -->
            <section v-if="data.specifications && data.specifications.length > 0">
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">规格参数</span>
                </div>
                <div
                    class="rounded border border-gray-100 divide-y divide-gray-100 overflow-hidden"
                >
                    <div v-for="spec in data.specifications" :key="spec.name" class="flex text-xs">
                        <div
                            class="w-30 bg-slate-50 text-slate-500 shrink-0 px-4 py-3 font-medium flex items-center border-r border-gray-100"
                        >
                            {{ spec.name }}
                        </div>
                        <div class="flex-1 flex flex-wrap gap-2 p-3 bg-white items-center">
                            <el-tag
                                v-for="val in spec.values"
                                :key="val"
                                size="small"
                                class="rounded"
                                >{{ val }}</el-tag
                            >
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { GoodsSpecification } from '@/api/common'
    import { computed } from 'vue'

    export interface AuditGoodsData {
        mainImg: string
        imgList: string
        descriptionImgList: string
        auditStatus: number
        applicantName: string
        createTime: string
        auditTime?: string
        auditorName?: string
        reason?: string
        goodsName: string
        sellPoint: string
        specifications: GoodsSpecification[]
    }

    interface Props {
        data: AuditGoodsData
    }

    const props = defineProps<Props>()

    // 审核状态配置map
    const auditStatusMap: Record<number, { label: string; colorClass: string }> = {
        0: { label: '等待处理', colorClass: 'bg-blue-500' },
        1: { label: '审核已通过', colorClass: 'bg-green-500' },
        2: { label: '申请被驳回', colorClass: 'bg-red-500' },
        3: { label: '已撤销', colorClass: 'bg-gray-400' },
    }

    /**
     * 获取审核状态标签
     */
    function getStatusLabel(status: number): string {
        const auditStatus = auditStatusMap[status]
        if (!auditStatus) {
            throw new Error('Invalid audit status')
        }
        return auditStatus.label
    }

    /**
     * 获取审核状态颜色样式
     */
    function getStatusColorClass(status: number): string {
        const auditStatus = auditStatusMap[status]
        if (!auditStatus) {
            throw new Error('Invalid audit status')
        }
        return auditStatus.colorClass
    }

    const descriptionImgList = computed(() => {
        if (!props.data.descriptionImgList) {
            throw new Error('descriptionImgList is empty')
        }
        return props.data.descriptionImgList.split(',')
    })

    const allImages = computed(() => {
        const imgs: string[] = [props.data.mainImg]
        const imgList = props.data.imgList?.split(',') ?? []
        imgs.push(...imgList)
        return imgs
    })
</script>

<style scoped>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
</style>
