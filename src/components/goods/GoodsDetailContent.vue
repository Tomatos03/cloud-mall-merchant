<template>
    <!-- 1. 基本信息 -->
    <el-descriptions :title="'基本信息'" :column="2" border>
        <!-- 商品名称 -->
        <el-descriptions-item label="商品名称" :span="2">
            <div class="w-full">
                <div class="font-medium text-gray-800">{{ data.goodsName }}</div>
            </div>
        </el-descriptions-item>

        <!-- 商品卖点 -->
        <el-descriptions-item label="商品卖点" :span="2">
            <div class="w-full">
                <div class="text-gray-600 italic">
                    {{ data.sellPoint || '暂无卖点描述' }}
                </div>
            </div>
        </el-descriptions-item>

        <!-- 商品分类 -->
        <el-descriptions-item v-if="data.categoryPath" label="商品分类">
            {{ data.categoryPath }}
        </el-descriptions-item>

        <!-- 销售价格 -->
        <el-descriptions-item
            v-if="data.minPrice !== undefined && data.maxPrice !== undefined"
            label="销售价格"
        >
            <span class="text-rose-500 font-bold">
                {{ formatPrice(data.minPrice, data.maxPrice) }}
            </span>
        </el-descriptions-item>

        <!-- 计价单位 -->
        <el-descriptions-item v-if="data.unitName" label="计价单位">
            {{ data.unitName }}
        </el-descriptions-item>
    </el-descriptions>

    <!-- 2. 图片展示 -->
    <section>
        <div class="mb-3">
            <span class="text-sm font-bold text-gray-800">商品图示</span>
        </div>
        <div class="flex flex-wrap gap-3">
            <template v-if="data.displayImageUrls && data.displayImageUrls.length > 0">
                <div
                    v-for="(img, i) in data.displayImageUrls"
                    :key="i"
                    class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
                >
                    <el-image
                        :src="img"
                        fit="cover"
                        class="w-full h-full cursor-zoom-in"
                        :preview-src-list="data.displayImageUrls"
                        :initial-index="i"
                        preview-teleported
                    />
                    <div
                        v-if="i === 0"
                        class="absolute top-0 left-0 px-1.5 py-0.5 bg-blue-500/80 text-white text-[9px] rounded-br z-10"
                    >
                        主图
                    </div>
                </div>
            </template>
            <div v-else>暂无展示图</div>
        </div>
    </section>

    <!-- 3. 详情描述图 -->
    <section v-if="data.descriptionImageUrls && data.descriptionImageUrls.length > 0">
        <div class="mb-3">
            <span class="text-sm font-bold text-gray-800">商品详情图</span>
        </div>
        <div class="flex flex-wrap gap-3">
            <div
                v-for="(img, i) in data.descriptionImageUrls"
                :key="i"
                class="relative w-28 h-28 rounded border border-gray-100 overflow-hidden"
            >
                <el-image
                    :src="img"
                    fit="cover"
                    class="w-full h-full cursor-zoom-in"
                    :preview-src-list="data.descriptionImageUrls"
                    :initial-index="i"
                    preview-teleported
                />
            </div>
        </div>
    </section>

    <!-- 4. SKU 配置 -->
    <section v-if="data.skus && data.skus.length > 0">
        <div class="mb-3">
            <span class="text-sm font-bold text-gray-800">SKU 详细</span>
        </div>

        <!-- 规格参数 -->
        <div
            v-if="data.specifications && data.specifications.length > 0"
            class="my-2.5 border border-gray-200 rounded overflow-hidden"
        >
            <!-- 规格表头 -->
            <div class="flex bg-gray-50 border-b border-gray-200">
                <div
                    class="w-1/3 px-4 py-3 font-semibold text-sm text-gray-700 border-r border-gray-200"
                >
                    规格名称
                </div>
                <div class="flex-1 px-4 py-3 font-semibold text-sm text-gray-700">规格值</div>
            </div>
            <!-- 规格行 -->
            <div
                v-for="(spec, specIndex) in data.specifications"
                :key="specIndex"
                class="flex border-b border-gray-200 last:border-b-0"
            >
                <!-- 规格名称列 -->
                <div class="w-1/3 px-4 py-3 border-r border-gray-200 bg-gray-50">
                    <span class="block truncate">
                        {{ spec.name }}
                    </span>
                </div>
                <!-- 规格值列 -->
                <div class="flex-1 px-4 py-3 flex items-center gap-2 flex-wrap">
                    <div class="flex flex-wrap gap-2">
                        <el-tag
                            v-for="(val, index) in spec.values"
                            :key="index"
                            size="small"
                            class="rounded"
                        >
                            {{ val }}
                        </el-tag>
                    </div>
                </div>
            </div>
        </div>

        <!-- SKU表格 -->
        <div>
            <Table :columns="skuColumns" :data="data.skus">
                <template #specs="{ row }">
                    <div class="flex flex-wrap gap-1">
                        <el-tag
                            v-for="s in row.specs"
                            :key="s.value"
                            size="small"
                            type="info"
                            class="rounded"
                        >
                            {{ s.value }}
                        </el-tag>
                    </div>
                </template>
                <template #priceStr="{ row }">
                    <span class="font-bold text-rose-500">
                        {{ formatPrice(row.price) }}
                    </span>
                </template>
                <template #inventory="{ row }">
                    <span
                        :class="row.inventory > 10 ? 'text-green-600' : 'text-rose-600 font-medium'"
                    >
                        {{ row.inventory }}
                    </span>
                </template>
                <template #status="{ row }">
                    <el-tag :type="!!row.status ? 'success' : 'info'" size="small">
                        {{ !!row.status ? '上架' : '下架' }}
                    </el-tag>
                </template>
            </Table>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import type { GoodsDetail } from '@/api/goods'
    import Table from '@/components/table/Table.vue'
    import { formatPrice } from '@/utils/money'

    interface Props {
        data: GoodsDetail
    }

    const props = defineProps<Props>()

    // SKU 表格列配置
    const skuColumns = computed(() => [
        {
            id: 'specs',
            label: '规格组合',
            key: 'specs',
        },
        {
            id: 'priceStr',
            label: '单价',
            key: 'priceStr',
        },
        {
            id: 'inventory',
            label: '库存',
            key: 'inventory',
        },
        {
            id: 'status',
            label: '状态',
            key: 'status',
        },
    ])
</script>
