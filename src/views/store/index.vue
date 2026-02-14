<template>
    <div class="p-6 bg-[#f4f7fe] min-h-screen overflow-y-auto text-[#2d3748]">
        <div class="max-w-4xl mx-auto">
            <!-- 主体配置卡片 -->
            <div
                class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md mb-8"
                v-loading="loading"
            >
                <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
                    <!-- 店铺横幅区域 -->
                    <div class="mb-12">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <el-icon><Picture /></el-icon>店铺横幅
                            </h3>
                            <span class="text-xs text-gray-400"
                                >建议尺寸 1200x600，支持 JPG/PNG/WebP</span
                            >
                        </div>

                        <div class="banner-upload-wrapper w-full group relative">
                            <div
                                class="banner-preview h-72 w-full rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative transition-all group-hover:border-blue-400"
                            >
                                <img
                                    v-if="formData.banner"
                                    :src="formData.banner"
                                    class="w-full h-full object-cover"
                                />
                                <div v-else class="flex flex-col items-center text-gray-400">
                                    <el-icon :size="48" class="mb-3"><PictureFilled /></el-icon>
                                    <span class="text-sm">点击或拖拽上传店铺横幅</span>
                                </div>

                                <!-- 悬浮遮罩 -->
                                <div
                                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <el-upload
                                        action="#"
                                        :show-file-list="false"
                                        :http-request="
                                            (options: any) => handleUpload(options, 'banner')
                                        "
                                        :before-upload="beforeUpload"
                                    >
                                        <el-button type="primary" class="rounded-xl! px-6"
                                            >更换横幅图片</el-button
                                        >
                                    </el-upload>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-12">
                        <!-- 左侧：头像上传 -->
                        <div class="md:col-span-4 flex flex-col items-center">
                            <div class="w-full flex flex-col items-center mb-6">
                                <h3
                                    class="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1"
                                >
                                    <el-icon><Camera /></el-icon>店铺头像
                                </h3>
                                <p class="text-xs text-gray-400">展示在店铺主页的品牌标识</p>
                            </div>

                            <div class="relative group avatar-upload-wrapper">
                                <!-- 头像容器：增加白色边框和阴影 -->
                                <div class="avatar-container">
                                    <el-avatar
                                        :size="160"
                                        :src="formData.avatarUrl"
                                        class="bg-gray-50! shop-avatar"
                                    >
                                        <el-icon :size="80" class="text-gray-400"
                                            ><ShoppingBag
                                        /></el-icon>
                                    </el-avatar>
                                </div>

                                <!-- 上传遮罩：确保完全覆盖且圆润 -->
                                <el-upload
                                    class="avatar-uploader-overlay"
                                    action="#"
                                    :show-file-list="false"
                                    :http-request="
                                        (options: any) => handleUpload(options, 'avatarUrl')
                                    "
                                    :before-upload="beforeUpload"
                                >
                                    <div class="overlay-content">
                                        <el-icon :size="28"><CameraFilled /></el-icon>
                                        <span class="text-xs mt-2 font-medium">更换头像</span>
                                    </div>
                                </el-upload>
                            </div>
                            <div class="mt-6 text-center">
                                <p class="text-xs text-gray-400 leading-relaxed">
                                    支持 JPG/PNG/WebP
                                </p>
                                <p class="text-xs text-gray-400 leading-relaxed">
                                    文件大小不超过 2MB
                                </p>
                            </div>
                        </div>

                        <!-- 右侧：基本信息表单 -->
                        <div class="md:col-span-8 space-y-8">
                            <el-form-item label="店铺名称" prop="name">
                                <el-input
                                    v-model="formData.name"
                                    placeholder="请输入您的店铺名称"
                                    maxlength="50"
                                    show-word-limit
                                    class="custom-input"
                                />
                            </el-form-item>

                            <el-form-item label="店铺简介" prop="info">
                                <el-input
                                    v-model="formData.info"
                                    type="textarea"
                                    :rows="8"
                                    placeholder="请简要介绍您的店铺主营业务、特色等信息..."
                                    maxlength="200"
                                    show-word-limit
                                    class="custom-input"
                                />
                            </el-form-item>
                        </div>
                    </div>
                </el-form>
            </div>

            <!-- 底部操作栏 -->
            <div class="flex justify-end items-center gap-4">
                <el-button
                    class="rounded-xl! px-8 h-12! font-bold bg-white! text-gray-500! border-gray-200! hover:border-blue-400! hover:text-blue-500! transition-all"
                    @click="fetchStoreData"
                >
                    重置
                </el-button>
                <el-button
                    type="primary"
                    :loading="submitting"
                    class="rounded-xl! px-12 h-12! font-bold shadow-lg shadow-blue-100"
                    @click="handleSubmit"
                >
                    保存所有修改
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, reactive } from 'vue'
    import { ElMessage } from 'element-plus'
    import {
        Shop,
        Picture,
        Camera,
        PictureFilled,
        CameraFilled,
        ShoppingBag,
    } from '@element-plus/icons-vue'
    import type { FormInstance } from 'element-plus'
    import { useUserStore } from '@/stores/user'
    import { getMyStoreInfo, updateStore, type StoreInfo } from '@/api/store'
    import { uploadImage } from '@/api/common'

    const userStore = useUserStore()
    const formRef = ref<FormInstance>()
    const loading = ref(false)
    const submitting = ref(false)

    const formData = reactive<StoreInfo>({
        id: '',
        name: '',
        info: '',
        avatarUrl: '',
        banner: '',
    })

    const rules = {
        name: [
            { required: true, message: '请输入店铺名称', trigger: 'blur' },
            { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
        ],
        info: [{ required: true, message: '请输入店铺简介', trigger: 'blur' }],
    }

    /**
     * 获取店铺信息
     */
    const fetchStoreData = async () => {
        loading.value = true
        try {
            const res = await getMyStoreInfo()
            if (res.data) {
                const data = res.data
                formData.id = data.id
                formData.name = data.name
                formData.info = data.info
                formData.avatarUrl = data.avatarUrl
                formData.banner = data.banner || ''
            }
        } catch (error) {
            console.error('获取店铺信息失败:', error)
            ElMessage.error('加载店铺信息失败')
        } finally {
            loading.value = false
        }
    }

    /**
     * 上传前校验
     */
    const beforeUpload = (file: File) => {
        const isImg = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
        const isLt2M = file.size / 1024 / 1024 < 2

        if (!isImg) {
            ElMessage.error('上传图片只能是 JPG/PNG/WebP 格式!')
            return false
        }
        if (!isLt2M) {
            ElMessage.error('上传图片大小不能超过 2MB!')
            return false
        }
        return true
    }

    /**
     * 处理图片上传
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpload = async (options: any, field: 'avatarUrl' | 'banner') => {
        const uploadFormData = new FormData()
        uploadFormData.append('file', options.file)

        try {
            const res = await uploadImage(uploadFormData)
            if (res.data && res.data.url) {
                formData[field] = res.data.url
                ElMessage.success('上传成功')
            }
        } catch (error) {
            console.error('上传失败:', error)
            ElMessage.error('图片上传失败')
        }
    }

    /**
     * 提交修改
     */
    const handleSubmit = async () => {
        if (!formRef.value) return

        await formRef.value.validate(async (valid) => {
            if (valid) {
                submitting.value = true
                try {
                    updateStore(formData.id, {
                        name: formData.name,
                        info: formData.info,
                        avatarUrl: formData.avatarUrl,
                        banner: formData.banner,
                    })
                    ElMessage.success('店铺信息更新成功')

                    // 同步更新 userStore 中的店铺名称
                    userStore.setUser({ storeName: formData.name })
                } catch (error) {
                    console.error('更新失败:', error)
                    ElMessage.error('店铺信息更新失败')
                } finally {
                    submitting.value = false
                }
            }
        })
    }

    onMounted(() => {
        fetchStoreData()
    })
</script>

<style scoped>
    /* 头像上传区域重构 */
    .avatar-upload-wrapper {
        position: relative;
        width: 176px;
        height: 176px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .avatar-container {
        width: 176px;
        height: 176px;
        background: #fff;
        border-radius: 50%;
        padding: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        border: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .avatar-upload-wrapper:hover .avatar-container {
        border-color: #3b82f6;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
    }

    .avatar-uploader-overlay {
        position: absolute;
        inset: 8px;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
        z-index: 10;
    }

    :deep(.avatar-uploader-overlay .el-upload) {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
    }

    .overlay-content {
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.3s ease;
        backdrop-filter: blur(2px);
    }

    .avatar-upload-wrapper:hover .overlay-content {
        opacity: 1;
    }

    .shop-avatar {
        border: 2px solid #f8fafc;
    }

    .custom-input :deep(.el-input__wrapper),
    .custom-input :deep(.el-textarea__inner) {
        border-radius: 12px !important;
        background-color: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        box-shadow: none !important;
        transition: all 0.2s ease;
        padding: 12px 16px !important;
    }

    .custom-input :deep(.el-input__wrapper.is-focus),
    .custom-input :deep(.el-textarea__inner:focus) {
        background-color: #ffffff !important;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
    }

    :deep(.el-form-item__label) {
        font-weight: 700 !important;
        color: #4b5563 !important;
        margin-bottom: 0.75rem !important;
        font-size: 0.875rem !important;
    }

    /* 隐藏滚动条但保持可滚动 */
    .overflow-y-auto {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .overflow-y-auto::-webkit-scrollbar {
        display: none;
    }
</style>
