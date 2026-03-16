<template>
    <div class="step2-container">
        <el-form
            :model="publishStore.formData"
            :rules="rules"
            ref="formRef"
            label-position="left"
            label-width="120px"
        >
            <!-- 基本信息 -->
            <el-card shadow="never" class="mb-6 border-none rounded-xl">
                <template #header>
                    <div class="font-bold text-lg text-gray-800">基本信息</div>
                </template>
                <div class="px-12 py-6">
                    <el-form-item label="商品名称" prop="goodsName">
                        <el-input
                            v-model="publishStore.formData.goodsName"
                            placeholder="请输入商品名称"
                            maxlength="30"
                            show-word-limit
                            class="w-full!"
                        />
                    </el-form-item>
                    <el-form-item label="商品分类" prop="categoryId">
                        <el-cascader
                            v-model="publishStore.formData.categoryId"
                            :options="categoryTree"
                            :props="{
                                label: 'name',
                                value: 'id',
                                children: 'children',
                                emitPath: false,
                            }"
                            placeholder="请选择分类"
                            class="w-full!"
                        />
                    </el-form-item>
                    <el-form-item label="商品单位" prop="unitId">
                        <el-select
                            v-model="publishStore.formData.unitId"
                            placeholder="请选择商品单位"
                            class="w-full!"
                        >
                            <el-option
                                v-for="unit in unitList"
                                :key="unit.id"
                                :label="unit.name"
                                :value="unit.id"
                            />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="商品简介" prop="sellPoint" required>
                        <el-input
                            v-model="publishStore.formData.sellPoint"
                            placeholder="请输入商品详细介绍..."
                            maxlength="30"
                            show-word-limit
                            class="w-full!"
                            required
                        />
                    </el-form-item>

                    <!-- 商品展示图 -->
                    <el-form-item label="商品展示图" prop="mainImg">
                        <div class="flex flex-col gap-2.5">
                            <draggable
                                v-model="displayFileList"
                                item-key="uid"
                                class="flex flex-wrap gap-4"
                            >
                                <template #item="{ element: file, index }">
                                    <li
                                        class="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 relative group list-none"
                                    >
                                        <img :src="file.url" class="w-full h-full object-cover" />
                                        <div
                                            v-if="index === 0"
                                            class="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-br-lg z-10"
                                        >
                                            主图
                                        </div>
                                        <div
                                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20"
                                        >
                                            <el-icon
                                                class="text-white cursor-pointer text-xl"
                                                @click.stop="handlePictureCardPreview(file)"
                                                ><ZoomIn
                                            /></el-icon>
                                            <el-icon
                                                class="text-white cursor-pointer text-xl"
                                                @click.stop="removeDisplayImage(index)"
                                                ><Delete
                                            /></el-icon>
                                        </div>
                                    </li>
                                </template>
                                <template #footer>
                                    <el-upload
                                        v-if="displayFileList.length < MAX_DISPLAY_IMAGES"
                                        action="#"
                                        list-type="picture-card"
                                        :auto-upload="false"
                                        :show-file-list="false"
                                        :on-change="uploadDisplayImage"
                                        class="upload-trigger"
                                    >
                                        <div class="flex flex-col items-center justify-center">
                                            <el-icon><Plus /></el-icon>
                                            <span class="text-xs mt-1">上传展示图</span>
                                        </div>
                                    </el-upload>
                                </template>
                            </draggable>
                            <div class="mt-2 text-gray-400 text-xs flex items-center">
                                <el-icon class="mr-1"><InfoFilled /></el-icon>
                                {{
                                    `至少上传 1 张，最多上传 ${MAX_DISPLAY_IMAGES} 张展示图,
                                第一张为主图. 支持拖拽交换图片顺序`
                                }}
                            </div>
                        </div>
                    </el-form-item>

                    <!-- 商品详情图 -->
                    <el-form-item label="商品详情图" prop="descriptionImgList">
                        <div class="flex flex-col gap-2.5">
                            <draggable
                                v-model="detailFileList"
                                item-key="uid"
                                class="flex flex-wrap gap-4"
                            >
                                <template #item="{ element: file, index }">
                                    <li
                                        class="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 relative group list-none"
                                    >
                                        <img :src="file.url" class="w-full h-full object-cover" />
                                        <div
                                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20"
                                        >
                                            <el-icon
                                                class="text-white cursor-pointer text-xl"
                                                @click.stop="handlePictureCardPreview(file)"
                                                ><ZoomIn
                                            /></el-icon>
                                            <el-icon
                                                class="text-white cursor-pointer text-xl"
                                                @click.stop="removeDetailImage(index)"
                                                ><Delete
                                            /></el-icon>
                                        </div>
                                    </li>
                                </template>
                                <template #footer>
                                    <el-upload
                                        v-if="detailFileList.length < MAX_DETAIL_IMAGES"
                                        action="#"
                                        list-type="picture-card"
                                        :auto-upload="false"
                                        :show-file-list="false"
                                        :on-change="uploadDetailImage"
                                        class="upload-trigger"
                                    >
                                        <div class="flex flex-col items-center justify-center">
                                            <el-icon><Plus /></el-icon>
                                            <span class="text-xs mt-1">上传详情图</span>
                                        </div>
                                    </el-upload>
                                </template>
                            </draggable>

                            <div class="mt-2 text-gray-400 text-xs flex items-center">
                                <el-icon class="mr-1"><InfoFilled /></el-icon>
                                {{
                                    `至少上传 1 张，最多上传 ${MAX_DETAIL_IMAGES}
                                张商品详情图，建议宽度 750px`
                                }}
                            </div>
                        </div>
                    </el-form-item>

                    <!-- 商品状态 -->
                    <el-form-item prop="status">
                        <template #label>
                            <div class="flex items-center gap-1">
                                <span>商品状态</span>
                                <el-tooltip
                                    content="上架后商品将立即在商城中对用户可见"
                                    placement="top"
                                >
                                    <el-icon class="text-gray-400 cursor-help"
                                        ><InfoFilled
                                    /></el-icon>
                                </el-tooltip>
                            </div>
                        </template>

                        <CapsuleToggle
                            v-model="publishStore.formData.status"
                            :options="[
                                { label: '立即上架', value: true },
                                { label: '暂不上架', value: false },
                            ]"
                        />
                    </el-form-item>
                </div>
            </el-card>

            <!-- 规格与库存设置 -->
            <SkuSpecification
                v-model:specifications="internalSpecifications"
                v-model:sku-list="internalSkuList"
            />

            <!-- 底部操作栏 -->
            <div class="flex justify-center gap-6 mt-10 pb-20">
                <el-button size="large" class="w-40 rounded-xl!" @click="handlePrevClick"
                    >上一步</el-button
                >
                <el-button
                    type="primary"
                    size="large"
                    class="w-40 rounded-xl! shadow-lg shadow-blue-200"
                    :loading="submitting"
                    @click="handleSubmit"
                >
                    提交发布
                </el-button>
            </div>
        </el-form>

        <!-- 图片预览 -->
        <el-dialog v-model="previewVisible" title="图片预览" width="50%" center>
            <img :src="previewImageUrl" class="w-full rounded-lg" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue'
    import { Plus, ZoomIn, Delete, InfoFilled } from '@element-plus/icons-vue'
    import draggable from 'vuedraggable'
    import { ElMessage, ElMessageBox, ElNotification, type UploadFile } from 'element-plus'
    import { useGoodsPublishStore } from '@/stores/goodsPublish'
    import CapsuleToggle from '@/components/CapsuleToggle.vue'
    import SkuSpecification from './SkuSpecification.vue'
    import { uploadImage, type FileMeta } from '@/api/common'
    import type { CategoryNode } from '@/api/category'
    import type { Unit } from '@/api/unit'
    import { urlsToImages } from '@/utils/image'

    interface Props {
        categoryTree: CategoryNode[]
        unitList: Unit[]
        submitting: boolean
    }
    defineProps<Props>()
    const publishStore = useGoodsPublishStore()
    const MAX_DISPLAY_IMAGES = 5
    const MAX_DETAIL_IMAGES = 8

    const emit = defineEmits<{
        (e: 'prev'): void
        (e: 'submit'): void
    }>()

    const handlePrevClick = async () => {
        if (!publishStore.isFormDataEmpty()) {
            await ElMessageBox.confirm('返回后将清空已填写的内容，确定要返回吗？', '返回确认', {
                confirmButtonText: '确定返回',
                cancelButtonText: '继续编辑',
                type: 'warning',
            })
        }
        emit('prev')
    }

    const formRef = ref()
    const previewVisible = ref(false)
    const previewImageUrl = ref('')

    const displayFileList = computed({
        get: () => publishStore.displayImages,
        set: (val) => {
            publishStore.updateFormData({ displayImages: val })
        },
    })

    const detailFileList = computed({
        get: () => publishStore.descriptionImgList,
        set: (val) => {
            publishStore.updateFormData({ descriptionImages: val })
        },
    })

    const internalSpecifications = computed({
        get: () => publishStore.specifications,
        set: (val) => publishStore.updateFormData({ specifications: val }),
    })

    const internalSkuList = computed({
        get: () => publishStore.skuList,
        set: (val) => publishStore.updateFormData({ skus: val }),
    })

    const rules = {
        goodsName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
        unitId: [{ required: true, message: '请选择计价单位', trigger: 'change' }],
        sellPoint: [{ required: true, message: '请填写商品卖点', trigger: 'blur' }],
        displayImages: [
            {
                required: true,
                message: '请至少上传一张商品展示图(第一张是主图)',
                trigger: 'change',
            },
        ],
        descriptionImages: [
            {
                required: true,
                message: '请至少上传一张商品详情图',
                trigger: 'change',
            },
        ],
    }

    // 图片预览
    const handlePictureCardPreview = (file: FileMeta) => {
        previewImageUrl.value = file.url
        previewVisible.value = true
    }

    // 通用图处理逻辑
    const handleImageUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        const res = await uploadImage(formData)
        const uploadedImage = res.data

        // 使用工具函数的 uid 生成策略，保持一致性
        // 通过创建一个临时 Image 数组来复用工具函数的逻辑
        const images = urlsToImages([uploadedImage.url])
        const imageWithUid = images[0]

        if (!imageWithUid) {
            throw new Error('Failed to generate Image object from URL')
        }

        return {
            uid: imageWithUid.uid,
            name: uploadedImage.name || file.name,
            url: uploadedImage.url,
        }
    }

    const removeDisplayImage = (index: number) => {
        const newList = displayFileList.value.filter((_, i) => i !== index)
        displayFileList.value = newList
    }

    const removeDetailImage = (index: number) => {
        const newList = detailFileList.value.filter((_, i) => i !== index)
        detailFileList.value = newList
    }

    // 展示图处理
    const uploadDisplayImage = async (uploadFile: UploadFile) => {
        const file = uploadFile.raw
        if (!file || !validateImage(file)) return

        const uploadedFile = await handleImageUpload(file)
        displayFileList.value = [...displayFileList.value, uploadedFile]
    }

    // 详情图处理
    const uploadDetailImage = async (uploadFile: UploadFile) => {
        const file = uploadFile.raw
        if (!file || !validateImage(file)) return

        const uploadedFile = await handleImageUpload(file)
        detailFileList.value = [...detailFileList.value, uploadedFile]
    }

    const validateImage = (file: File) => {
        const isImage = file.type.startsWith('image/')
        const isLt2M = file.size / 1024 / 1024 < 2

        if (!isImage) {
            ElMessage.error('只能上传图片文件!')
            return false
        }
        if (!isLt2M) {
            ElMessage.error('图片大小不能超过 2MB!')
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        try {
            await formRef.value.validate()
            emit('submit')
        } catch {
            ElNotification.error({
                title: '提交失败',
                message: '存在没有填写的表单内容',
            })
        }
    }

    onMounted(() => {
        publishStore.ensureLoadBaseData()
    })
</script>

<style scoped>
    /* 修复左侧对齐时，必填项星号导致的文本不齐问题 */
    :deep(.el-form-item__label) {
        position: relative;
        padding-left: 12px !important;
    }

    :deep(.el-form-item.is-required > .el-form-item__label::before) {
        position: absolute;
        left: 0;
        margin-right: 0 !important;
    }

    .upload-trigger :deep(.el-upload--picture-card) {
        width: 128px;
        height: 128px;
        border-radius: 12px;
    }
</style>
