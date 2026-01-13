<template>
    <!-- 添加/编辑轮播图对话框（内部只负责表单与抛事件，API 交给父组件） -->
    <el-dialog :model-value="visible" :title="dialogTitle" width="520px" @close="handleClose">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="图片" prop="imageUrl">
                <!-- 有图片时：点击更换图片 -->
                <div
                    v-if="form.imageUrl"
                    class="image-preview-wrapper clickable"
                    @click="triggerUpload"
                >
                    <img :src="form.imageUrl" alt="banner" class="preview-image" />
                    <div class="replace-overlay">
                        <el-icon :size="30" color="#fff">
                            <Edit />
                        </el-icon>
                        <div style="margin-top: 8px; font-size: 12px; color: #fff">点击更换</div>
                    </div>
                </div>

                <!-- 无图片时显示上传组件 -->
                <el-upload
                    v-else
                    ref="uploadRef"
                    :file-list="fileList"
                    list-type="picture-card"
                    :show-file-list="false"
                    :auto-upload="false"
                    :before-upload="beforeUpload"
                    accept="image/*"
                >
                    <el-icon><Plus /></el-icon>
                </el-upload>

                <!-- 隐藏的上传触发器，用于编辑模式点击图片更换 -->
                <input
                    ref="hiddenFileInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleFileChange"
                />
            </el-form-item>

            <el-form-item label="关联商品" prop="goodsId">
                <div style="display: flex; gap: 8px; align-items: center">
                    <el-input v-model="form.goodsName" placeholder="请选择商品" readonly />
                    <el-button @click="pickerVisible = true">选择商品</el-button>
                </div>
            </el-form-item>

            <el-form-item label="是否推荐" prop="isRecommend">
                <el-switch
                    v-model="form.isRecommend"

                />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
        </template>
    </el-dialog>

    <!-- 关联商品选择器 -->
    <GoodsPicker
        v-model:visible="pickerVisible"
        :initialSelectedId="form.goodsId"
        @confirm="onPickerConfirm"
    />
</template>

