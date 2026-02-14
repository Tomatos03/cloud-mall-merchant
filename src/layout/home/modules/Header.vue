<template>
    <div class="flex items-center justify-between w-full h-full">
        <!-- 左侧：页面标题与导航状态 -->
        <div class="flex items-center">
            <div class="flex flex-col">
                <h2 class="text-lg font-black text-gray-800 tracking-tight leading-none mb-1">
                    {{ pageTitle }}
                </h2>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-blue-500 font-bold tracking-widest uppercase"
                        >Overview</span
                    >
                    <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                    <span class="text-[10px] text-gray-400 font-medium">Dashboard</span>
                </div>
            </div>
        </div>

        <!-- 右侧：功能区 -->
        <div class="flex items-center gap-4">
            <!-- 消息中心 -->
            <div class="relative group">
                <div
                    class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100"
                >
                    <el-badge is-dot class="notification-badge" :offset="[2, 2]">
                        <el-icon
                            :size="20"
                            class="text-gray-500 group-hover:text-blue-600 transition-colors"
                            ><Bell
                        /></el-icon>
                    </el-badge>
                </div>
            </div>

            <!-- 分隔线 -->
            <div class="w-px h-6 bg-gray-100 mx-1"></div>

            <!-- 用户信息下拉菜单 -->
            <el-dropdown @command="handleCommand" trigger="click" placement="bottom-end">
                <div
                    class="flex items-center gap-3 cursor-pointer group p-1 pr-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-50"
                >
                    <div class="relative">
                        <el-avatar
                            :src="avatarUrl"
                            :size="36"
                            class="shadow-sm border-2 border-white group-hover:border-blue-100 transition-all"
                        />
                        <div
                            class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                        ></div>
                    </div>

                    <div class="hidden sm:flex flex-col items-start">
                        <span
                            class="text-sm font-bold text-gray-700 leading-tight group-hover:text-blue-600 transition-colors"
                            >{{ displayName }}</span
                        >
                        <span
                            class="text-[10px] text-gray-400 font-semibold uppercase tracking-tighter"
                            >Merchant</span
                        >
                    </div>

                    <el-icon
                        class="text-gray-400 group-hover:text-gray-600 transition-colors ml-1"
                        :size="14"
                        ><ArrowDown
                    /></el-icon>
                </div>

                <template #dropdown>
                    <el-dropdown-menu class="modern-header-menu">
                        <div class="px-4 py-3 border-b border-gray-50 mb-1">
                            <p
                                class="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest"
                            >
                                Account Status
                            </p>
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                                <p class="text-sm font-bold text-gray-700">Online</p>
                            </div>
                        </div>
                        <el-dropdown-item command="edit" :icon="User">个人资料</el-dropdown-item>
                        <el-dropdown-item
                            divided
                            command="logout"
                            :icon="SwitchButton"
                            class="logout-item"
                        >
                            退出登录
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>

        <!-- 对话框部分 -->
        <el-dialog
            v-model="editDialogVisible"
            title="编辑个人资料"
            width="500px"
            class="modern-dialog"
            :close-on-click-modal="false"
            align-center
        >
            <el-form :model="formData" :rules="rules" ref="profileFormRef" label-position="top">
                <!-- 第一行：昵称和头像 -->
                <div class="grid grid-cols-2 gap-6">
                    <el-form-item label="显示昵称" prop="nickname">
                        <el-input
                            v-model="formData.nickname"
                            placeholder="设置你的显示昵称"
                            class="modern-input"
                            clearable
                        />
                    </el-form-item>

                    <el-form-item label="头像地址" prop="avatarUrl">
                        <el-input
                            v-model="formData.avatarUrl"
                            placeholder="图片 URL 地址"
                            class="modern-input"
                            clearable
                        />
                    </el-form-item>
                </div>

                <!-- 第二行：手机号和邮箱 -->
                <div class="grid grid-cols-2 gap-6">
                    <el-form-item label="手机号" prop="phone">
                        <el-input
                            v-model="formData.phone"
                            placeholder="请输入手机号"
                            class="modern-input"
                            clearable
                        />
                    </el-form-item>

                    <el-form-item label="电子邮箱" prop="email">
                        <el-input
                            v-model="formData.email"
                            placeholder="请输入邮箱地址"
                            class="modern-input"
                            type="email"
                            clearable
                        />
                    </el-form-item>
                </div>

                <!-- 头像预览 -->
                <div
                    class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mt-4"
                >
                    <el-avatar
                        :src="formData.avatarUrl || DEFAULT_AVATAR"
                        :size="80"
                        class="shadow-2xl border-4 border-white mb-3"
                    />
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                        >Avatar Preview</span
                    >
                </div>
            </el-form>
            <template #footer>
                <div class="flex gap-3 pt-2">
                    <el-button @click="editDialogVisible = false" class="cancel-btn"
                        >取消</el-button
                    >
                    <el-button
                        type="primary"
                        @click="submitProfile"
                        :loading="submitLoading"
                        class="save-btn"
                    >
                        保存修改
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, reactive } from 'vue'
    import { useUserStore } from '@/stores/user'
    import { useRouter, useRoute } from 'vue-router'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import { Bell, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
    import { updateUserProfile } from '@/api/user'

    const userStore = useUserStore()
    const router = useRouter()
    const route = useRoute()

    const DEFAULT_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

    const editDialogVisible = ref(false)
    const submitLoading = ref(false)
    const profileFormRef = ref()

    const pageTitle = computed(() => (route.meta?.title as string) || '仪表盘')

    const avatarUrl = computed(() => {
        const avatar = userStore.avatarUrl
        return avatar && avatar.trim() !== '' ? avatar : DEFAULT_AVATAR
    })

    const displayName = computed(() => userStore.displayName)

    const formData = reactive({
        nickname: '',
        phone: '',
        email: '',
        avatarUrl: '',
    })

    const rules = {
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        phone: [
            {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入有效的手机号码',
                trigger: 'blur',
            },
        ],
        email: [
            {
                type: 'email',
                message: '请输入有效的邮箱地址',
                trigger: 'blur',
            },
        ],
    }

    const handleCommand = (command: string) => {
        if (command === 'edit') {
            onEditProfile()
        } else if (command === 'logout') {
            onLogout()
        }
    }

    const onEditProfile = () => {
        formData.nickname = userStore.nickname || ''
        formData.avatarUrl = userStore.avatarUrl || ''
        editDialogVisible.value = true
    }

    const submitProfile = async () => {
        try {
            const valid = await profileFormRef.value?.validate()
            if (!valid) return

            submitLoading.value = true

            // 调用API保存
            const profileData = {
                nickname: formData.nickname,
                phone: formData.phone || undefined,
                email: formData.email || undefined,
                avatar_url: formData.avatarUrl || undefined,
            }

            await updateUserProfile(userStore.uid, profileData)

            // 更新本地store
            userStore.updateProfile({
                nickname: formData.nickname,
                avatarUrl: formData.avatarUrl,
            })

            ElMessage({
                message: '个人资料已成功保存',
                type: 'success',
                plain: true,
            })
            editDialogVisible.value = false
        } catch {
            ElMessage.error('保存失败，请重试')
        } finally {
            submitLoading.value = false
        }
    }

    const onLogout = async () => {
        await ElMessageBox.confirm('您确定要退出当前管理系统吗？', '退出确认', {
            confirmButtonText: '退出登录',
            cancelButtonText: '取消',
            type: 'warning',
            customClass: 'modern-message-box',
        })

        cleanUserInfo()
        router.push('/login')
        ElMessage.success('已安全登出')
    }

    const cleanUserInfo = () => {
        const userStore = useUserStore()
        userStore.clearUser()
        localStorage.removeItem('token')
    }
</script>

<style scoped>
    /* 下拉菜单样式 */
    .modern-header-menu {
        border-radius: 18px;
        padding: 8px;
        border: 1px solid rgba(241, 245, 249, 0.8);
        box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.05),
            0 10px 10px -5px rgba(0, 0, 0, 0.02);
    }

    :deep(.el-dropdown-menu__item) {
        border-radius: 12px;
        padding: 10px 16px;
        margin: 2px 0;
        font-weight: 600;
        font-size: 13px;
        color: #64748b;
        transition: all 0.2s;
    }

    :deep(.el-dropdown-menu__item:hover) {
        background-color: #f8fafc;
        color: #3b82f6;
    }

    .logout-item {
        color: #f43f5e !important;
    }

    .logout-item:hover {
        background-color: #fff1f2 !important;
    }

    /* 弹窗样式调整 */
    :deep(.modern-dialog) {
        border-radius: 28px;
    }

    :deep(.modern-dialog .el-dialog__header) {
        margin-right: 0;
        padding: 30px 30px 10px;
    }

    :deep(.modern-dialog .el-dialog__title) {
        font-weight: 900;
        font-size: 20px;
        color: #1e293b;
        letter-spacing: -0.025em;
    }

    :deep(.modern-input .el-input__wrapper) {
        border-radius: 14px;
        box-shadow: none;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 6px 14px;
    }

    :deep(.modern-input .el-input__wrapper.is-focus) {
        border-color: #3b82f6;
        background-color: #fff;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
    }

    :deep(.el-form-item__label) {
        font-weight: 700;
        color: #475569;
        font-size: 13px;
        margin-bottom: 8px;
        padding-left: 4px;
    }

    /* 按钮样式 */
    .cancel-btn {
        flex: 1;
        height: 44px;
        border-radius: 14px !important;
        font-weight: 600;
    }

    .save-btn {
        flex: 1;
        height: 44px;
        border-radius: 14px !important;
        background: #3b82f6 !important;
        border: none !important;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

    .save-btn:hover {
        background: #2563eb !important;
        transform: translateY(-1px);
        box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
    }

    /* 全局消息框样式 */
    :global(.modern-message-box) {
        border-radius: 24px !important;
        border: none !important;
    }

    :global(.modern-message-box .el-message-box__header) {
        padding: 24px 24px 12px !important;
    }

    :global(.modern-message-box .el-message-box__title) {
        font-weight: 800 !important;
        color: #1e293b !important;
    }

    :global(.modern-message-box .el-message-box__btns) {
        padding: 12px 24px 24px !important;
    }

    :global(.modern-message-box .el-button) {
        border-radius: 12px !important;
        height: 40px !important;
        padding: 0 20px !important;
        font-weight: 600 !important;
    }

    :global(.notification-badge .el-badge__content.is-fixed.is-dot) {
        right: 4px;
        top: 4px;
        border: 2px solid white;
    }
</style>
