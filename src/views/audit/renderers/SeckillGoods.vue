<template>
    <div class="bg-white rounded-lg border border-gray-100 p-5">
        <h4 class="text-sm font-bold text-gray-700 mb-4 flex items-center">
            <el-icon class="mr-2 text-blue-500"><Goods /></el-icon>
            秒杀商品审核
        </h4>

        <el-table v-if="tableData.length" :data="tableData" border class="w-full">
            <el-table-column type="index" label="#" width="56" align="center" />
            <el-table-column prop="goodsId" label="商品ID" min-width="140" />
            <el-table-column label="商品信息" min-width="220">
                <template #default="{ row }">
                    <div class="flex items-center gap-3">
                        <el-image
                            v-if="row.mainImageUrl"
                            :src="row.mainImageUrl"
                            class="w-10 h-10 rounded object-cover border border-gray-100"
                            :preview-src-list="[row.mainImageUrl]"
                            preview-teleported
                        />
                        <div
                            v-else
                            class="w-10 h-10 rounded border border-gray-100 bg-gray-50 text-gray-400 flex items-center justify-center text-xs"
                        >
                            无图
                        </div>
                        <span class="text-gray-700">{{ row.goodsName }}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="秒杀价" min-width="100">
                <template #default="{ row }">
                    <span class="text-red-500 font-bold">¥{{ row.seckillPrice }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="stock" label="申报库存" min-width="100" />
            <el-table-column label="审核状态" min-width="100">
                <template #default="{ row }">
                    <el-tag :type="getStatusType(row.auditItemStatus)" size="small">
                        {{ getStatusLabel(row.auditItemStatus) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="拒绝原因" min-width="200" show-overflow-tooltip>
                <template #default="{ row }">
                    <span class="text-red-600">{{ row.reason ?? '-' }}</span>
                </template>
            </el-table-column>
        </el-table>
        <div
            v-else
            class="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500"
        >
            暂无审核对象数据
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { Goods } from '@element-plus/icons-vue'
    import { AuditItemStatus, AuditItemStatusMap, type AuditRendererProps } from '../types'
    import type { SeckillGoodsItem } from '../schemas/seckillGoods'

    interface SeckillGoodsRow {
        goodsId: string
        goodsName: string
        mainImageUrl: string
        seckillPrice: string
        stock: number
        auditItemStatus: AuditItemStatus
        reason?: string
    }

    const props = defineProps<AuditRendererProps<SeckillGoodsItem>>()

    const tableData = computed<SeckillGoodsRow[]>(() =>
        props.data.flatMap((auditItem) => {
            if (!auditItem.data) return []

            return [
                {
                    goodsId: auditItem.data.goodsId,
                    goodsName: auditItem.data.goodsName,
                    mainImageUrl: auditItem.data.mainImageUrl,
                    seckillPrice: auditItem.data.seckillPrice,
                    stock: auditItem.data.stock,
                    auditItemStatus: auditItem.status,
                    reason: auditItem.reason,
                },
            ]
        }),
    )

    const getStatusLabel = (status: AuditItemStatus) => {
        return AuditItemStatusMap[status]?.label ?? '未知'
    }

    const getStatusType = (status: AuditItemStatus) => {
        const typeMap = {
            [AuditItemStatus.PENDING]: 'warning',
            [AuditItemStatus.APPROVED]: 'success',
            [AuditItemStatus.REJECTED]: 'danger',
        }
        return typeMap[status] ?? 'info'
    }
</script>
