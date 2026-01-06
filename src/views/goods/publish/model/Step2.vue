<template>
    <div class="step2-container">
        <el-form :model="formData" :rules="rules" ref="formRef" label-position="left">
            <!-- 基本信息 -->
            <el-card shadow="never" class="mb-6 border-none rounded-xl">
                <template #header>
                    <div class="font-bold text-lg text-gray-800">基本信息</div>
                </template>
                <div class="px-2.5">
                    <el-form-item label="商品名称" prop="name">
                        <el-input
                            v-model="formData.name"
                            placeholder="请输入商品名称"
                            :readonly="isReadonly"
                            maxlength="30"
                            show-word-limit
                        />
                    </el-form-item>
                    <el-form-item label="商品分类" prop="categoryId">
                        <el-cascader
                            v-model="formData.categoryId"
                            :options="categoryList"
                            :props="{
                                label: 'name',
                                value: 'id',
                                children: 'children',
                                emitPath: false,
                            }"
                            placeholder="请选择分类"
                            class="w-full"
                            :disabled="isReadonly"
                        />
                    </el-form-item>
                    <el-form-item label="商品单位" prop="unit">
                        <el-select
                            v-model="formData.unit"
                            placeholder="请选择商品单位"
                            :disabled="isReadonly"
                        >
                            <el-option
                                v-for="unit in unitList"
                                :key="unit.id"
                                :label="unit.name"
                                :value="unit.name"
                            />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="商品简介">
                        <el-input
                            v-model="formData.info"
                            placeholder="请输入商品详细介绍..."
                            :readonly="isReadonly"
                            maxlength="50"
                            show-word-limit
                        />
                    </el-form-item>

                    <!-- 商品展示图 -->
                    <el-form-item label="商品展示图">
                        <div class="flex flex-col gap-2.5">
                            <draggable
                                v-model="displayFileList"
                                item-key="uid"
                                class="flex flex-wrap gap-4"
                                :disabled="isReadonly"
                                @change="syncDisplayImages"
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
                                                v-if="!isReadonly"
                                                class="text-white cursor-pointer text-xl"
                                                @click.stop="removeDisplayImage(index)"
                                                ><Delete
                                            /></el-icon>
                                        </div>
                                    </li>
                                </template>
                                <template #footer>
                                    <el-upload
                                        v-if="!isReadonly && displayFileList.length < 10"
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
                                最多上传 5 张展示图, 第一张为主图. 支持拖拽交换图片顺序
                            </div>
                        </div>
                    </el-form-item>

                    <!-- 商品详情图 -->
                    <el-form-item label="商品详情图">
                        <div class="flex flex-col gap-2.5">
                            <draggable
                                v-model="detailFileList"
                                item-key="uid"
                                class="flex flex-wrap gap-4"
                                :disabled="isReadonly"
                                @change="syncDetailImages"
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
                                                v-if="!isReadonly"
                                                class="text-white cursor-pointer text-xl"
                                                @click.stop="removeDetailImage(index)"
                                                ><Delete
                                            /></el-icon>
                                        </div>
                                    </li>
                                </template>
                                <template #footer>
                                    <el-upload
                                        v-if="!isReadonly && detailFileList.length < 20"
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
                                建议宽度 750px，最多上传 20 张详情图
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
                            v-model="formData.status"
                            :options="[
                                { label: '立即上架', value: 1 },
                                { label: '暂不上架', value: 0 },
                            ]"
                            :disabled="isReadonly"
                        />
                    </el-form-item>
                </div>
            </el-card>

            <!-- 规格与库存设置 -->
            <SkuSpecification
                v-model:specifications="internalSpecifications"
                v-model:sku-list="internalSkuList"
                :is-readonly="isReadonly"
            />

            <!-- 底部操作栏 -->
            <div class="flex justify-center gap-6 mt-10 pb-20">
                <el-button size="large" class="w-40 rounded-xl!" @click="$emit('prev')"
                    >上一步</el-button
                >
                <el-button
                    v-if="!isReadonly"
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
    import { ref, computed } from 'vue'
    import { Plus, ZoomIn, Delete, InfoFilled } from '@element-plus/icons-vue'
    import draggable from 'vuedraggable'
    import { ElMessage } from 'element-plus'
    import CapsuleToggle from '@/components/CapsuleToggle.vue'
    import SkuSpecification from './SkuSpecification.vue'
    import type {
        GoodsPublishPayload,
        GoodsSpecification,
        GoodsSkuItem,
        FileItem,
    } from '@/api/merchant/goods'
    import type { CategoryItem } from '@/api/common/category'
    import type { GoodsUnit } from '@/api/common/goods'

    const props = defineProps<{
        formData: GoodsPublishPayload
        categoryList: CategoryItem[]
        unitList: GoodsUnit[]
        specifications: GoodsSpecification[]
        skuList: GoodsSkuItem[]
        displayImages: FileItem[]
        detailImages: FileItem[]
        isReadonly: boolean
        submitting: boolean
    }>()

    const emit = defineEmits<{
        (e: 'prev'): void
        (e: 'submit'): void
        (e: 'update:displayImages', val: FileItem[]): void
        (e: 'update:detailImages', val: FileItem[]): void
        (e: 'update:specifications', val: GoodsSpecification[]): void
        (e: 'update:skuList', val: GoodsSkuItem[]): void
    }>()

    const formRef = ref<any>()
    const previewVisible = ref(false)
    const previewImageUrl = ref('')

    const displayFileList = computed({
        get: () => props.displayImages,
        set: (val) => emit('update:displayImages', val),
    })

    const detailFileList = computed({
        get: () => props.detailImages,
        set: (val) => emit('update:detailImages', val),
    })

    const internalSpecifications = computed({
        get: () => props.specifications,
        set: (val) => emit('update:specifications', val),
    })

    const internalSkuList = computed({
        get: () => props.skuList,
        set: (val) => emit('update:skuList', val),
    })

    const rules = {
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
        unit: [{ required: true, message: '请选择商品单位', trigger: 'change' }],
    }

    // 图片预览
    const handlePictureCardPreview = (file: FileItem) => {
        previewImageUrl.value = file.url
        previewVisible.value = true
    }

    // 展示图处理
    const uploadDisplayImage = (uploadFile: any) => {
        const file = uploadFile.raw
        if (!file) return
        if (!validateImage(file)) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const url = e.target?.result as string
            const uploadedFile: FileItem = {
                name: file.name,
                url: url,
                rawUrl: url,
                uid: Date.now(),
            }
            const newList = [...displayFileList.value, uploadedFile]
            displayFileList.value = newList
            syncDisplayImages(newList)
        }
        reader.readAsDataURL(file)
    }

    const removeDisplayImage = (index: number) => {
        const newList = [...displayFileList.value]
        newList.splice(index, 1)
        displayFileList.value = newList
        syncDisplayImages(newList)
    }

    const syncDisplayImages = (list?: FileItem[]) => {
        const targetList = Array.isArray(list) ? list : displayFileList.value
        if (targetList.length > 0) {
            props.formData.img = targetList[0]?.rawUrl || ''
            props.formData.imgList = targetList
                .slice(1)
                .map((f: FileItem) => f.rawUrl)
                .join(',')
        } else {
            props.formData.img = ''
            props.formData.imgList = ''
        }
    }

    // 详情图处理
    const uploadDetailImage = (uploadFile: any) => {
        const file = uploadFile.raw
        if (!file) return
        if (!validateImage(file)) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const url = e.target?.result as string
            const uploadedFile: FileItem = {
                name: file.name,
                url: url,
                rawUrl: url,
                uid: Date.now(),
            }
            const newList = [...detailFileList.value, uploadedFile]
            detailFileList.value = newList
            syncDetailImages(newList)
        }
        reader.readAsDataURL(file)
    }

    const removeDetailImage = (index: number) => {
        const newList = [...detailFileList.value]
        newList.splice(index, 1)
        detailFileList.value = newList
        syncDetailImages(newList)
    }

    const syncDetailImages = (list?: FileItem[]) => {
        const targetList = Array.isArray(list) ? list : detailFileList.value
        props.formData.detailImages = targetList.map((f: FileItem) => f.rawUrl).join(',')
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
        } catch (error) {
            console.error('Validation failed', error)
        }
    }
</script>

<style scoped>
    .upload-trigger :deep(.el-upload--picture-card) {
        width: 128px;
        height: 128px;
        border-radius: 12px;
    }
</style>
