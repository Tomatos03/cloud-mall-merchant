```vue /home/Tomatos/Projects/design/cloud-mall-manager/src/views/goods/list/model/GoodsDetailDialog.vue
<template>
    <el-dialog
        v-model="visible"
        title="商品详情"
        width="800px"
        destroy-on-close
        class="goods-detail-dialog"
    >
        <div v-if="data" class="detail-container p-2">
            <!-- 基本信息 -->
            <el-descriptions title="基本信息" :column="2" border>
                <el-descriptions-item label="商品名称" :span="2">
                    <span class="font-medium text-gray-800">{{ data.name }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="商品分类">
                    {{ categoryName || '未分类' }}
                </el-descriptions-item>
                <el-descriptions-item label="销售价格">
                    <span class="text-rose-500 font-bold">￥{{ fenToYuan(data.price) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="计价单位">
                    {{ data.unit || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="当前库存">
                    <el-tag :type="data.inventory > 10 ? 'success' : 'danger'" effect="light">
                        {{ data.inventory }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="商品状态">
                    <el-tag :type="data.status ? 'success' : 'info'" effect="dark">
                        {{ data.status ? '已上架' : '未上架' }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="所属店铺">
                    {{ data.storeName || '-' }}
                </el-descriptions-item>
            </el-descriptions>

            <!-- 商品简介 -->
            <div class="mt-8">
                <div class="text-base font-bold mb-3 flex items-center text-gray-800">
                    <div class="w-1 h-4 bg-blue-500 mr-2 rounded-full"></div>
                    商品简介
                </div>
                <div class="bg-gray-50 p-4 rounded-xl text-gray-600 leading-relaxed border border-gray-100 italic">
                    {{ data.info || '暂无详细介绍' }}
                </div>
            </div>

            <!-- 商品图片 -->
            <div class="mt-8">
                <div class="text-base font-bold mb-3 flex items-center text-gray-800">
                    <div class="w-1 h-4 bg-blue-500 mr-2 rounded-full"></div>
                    商品图片
                </div>
                <div class="flex flex-wrap gap-4">
                    <div 
                        v-for="(img, index) in allImages" 
                        :key="index" 
                        class="relative group"
                    >
                        <el-image
                            :src="getImageURL(img)"
                            :preview-src-list="allImages.map(i => getImageURL(i))"
                            :initial-index="index"
                            preview-teleported
                            fit="cover"
                            class="w-32 h-32 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-zoom-in"
                        />
                        <div 
                            v-if="index === 0" 
                            class="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-tl-xl rounded-br-xl z-10 shadow-sm"
                        >
                            主图
                        </div>
                    </div>
                    <div v-if="allImages.length === 0" class="text-gray-400 text-sm italic py-4">
                        暂无图片
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end pt-2">
                <el-button type="primary" plain @click="visible = false" class="px-8 rounded-lg">
                    关闭
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fenToYuan } from '@/utils/price'
import { getImageURL } from '@/utils/image'
import type { CategoryItem } from '@/api/common/category'

interface Props {
    modelValue: boolean
    data: any | null
    categoryList?: CategoryItem[]
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    data: null,
    categoryList: () => []
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

// 合并主图和副图列表
const allImages = computed(() => {
    if (!props.data) return []
    const images = []
    if (props.data.img) images.push(props.data.img)
    
    if (props.data.imgList) {
        try {
            const subImages = typeof props.data.imgList === 'string' 
                ? props.data.imgList.split(',').filter(Boolean)
                : props.data.imgList
            images.push(...subImages)
        } catch (e) {
            console.error('解析图片列表失败', e)
        }
    }
    return images
})

// 递归查找分类名称
const categoryName = computed(() => {
    if (!props.data?.categoryId || !props.categoryList.length) return ''
    
    const findName = (list: CategoryItem[], id: string): string | null => {
        for (const item of list) {
            if (item.id === id) return item.name
            if (item.children?.length) {
                const name = findName(item.children, id)
                if (name) return name
            }
        }
        return null
    }
    
    return findName(props.categoryList, props.data.categoryId)
})
</script>

<style scoped>
.goods-detail-dialog :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
}

.goods-detail-dialog :deep(.el-dialog__header) {
    margin-right: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
}

.goods-detail-dialog :deep(.el-dialog__title) {
    font-weight: 700;
    color: #1e293b;
}

.goods-detail-dialog :deep(.el-descriptions__title) {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
}

.goods-detail-dialog :deep(.el-descriptions__title)::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background-color: #3b82f6;
    margin-right: 8px;
    border-radius: 2px;
}

.goods-detail-dialog :deep(.el-descriptions__label) {
    background-color: #f8fafc;
    color: #64748b;
    font-weight: 500;
    width: 120px;
}

.goods-detail-dialog :deep(.el-descriptions__content) {
    color: #334155;
}
</style>