<script setup lang="ts">
    import { ref, watch, computed } from 'vue'
    import type { BannerItem } from '@/api/admin/banner'
    import { ElMessage } from 'element-plus'
    import { Plus, Edit } from '@element-plus/icons-vue'
    import GoodsPicker from './GoodsPicker.vue'

    const props = defineProps<{
        visible: boolean
        banner?: Partial<BannerItem> | null
        loading?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:visible', val: boolean): void
        (e: 'confirm', data: Partial<BannerItem>): void
    }>()

    const form = ref<Partial<BannerItem>>({
        imageUrl: '',
        goodsId: '',
        goodsName: '',
        isRecommend: true,
    })

    const formRef = ref()
    const hiddenFileInput = ref<HTMLInputElement>()

    const pickerVisible = ref(false)

    const loading = computed(() => !!props.loading)
    const dialogTitle = computed(() => (form.value.id ? '编辑轮播图' : '添加轮播图'))

    // 简单校验规则（创建时 goodsId 为必填）
    const rules = {
        imageUrl: [{ required: true, message: '请上传图片', trigger: 'blur' }],
        goodsId: [{ required: true, message: '请选择关联商品', trigger: 'change' }],
    }

    const resetForm = async () => {
        form.value = {
            imageUrl: '',
            goodsId: '',
            goodsName: '',
            isRecommend: true,
        }
        await formRef.value?.clearValidate?.()
    }

    const fillFromBanner = (b: Partial<BannerItem>) => {
        // 统一转换为 boolean 类型
        let recommendValue: boolean
        if (b.isRecommend !== undefined && b.isRecommend !== null) {
            if (typeof b.isRecommend === 'boolean') {
                recommendValue = b.isRecommend
            } else {
                recommendValue = Number(b.isRecommend) === 1
            }
        } else {
            recommendValue = true
        }



        form.value = {
            id: b.id,
            imageUrl: b.imageUrl ?? '',
            goodsId: b.goodsId !== undefined && b.goodsId !== null ? String(b.goodsId) : '',
            goodsName: b.goodsName ?? '',
            isRecommend: recommendValue,
        }



        // 不强制清校验：如果父组件切换编辑对象，避免残留错误提示
        formRef.value?.clearValidate?.()
    }

    // 关键修复：
    // 1) 不要用 visibleLocal 做"半受控"状态，否则容易导致对话框显示状态与父组件不同步
    // 2) 打开时根据 banner 回填/重置；关闭时重置，避免下次打开残留
    watch(
        () => props.visible,
        async (v) => {
            if (v) {
                if (props.banner) {
                    fillFromBanner(props.banner)
                    // 更新 fileList 以显示图片
                    if (props.banner.imageUrl) {
                        fileList.value = [
                            { name: 'image', url: props.banner.imageUrl, uid: Date.now() },
                        ]
                    } else {
                        fileList.value = []
                    }
                } else {
                    await resetForm()
                    fileList.value = []
                }
            } else {
                await resetForm()
                fileList.value = []
            }
        },
        { immediate: true },
    )

    // 弹窗打开期间如果切换 banner（比如从列表切换编辑另一条），立即回填
    watch(
        () => props.banner,
        (b) => {
            if (!props.visible) return
            if (b) {
                fillFromBanner(b)
                // 更新 fileList 以显示图片
                if (b.imageUrl) {
                    fileList.value = [{ name: 'image', url: b.imageUrl, uid: Date.now() }]
                } else {
                    fileList.value = []
                }
            } else {
                resetForm()
                fileList.value = []
            }
        },
    )

    // Upload handling: keep images locally as base64 preview, prevent auto upload
    interface FileItem {
        name: string
        url: string
        uid: number
    }
    const fileList = ref<FileItem[]>([])

    const processFile = (file: File) => {
        const isImage = file.type.startsWith('image/')
        if (!isImage) {
            ElMessage.warning('只能上传图片文件')
            return false
        }
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isLt2M) {
            ElMessage.warning('图片大小不能超过 2MB')
            return false
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            const newData = e.target?.result as string
            form.value.imageUrl = newData
            fileList.value = [{ name: file.name, url: newData, uid: Date.now() }]
        }
        reader.readAsDataURL(file)
        return true
    }

    const beforeUpload = (file: File) => {
        processFile(file)
        // 返回 false 阻止 element-plus 自动上传
        return false
    }

    // 编辑模式：触发隐藏的文件输入框
    const triggerUpload = () => {
        hiddenFileInput.value?.click()
    }

    // 编辑模式：处理文件选择
    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement
        const file = target.files?.[0]
        if (file) {
            processFile(file)
        }
        // 清空 input，允许选择同一个文件
        target.value = ''
    }

    // 从 GoodsPicker 返回的选择
    const onPickerConfirm = (payload: { goodsId: string | number; goodsName: string }) => {
        form.value.goodsId = String(payload.goodsId)
        form.value.goodsName = payload.goodsName
        // 清除 goodsId 的校验错误（若之前显示过）
        formRef.value?.clearValidate?.('goodsId')
        pickerVisible.value = false
    }

    // 仅负责校验 + 抛出事件；父组件负责 add/update API
    const handleConfirm = async () => {
        formRef.value?.validate?.((valid: boolean) => {
            if (!valid) return
            // 构建提交负载：保留必需字段，但移除用于展示的 goodsName
            const payload = { ...(form.value as Partial<BannerItem>) } as Partial<BannerItem>
            delete (payload as Record<string, unknown>).goodsName
            emit('confirm', payload)
        })
    }

    const handleClose = () => {
        emit('update:visible', false)
    }
</script>

<style scoped>
    .image-preview-wrapper {
        position: relative;
        width: 148px;
        height: 148px;
        border-radius: 4px;
        overflow: hidden;
        cursor: default;
    }

    .image-preview-wrapper.clickable {
        cursor: pointer;
    }

    .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
    }

    .replace-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .image-preview-wrapper.clickable:hover .replace-overlay {
        opacity: 1;
    }
</style>
