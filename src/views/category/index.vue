<template>
    <div class="category-container">
        <!-- 顶部操作按钮 -->
        <div class="toolbar">
            <el-button type="primary" @click="openAddDialog(null)">+ 添加一级分类</el-button>
            <el-button
                type="primary"
                style="margin-left: 8px"
                :loading="loading"
                @click="loadCategoryTree"
            >
                刷新分类
            </el-button>
        </div>

        <!-- 分类表格 -->
        <el-table
            v-loading="loading"
            :data="categoryTree"
            row-key="id"
            border
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            style="width: 100%; margin-top: 16px"
        >
            <el-table-column prop="name" label="分类名称" min-width="200" />
            <el-table-column prop="status" label="状态" width="120" align="center">
                <template #default="{ row }">
                    <el-tag :type="normalizeStatus(row.status) === 1 ? 'success' : 'info'">
                        {{ normalizeStatus(row.status) === 1 ? '启用' : '禁用' }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="220" align="center">
                <template #default="{ row }">
                    <el-dropdown @command="(command: CommandType) => handleCommand(command, row)">
                        <span class="el-dropdown-link">
                            操作
                            <el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="addChild" v-if="canAddChild(row)"
                                    >添加子分类</el-dropdown-item
                                >
                                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                                <el-dropdown-item command="delete">删除</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加/编辑分类对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入分类名称" />
                </el-form-item>
                <el-form-item label="父级分类" v-if="formData.parentId">
                    <el-input :value="parentCategoryName" disabled />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group
                        v-model="formData.status"
                        :disabled="!formData.id && formData.parentId && normalizeStatus(formData.parentStatus) === 0"
                    >
                        <el-radio :label="1">正常启用</el-radio>
                        <el-radio :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="排序值" prop="sort">
                    <el-input-number
                        placeholder="排序值越小越靠前"
                        v-model="formData.sort"
                        :min="0"
                        controls-position="right"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" :loading="submitLoading" @click="submitForm"
                        >确定</el-button
                    >
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, onMounted, nextTick } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { ArrowDown } from '@element-plus/icons-vue'
    import { getAdminApi } from '@/api/client'
    import type { CategoryItem, CategoryFormData } from '@/api/common/category'

    // 命令类型定义
    type CommandType = 'addChild' | 'edit' | 'delete'
    type Category = CategoryItem

    // 表单数据类型
    interface FormData extends CategoryFormData {
        parentStatus?: number | boolean
    }

    // 分类树数据
    const categoryTree = ref<Category[]>([])
    const loading = ref(false)
    const submitLoading = ref(false)

    // 对话框相关
    const dialogVisible = ref(false)
    const dialogTitle = computed(() => {
        if (formData.id) {
            return '编辑分类'
        }
        return formData.parentId ? '添加子分类' : '添加一级分类'
    })

    // 表单相关
    const formRef = ref()
    const formData = reactive<FormData>({
        name: '',
        status: 1,
        sort: 1,
        parentId: null,
        level: 1,
        parentStatus: undefined,
    })

    // 父级分类名称
    const parentCategoryName = ref('')

    // 表单验证规则
    const rules = {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        sort: [
            {
                required: true,
                message: '请输入排序值',
                trigger: 'blur',
                min: 1,
                max: 999,
                type: 'number',
            },
        ],
    }

    // 标准化状态值（处理布尔和数字类型）
    const normalizeStatus = (status?: number | boolean): number => {
        if (status === undefined || status === null) return 1
        if (typeof status === 'boolean') {
            return status ? 1 : 0
        }
        return status === 0 ? 0 : 1
    }

    // 判断是否可以添加子分类（最多三级）
    const canAddChild = (row: Category): boolean => {
        return Number(row.level ?? 0) < 3
    }

    // 打开添加对话框
    const openAddDialog = (parent: Category | null) => {
        // 如果父分类是三级分类，不允许添加子分类
        if (parent && Number(parent.level ?? 0) >= 3) {
            ElMessage.warning('最多只能添加三级分类')
            return
        }

        // 重置表单
        formData.id = undefined
        formData.name = ''
        formData.status = parent ? normalizeStatus(parent.status) : 1
        formData.sort = 1
        formData.parentId = parent ? parent.id : null
        formData.level = parent ? Number(parent.level ?? 0) + 1 : 1
        formData.parentStatus = parent?.status

        parentCategoryName.value = parent?.name || ''

        // 清除验证
        formRef.value?.clearValidate()
        dialogVisible.value = true
    }

    // 编辑分类
    const editCategory = async (row: Category) => {
        formData.id = row.id
        formData.name = row.name
        formData.status = normalizeStatus(row.status)
        formData.sort = row.sort ?? 1
        formData.parentId = row.parentId ?? null
        formData.level = Number(row.level ?? 1)

        // 如果有父级，获取父级的状态
        if (row.parentId) {
            const parent = findCategoryInTree(categoryTree.value, row.parentId)
            formData.parentStatus = parent?.status
            parentCategoryName.value = parent?.name || ''
        } else {
            formData.parentStatus = undefined
            parentCategoryName.value = ''
        }

        // 等待下一个 tick 确保数据更新完成
        await nextTick()

        // 清除验证
        formRef.value?.clearValidate()

        // 打开对话框
        dialogVisible.value = true
    }

    // 在树形结构中查找分类
    const findCategoryInTree = (tree: Category[], targetId: string): Category | null => {
        for (const item of tree) {
            if (item.id === targetId) return item
            if (item.children) {
                const found = findCategoryInTree(item.children, targetId)
                if (found) return found
            }
        }
        return null
    }

    // 删除分类
    const delCategory = async (row: Category) => {
        // 检查是否有子分类
        if (row.children && row.children.length > 0) {
            ElMessage.warning('该分类下有子分类，无法删除')
            return
        }

        try {
            await ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })

            const api = getAdminApi()
            await api.deleteCategory(row.id)
            ElMessage.success('删除成功')
            // 重新加载数据
            await loadCategoryTree()
        } catch (error) {
            // 用户取消删除操作
            if (error !== 'cancel') {
                console.error('删除操作被取消')
            }
        }
    }

    // 处理下拉菜单命令
    const handleCommand = (command: CommandType, row: Category) => {
        if (command === 'addChild') {
            openAddDialog(row)
        } else if (command === 'edit') {
            editCategory(row)
        } else if (command === 'delete') {
            delCategory(row)
        }
    }

    // 提交表单
    const submitForm = async () => {
        try {
            const valid = await formRef.value?.validate()
            if (!valid) return

            submitLoading.value = true

            // 准备提交的数据
            const submitData: CategoryFormData = {
                id: formData.id,
                name: formData.name,
                status: formData.status,
                sort: formData.sort,
                level: Number(formData.level),
                parentId: formData.parentId ?? null,
            }

            const api = getAdminApi()
            if (formData.id) {
                await api.updateCategory(submitData)
                ElMessage.success('编辑成功')
            } else {
                await api.addCategory(submitData)
                ElMessage.success('添加成功')
            }

            dialogVisible.value = false
            // 重新加载数据
            await loadCategoryTree()
            submitLoading.value = false
        } finally {
            submitLoading.value = false
        }
    }

    // 加载分类树
    const loadCategoryTree = async () => {
        loading.value = true
        try {
            const api = getAdminApi()
            const response = await api.getCategoryAllTree()
            categoryTree.value = response.data || []
        } finally {
            loading.value = false
        }
    }

    // 初始化加载数据
    onMounted(() => {
        loadCategoryTree()
    })
</script>

<style scoped>
    .category-container {
        padding: 20px;
    }

    .toolbar {
        margin-bottom: 16px;
    }

    .el-dropdown-link {
        cursor: pointer;
        color: var(--el-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
