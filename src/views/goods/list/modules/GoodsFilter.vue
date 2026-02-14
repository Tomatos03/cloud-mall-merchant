<template>
    <div class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4 flex items-center justify-between">
        <div class="flex items-center gap-6">
            <!-- 审核状态筛选 -->
            <div class="flex items-center gap-3">
                <span class="text-sm font-semibold text-[#64748b] uppercase tracking-wider">审核状态</span>
                <el-select
                    v-model="auditStatus"
                    placeholder="请选择审核状态"
                    @change="handleChange"
                    class="custom-select"
                    style="width: 160px"
                >
                    <el-option label="全部状态" :value="undefined" />
                    <el-option
                        v-for="(item, status) in AuditStatusMap"
                        :key="status"
                        :label="item.label"
                        :value="status"
                    />
                </el-select>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <el-button
                class="reset-btn"
                @click="handleReset"
            >
                <el-icon class="mr-1"><RefreshRight /></el-icon>
                重置筛选
            </el-button>
            <el-button type="primary" class="add-btn" @click="handleAdd">
                <el-icon class="mr-1"><Plus /></el-icon>
                添加商品
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { RefreshRight, Plus } from '@element-plus/icons-vue'
    import { AuditStatusMap } from '@/api/audit'
    import type { AuditStatus } from '@/api/audit'

    const props = defineProps<{
        modelValue: AuditStatus | undefined
    }>()

    const emit = defineEmits<{
        'update:modelValue': [value: AuditStatus | undefined]
        'change': []
        'reset': []
        'add': []
    }>()

    const auditStatus = computed({
        get: () => props.modelValue,
        set: (val) => emit('update:modelValue', val)
    })

    const handleChange = () => {
        emit('change')
    }

    const handleReset = () => {
        emit('reset')
    }

    const handleAdd = () => {
        emit('add')
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

.add-btn {
    border-radius: 8px;
    padding: 8px 16px;
    font-weight: 600;
    box-shadow: 0 2px 8px -2px rgba(59, 130, 246, 0.3);
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
</style>
