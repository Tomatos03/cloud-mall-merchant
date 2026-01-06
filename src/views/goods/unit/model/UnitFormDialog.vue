<template>
    <el-dialog
        v-model="visible"
        :title="title"
        width="500px"
        @close="handleClose"
    >
        <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="120px"
        >
            <el-form-item label="单位名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入单位名称" />
            </el-form-item>

            <el-form-item label="排序值" prop="sort">
                <el-input-number v-model="form.sort" :min="0" controls-position="right" />
            </el-form-item>

            <el-form-item label="状态" prop="status">
                <CapsuleToggle
                    v-model="form.status"
                    :options="[
                        { label: '启用', value: 1 },
                        { label: '禁用', value: 0 },
                    ]"
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
                {{ loading ? '提交中...' : '确定' }}
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import CapsuleToggle from '@/components/CapsuleToggle.vue'
import type { UnitItem } from '@/api/admin/unit'

const props = withDefaults(
    defineProps<{
        visible: boolean
        unit?: Partial<UnitItem> | null
        loading?: boolean
    }>(),
    {
        loading: false,
    }
)

const emit = defineEmits<{
    'update:visible': [value: boolean]
    confirm: [value: Partial<UnitItem>]
}>()

const formRef = ref<FormInstance>()

const form = ref<Partial<UnitItem>>({
    name: '',
    sort: 0,
    status: 1,
})

const rules = {
    name: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
    sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const title = computed(() => {
    return props.unit?.id ? '编辑单位' : '添加单位'
})

const visible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
})

watch(
    () => props.unit,
    (newUnit) => {
        if (newUnit) {
            form.value = {
                ...JSON.parse(JSON.stringify(newUnit)),
            }
        } else {
            form.value = {
                name: '',
                sort: 0,
                status: 1,
            }
        }
    },
    { deep: true }
)

const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    emit('confirm', form.value)
}

const handleClose = () => {
    visible.value = false
    formRef.value?.clearValidate()
}
</script>

<style scoped></style>