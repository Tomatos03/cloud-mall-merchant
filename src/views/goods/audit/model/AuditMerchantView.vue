<template>
    <div class="space-y-6 pb-6 mt-1">
        <!-- 基础状态与快捷操作 (增强版反馈容器) -->
        <div
            class="px-5 py-4 rounded border-l-4 flex items-center justify-between"
            :class="getStatusContainerClass(data.auditStatus)"
        >
            <div class="flex items-center gap-4">
                <div
                    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    :class="getStatusIconClass(data.auditStatus)"
                >
                    <el-icon size="20">
                        <Check v-if="data.auditStatus === 1" />
                        <Close v-else-if="data.auditStatus === 2" />
                        <Minus v-else-if="data.auditStatus === 3" />
                        <Clock v-else />
                    </el-icon>
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-0.5">
                        <span class="font-bold text-gray-900">
                            {{ getStatusTitle(data.auditStatus) }}
                        </span>
                        <span class="text-xs text-gray-500 font-medium">
                            {{ getStatusTime(data.auditStatus) }}
                        </span>
                    </div>
                    <p
                        class="text-[13px] leading-relaxed"
                        :class="data.auditStatus === 2 ? 'text-red-600' : 'text-gray-600'"
                    >
                        {{ getStatusDescription(data.auditStatus) }}
                    </p>

                    <!-- 处理人信息 - 仅在通过或拒绝状态下显示 -->
                    <div
                        v-if="data.auditStatus === 1 || data.auditStatus === 2"
                        class="mt-3 pt-3 border-t border-gray-200"
                    >
                        <span
                            class="text-xs text-gray-500 block mb-1 tracking-wider uppercase font-medium"
                            >审核处理人</span
                        >
                        <span class="text-sm text-gray-700 font-medium">{{
                            data.auditorName || '系统'
                        }}</span>
                    </div>
                </div>
            </div>

            <el-button
                v-if="data.auditStatus === 2 || data.auditStatus === 3"
                :type="data.auditStatus === 2 ? 'danger' : 'primary'"
                size="default"
                class="rounded shrink-0 ml-4 px-6 font-medium shadow-sm transition-all hover:opacity-90"
                @click="handleButtonClick"
            >
                {{ getButtonText(data.auditStatus) }}
            </el-button>
        </div>

        <!-- 商品预览内容 -->
        <div class="space-y-8">
            <!-- 1. 基本信息 -->
            <section class="bg-gray-50/50 rounded-lg p-5 border border-gray-100">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-12">
                    <div class="md:col-span-2 pb-4 border-b border-gray-100">
                        <span
                            class="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1"
                            >商品名称</span
                        >
                        <h1 class="text-xl font-bold text-gray-900 leading-tight">
                            {{ data.goodsName }}
                        </h1>
                    </div>

                    <div>
                        <span
                            class="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1"
                            >所属类目</span
                        >
                        <span class="text-sm font-medium text-gray-700">{{
                            data.categoryPath || '-'
                        }}</span>
                    </div>

                    <div>
                        <span
                            class="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1"
                            >计价单位</span
                        >
                        <span class="text-sm font-medium text-gray-700">{{ data.unitName }}</span>
                    </div>

                    <div class="md:col-span-2">
                        <span
                            class="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1"
                            >商品卖点</span
                        >
                        <p
                            class="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap"
                        >
                            {{ data.sellPoint || '-' }}
                        </p>
                    </div>
                </div>
            </section>

            <!-- 2. 图片展示 -->
            <section>
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">商品图示</span>
                </div>
                <div class="flex flex-wrap gap-3">
                    <div
                        v-for="(imgUrl, i) in allImageUrls"
                        :key="i"
                        class="relative w-24 h-24 rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        <el-image
                            :src="imgUrl"
                            fit="cover"
                            class="w-full h-full cursor-zoom-in"
                            :preview-src-list="allImageUrls"
                            :initial-index="i"
                            preview-teleported
                        />
                        <div
                            v-if="i === 0"
                            class="absolute top-0 left-0 px-1.5 py-0.5 bg-gray-900/80 text-white text-[9px] font-medium rounded-br z-10"
                        >
                            主图
                        </div>
                    </div>
                </div>
            </section>

            <!-- 3. 详情描述图 -->
            <section>
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">详情描述图</span>
                </div>
                <div class="flex flex-wrap gap-3">
                    <div
                        v-for="(imgUrl, i) in descriptionImageUrls"
                        :key="i"
                        class="relative w-24 h-24 rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        <el-image
                            :src="imgUrl"
                            fit="cover"
                            class="w-full h-full cursor-zoom-in"
                            :preview-src-list="descriptionImageUrls"
                            :initial-index="i"
                            preview-teleported
                        />
                    </div>
                </div>
            </section>

            <!-- 4. 规格配置 (合并规格选项与 SKU 组合) -->
            <section
                v-if="
                    (data.specifications && data.specifications.length > 0) ||
                    (data.skus && data.skus.length > 0)
                "
            >
                <div class="mb-3">
                    <span class="text-sm font-bold text-gray-800">规格详细</span>
                </div>

                <div class="space-y-4">
                    <!-- 规格映射 -->
                    <div
                        v-if="data.specifications && data.specifications.length > 0"
                        class="rounded border border-gray-100 divide-y divide-gray-100 overflow-hidden"
                    >
                        <div
                            v-for="spec in data.specifications"
                            :key="spec.name"
                            class="flex text-xs"
                        >
                            <div
                                class="w-30 bg-slate-50 text-slate-500 shrink-0 px-4 py-3 font-medium flex items-center border-r border-gray-100"
                            >
                                {{ spec.name }}
                            </div>
                            <div class="flex-1 flex flex-wrap gap-2 p-3 bg-white items-center">
                                <el-tag
                                    v-for="(val, index) in spec.values"
                                    :key="index"
                                    size="small"
                                    class="rounded"
                                    >{{ val }}</el-tag
                                >
                            </div>
                        </div>
                    </div>

                    <!-- SKU 规格组合 (复用通用表格组件) -->
                    <div v-if="data.skus && data.skus.length > 0">
                        <common-table :columns="skuColumns" :data="data.skus">
                            <template #specs="{ row }">
                                <div class="flex flex-wrap gap-1">
                                    <el-tag
                                        v-for="s in row.specs"
                                        :key="s.name"
                                        size="small"
                                        type="info"
                                        class="rounded"
                                        >{{ s.value }}</el-tag
                                    >
                                </div>
                            </template>
                            <template #price="{ row }">
                                <span class="font-bold text-rose-500">￥{{ row.price }}</span>
                            </template>
                        </common-table>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { Check, Close, Clock, Minus } from '@element-plus/icons-vue'
    import CommonTable from '@/components/table/Table.vue'
    import { useGoodsPublishStore } from '@/stores/goodsPublish'
    import { AuditStatus, type GoodsSubmitPayload } from '@/api/common'

    export interface GoodsAuditInfo extends GoodsSubmitPayload {
        auditId: string
        unitName: string
        auditStatus: AuditStatus
        reason?: string
        applicantName: string
        categoryPath: string
        createTime: string
        auditorName?: string
        auditTime?: string
    }

    interface Props {
        data: GoodsAuditInfo
    }

    const props = defineProps<Props>()
    const router = useRouter()
    const publishStore = useGoodsPublishStore()

    const emit = defineEmits(['edit', 'close'])

    // 审核状态配置 map
    const auditStatusMap: Record<
        AuditStatus,
        {
            title: string
            description: string
            containerClass: string
            iconClass: string
            buttonText: string
        }
    > = {
        0: {
            title: '等待平台审核中',
            description: '平台预计会在 24 小时内完成核验，请耐心等待。',
            containerClass: 'bg-blue-50 border-blue-500',
            iconClass: 'bg-blue-100 text-blue-600',
            buttonText: '',
        },
        1: {
            title: '商品已通过审核',
            description: '恭喜！您的商品已通过平台审核，现已可以发布销售。',
            containerClass: 'bg-green-50 border-green-500',
            iconClass: 'bg-green-100 text-green-600',
            buttonText: '',
        },
        2: {
            title: '商品内容被驳回',
            description: '',
            containerClass: 'bg-red-50 border-red-500',
            iconClass: 'bg-red-100 text-red-600',
            buttonText: '修改并重新提交',
        },
        3: {
            title: '您已撤回审核申请',
            description: '您已主动撤回该申请。您可以点击"重新发布"调整内容后再次提交。',
            containerClass: 'bg-gray-50 border-gray-400',
            iconClass: 'bg-gray-100 text-gray-500',
            buttonText: '重新发布',
        },
    } as const

    const skuColumns = [
        { id: '1', label: '规格组合', key: 'specs' },
        { id: '2', label: '单价', key: 'price' },
        { id: '3', label: '可用库存', key: 'inventory' },
    ]

    const allImageUrls = computed(() => {
        const urls: string[] = [props.data.mainImg.url]
        if (props.data.imgList) {
            urls.push(...props.data.imgList.map((img) => img.url))
        }
        return urls
    })

    const descriptionImageUrls = computed(() => {
        return props.data.descriptionImgList.map((img) => img.url)
    })

    function getStatusContainerClass(status: AuditStatus): string {
        return auditStatusMap[status].containerClass
    }

    function getStatusIconClass(status: AuditStatus): string {
        return auditStatusMap[status].iconClass
    }

    function getStatusTitle(status: AuditStatus): string {
        return auditStatusMap[status].title
    }

    function getStatusDescription(status: AuditStatus): string {
        if (status === 2) {
            return props.data.reason || '描述不符合规范，请根据反馈进行调整'
        }
        return auditStatusMap[status].description
    }

    function getStatusTime(status: AuditStatus): string {
        switch (status) {
            case 0:
                return `提交于 ${props.data.createTime}`
            case 3:
                return `撤回于 ${props.data.createTime}`
            case 1:
            case 2:
                return `处理于 ${props.data.auditTime || '-'}`
            default:
                return ''
        }
    }

    function getButtonText(status: AuditStatus): string {
        return auditStatusMap[status].buttonText
    }

    const handleButtonClick = () => {
        if (
            props.data.auditStatus === AuditStatus.REVOKED ||
            props.data.auditStatus === AuditStatus.REJECTED
        ) {
            publishStore.setFormDataForRepublish(props.data)
            emit('close')
            router.push('/goods/publish')
        } else {
            emit('edit', props.data)
        }
    }
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
