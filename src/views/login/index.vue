<template>
    <div class="flex min-h-screen bg-[#f4f7fe]">
        <!-- 左侧：品牌展示区 -->
        <div
            class="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#409eff] to-[#337ecc] p-12 flex-col justify-between text-white relative overflow-hidden z-10 shadow-[10px_0_40px_rgba(0,0,0,0.1)]"
        >
            <!-- 装饰性背景元素 -->
            <div
                class="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"
            ></div>
            <div
                class="absolute bottom-[-5%] left-[-5%] w-96 h-96 bg-black/10 rounded-full blur-3xl"
            ></div>

            <div class="relative z-10">
                <div class="flex items-center gap-3 mb-8">
                    <div
                        class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg"
                    >
                        <el-icon :size="24" color="#409eff"><Shop /></el-icon>
                    </div>
                    <span class="text-2xl font-bold tracking-wider">Online Shop</span>
                </div>

                <div class="mt-20">
                    <h1 class="text-5xl font-extrabold mb-6 leading-tight drop-shadow-lg">
                        管理您的业务<br />
                        <span class="text-blue-100">从未如此简单</span>
                    </h1>
                    <p
                        class="text-lg text-blue-50 max-w-md leading-relaxed opacity-90 drop-shadow-md"
                    >
                        集成化的电商管理平台，为您提供实时数据分析、订单追踪及高效的库存管理方案。
                    </p>
                </div>
            </div>

            <div class="relative z -10 flex items-center gap-6 text-sm text-blue-100/80">
                <span>© 2024 Cloud Mall Platform</span>
                <div class="w-1 h-1 bg-blue-100/40 rounded-full"></div>
                <span>隐私政策</span>
                <div class="w-1 h-1 bg-blue-100/40 rounded-full"></div>
                <span>服务条款</span>
            </div>
        </div>

        <!-- 右侧：表单操作区 -->
        <div
            class="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white border-l border-gray-100"
        >
            <div class="w-full max-w-105">
                <!-- 顶部标题 -->
                <div class="flex flex-col items-center lg:items-start mb-12">
                    <h2 class="text-4xl font-bold text-gray-800 mb-4">账号登录</h2>
                    <p class="text-gray-500 text-lg">欢迎使用 Online Shop 后台管理系统</p>
                </div>

                <!-- 登录表单 -->
                <el-form
                    :model="loginForm"
                    label-position="top"
                    size="large"
                    @keyup.enter="submitLoginForm"
                >
                    <el-form-item label="用户名">
                        <el-input
                            v-model="loginForm.username"
                            placeholder="请输入用户名"
                            :prefix-icon="User"
                            class="custom-input"
                        />
                    </el-form-item>

                    <el-form-item label="密码">
                        <el-input
                            v-model="loginForm.password"
                            type="password"
                            placeholder="请输入密码"
                            :prefix-icon="Lock"
                            show-password
                            class="custom-input"
                        />
                    </el-form-item>

                    <div class="flex justify-between items-center mb-8">
                        <el-checkbox v-model="rememberMe" label="记住我" />
                    </div>

                    <el-button
                        type="primary"
                        @click="submitLoginForm"
                        class="login-btn w-full h-14! rounded-xl! font-bold text-lg tracking-[2px]"
                        :loading="loading"
                    >
                        立即登录
                    </el-button>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { reactive, ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { ElMessage } from 'element-plus'
    import { User, Lock, Shop } from '@element-plus/icons-vue'
    import { useUserStore } from '@/stores/user'
    import { login } from '@/api/auth'
    import { getMerchantInfo } from '@/api/store'

    interface LoginForm {
        username: string
        password: string
    }

    const loading = ref(false)
    const rememberMe = ref(false)

    const loginForm = reactive<LoginForm>({
        username: '',
        password: '',
    })

    const router = useRouter()
    const userStore = useUserStore()

    async function submitLoginForm() {
        if (!loginForm.username || !loginForm.password) {
            ElMessage.warning('请填写用户名、密码')
            return
        }

        loading.value = true
        try {
            const res = await login({
                username: loginForm.username,
                password: loginForm.password,
            })
            userStore.setToken(res.data.token)

            const merchantRes = await getMerchantInfo()
            const merchantData = merchantRes.data
            console.log(merchantData)
            userStore.setUser(merchantData)
            ElMessage.success('登录成功')
            router.push('/')
        } finally {
            loading.value = false
        }
    }
</script>

<style scoped>
    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
        background-color: #fff !important;
        box-shadow: none !important;
        border: 1px solid #dcdfe6 !important;
        border-radius: 12px !important;
        padding: 8px 16px !important;
        transition: all 0.2s !important;
    }

    :deep(.el-input__wrapper.is-focus),
    :deep(.el-select__wrapper.is-focused) {
        border-color: #409eff !important;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1) !important;
    }

    :deep(.el-input__inner) {
        height: 28px !important;
    }

    :deep(.el-select__wrapper) {
        min-height: 46px !important;
        line-height: 28px !important;
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #4a5568;
        margin-bottom: 6px !important;
    }

    .login-btn {
        background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
        border: none;
        border-radius: 12px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
    }

    .login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(64, 158, 255, 0.4);
        opacity: 0.9;
    }

    .login-btn:active {
        transform: translateY(0);
        box-shadow: 0 4px 10px rgba(64, 158, 255, 0.2);
    }

    .register-link {
        font-weight: 600 !important;
        color: #409eff !important;
        transition: all 0.3s;
    }

    .register-link:hover {
        color: #337ecc !important;
        text-decoration: underline;
    }

    :deep(.el-checkbox__label) {
        color: #718096;
        font-weight: 500;
    }

    :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
        color: #409eff;
    }

    :deep(.el-checkbox__inner) {
        border-radius: 4px;
        width: 16px;
        height: 16px;
    }
</style>
