<template>
    <div
        class="bg-white rounded overflow-hidden border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col"
        :style="containerStyle"
    >
        <el-table
            v-bind="$attrs"
            :data="tableData"
            :height="height"
            :border="border"
            :show-header="showHeader"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            header-cell-class-name="custom-header-cell"
            cell-class-name="custom-cell"
        >
            <!-- 多选列 -->
            <el-table-column
                v-if="props.showSelection"
                type="selection"
                width="50"
                align="center"
            />

            <!-- 序号列 -->
            <el-table-column
                v-if="props.showId"
                type="index"
                label="序号"
                width="60"
                align="center"
            >
                <template #default="scope">
                    <span class="text-[#718096] text-xs font-bold">
                        {{ scope.$index + 1 }}
                    </span>
                </template>
            </el-table-column>

            <!-- 动态数据列 -->
            <el-table-column
                v-for="col in columns"
                :key="col.key"
                :prop="col.key"
                :label="col.label"
                :fixed="col.isFixed"
                :width="col.width"
                :align="col.align || 'left'"
                show-overflow-tooltip
                min-width="120"
            >
                <template v-if="$slots && $slots[col.key]" #default="scope">
                    <slot :name="col.key" v-bind="scope" />
                </template>
            </el-table-column>

            <!-- 操作插槽 -->
            <el-table-column
                v-if="$slots.action"
                label="操作"
                fixed="right"
                width="280"
                align="center"
                min-width="280"
            >
                <template #default="scope">
                    <div class="flex items-center justify-center gap-1 flex-wrap">
                        <slot name="action" :row="scope.row" :index="scope.$index" />
                    </div>
                </template>
            </el-table-column>

            <!-- 自定义空状态 -->
            <template #empty>
                <slot name="empty">
                    <div class="flex flex-col items-center justify-center py-20">
                        <div
                            class="w-20 h-20 rounded-full bg-[#f8faff] flex items-center justify-center text-[#cbd5e0] mb-4"
                        >
                            <el-icon :size="40"><document /></el-icon>
                        </div>
                        <p class="text-[#a0aec0] text-sm font-medium">暂无相关数据</p>
                    </div>
                </slot>
            </template>
        </el-table>
    </div>
</template>

<script lang="ts" setup>
    import { toRef, computed } from 'vue'

    interface Column {
        id: string
        label: string
        key: string
        isFixed?: boolean
        width?: string | number
        align?: 'left' | 'center' | 'right'
    }

    interface Props {
        columns: Column[]
        data: unknown[]
        selectList?: unknown[]
        height?: number | string
        showId?: boolean
        showSelection?: boolean
        border?: boolean
        showHeader?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        columns: () => [],
        data: () => [],
        selectList: () => [],
        showSelection: false,
        border: false,
        showHeader: true,
    })

    const emit = defineEmits<{
        'update:selectList': [value: unknown[]]
    }>()

    const columns = toRef(props, 'columns')
    const tableData = toRef(props, 'data')
    const height = toRef(props, 'height')

    // 确保容器高度与表格高度一致，特别是当 height 为 100% 时
    const containerStyle = computed(() => {
        if (!props.height) return {}
        return {
            height: typeof props.height === 'number' ? `${props.height}px` : props.height,
        }
    })

    const handleSelectionChange = (selection: unknown[]) => {
        emit('update:selectList', selection)
    }
</script>

<style scoped>
    :deep(.el-table) {
        --el-table-border-color: #f1f5f9;
        --el-table-header-bg-color: #f8faff;
        --el-table-row-hover-bg-color: #f8faff;
        --el-table-text-color: #4a5568;
        --el-table-header-text-color: #1a202c;
        border: none;
        height: 100%; /* 确保表格撑满容器 */
    }

    :deep(.custom-header-cell) {
        background-color: #f8faff !important;
        font-weight: bold;
        padding: 16px 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    :deep(.custom-cell) {
        padding: 12px 0;
        border-bottom: 1px solid #f8fafc;
        font-size: 14px;
    }

    /* 隐藏表格多余边框 */
    :deep(.el-table--border),
    :deep(.el-table--group) {
        border: none;
    }

    :deep(.el-table__inner-wrapper::before),
    :deep(.el-table__fixed-right::before),
    :deep(.el-table__fixed::before) {
        display: none;
    }

    /* 调整滚动条样式使其更简约 */
    :deep(.el-scrollbar__bar) {
        z-index: 5;
    }
</style>
