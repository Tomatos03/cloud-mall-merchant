<template>
    <div
        class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4 flex items-center justify-between"
    >
        <div class="flex items-center gap-6">
            <!-- 审核状态筛选 -->
            <div class="flex items-center gap-3">
                <span class="text-sm font-semibold text-[#64748b] uppercase tracking-wider"
                    >审核状态</span
                >
                <el-select
                    v-model="statusGroup"
                    @change="handleChange"
                    placeholder="请选择审核状态"
                    class="custom-select"
                    style="width: 160px"
                >
                    <el-option label="全部状态" :value="undefined" />
                    <el-option
                        v-for="(config, key) in AuditStatusMap"
                        :key="key"
                        :label="config.label"
                        :value="key"
                    />
                </el-select>
            </div>

            <!-- 业务类型筛选 -->
            <div class="flex items-center gap-3">
                <span class="text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                    业务类型
                </span>
                <el-select
                    v-model="targetType"
                    @change="handleChange"
                    placeholder="请选择业务类型"
                    class="custom-select"
                    style="width: 160px"
                >
                    <el-option label="全部类型" :value="undefined" />
                    <el-option
                        v-for="(item, key) in AuditTargetTypeMap"
                        :key="key"
                        :label="item.label"
                        :value="key"
                    />
                </el-select>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <el-button class="reset-btn" @click="handleReset">
                <el-icon class="mr-1"><RefreshRight /></el-icon>
                重置筛选
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { RefreshRight } from '@element-plus/icons-vue'
    import { AuditStatus, AuditStatusMap, AuditTargetTypeMap, AuditTargetType } from '../types'

    type StatusGroup = AuditStatus | undefined
    type FilterTargetType = AuditTargetType | undefined

    // 筛选参数对象 - 导出供父组件使用
    export interface FilterParams {
        status?: AuditStatus
        targetType?: AuditTargetType
    }

    // 内部维护筛选条件状态
    const statusGroup = ref<StatusGroup>(undefined)
    const targetType = ref<FilterTargetType>(undefined)

    const emit = defineEmits<{
        change: [params: FilterParams]
        reset: []
    }>()

    // 构建筛选参数对象
    const buildFilterParams = (): FilterParams => {
        const params: FilterParams = {}
        if (statusGroup.value) {
            params.status = statusGroup.value
        }
        if (targetType.value) {
            params.targetType = targetType.value
        }
        return params
    }

    const handleChange = () => {
        const filterParams = buildFilterParams()
        emit('change', filterParams)
    }

    const handleReset = () => {
        statusGroup.value = undefined
        targetType.value = undefined
        emit('reset')
    }
</script>

<style scoped>
    .custom-select :deep(.el-input__wrapper) {
        background-color: #f8fafc;
        box-shadow: none !important;
        border: 1px solid #f1f5f9;
        border-radius: 8px;
        padding: 4px 12px;
        transition: all 0.2s;
    }

    .custom-select :deep(.el-input__wrapper.is-focus) {
        background-color: #fff;
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6 !important;
    }

    .reset-btn {
        border: 1px solid #e2e8f0;
        background-color: #fff;
        color: #64748b;
        font-weight: 500;
        border-radius: 8px;
        padding: 8px 16px;
        transition: all 0.2s;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .reset-btn:hover {
        background-color: #f8fafc;
        color: #1e293b;
        border-color: #cbd5e0;
    }

    .reset-btn:active {
        background-color: #f1f5f9;
    }
</style>
