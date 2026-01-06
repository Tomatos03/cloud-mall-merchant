<template>
    <el-card shadow="never" class="mb-6 border-none rounded-xl">
        <template #header>
            <div class="flex justify-between items-center">
                <div class="font-bold text-lg text-gray-800">规格与库存设置</div>
                <div v-if="!isReadonly && internalSkuList.length > 0" class="flex gap-3">
                    <el-button size="small" @click="batchSet('price')" icon="Edit">
                        批量设置价格
                    </el-button>
                    <el-button size="small" @click="batchSet('inventory')" icon="Box">
                        批量设置库存
                    </el-button>
                </div>
            </div>
        </template>

        <!-- 规格设置部分 -->
        <div class="space-y-6 mb-8">
            <div
                v-for="(spec, index) in internalSpecifications"
                :key="index"
                class="p-6 bg-gray-50/50 rounded-xl border border-gray-100 relative group"
            >
                <el-button
                    v-if="!isReadonly"
                    type="danger"
                    circle
                    size="small"
                    class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="removeSpec(index)"
                >
                    <el-icon><Close /></el-icon>
                </el-button>

                <div class="flex items-center gap-4 mb-4">
                    <span class="text-sm font-bold text-gray-600 w-16">规格名:</span>
                    <el-input
                        v-model="spec.name"
                        placeholder="如：颜色、尺寸"
                        class="max-w-xs"
                        :readonly="isReadonly"
                    />
                </div>

                <div class="flex items-start gap-4">
                    <span class="text-sm font-bold text-gray-600 w-16 mt-1.5">规格值:</span>
                    <div class="flex flex-wrap gap-2 flex-1">
                        <el-tag
                            v-for="val in spec.values"
                            :key="val"
                            closable
                            :disable-transitions="false"
                            @close="removeSpecValue(spec, val)"
                            class="rounded-lg"
                        >
                            {{ val }}
                        </el-tag>
                        <div v-if="!isReadonly" class="inline-block">
                            <el-input
                                v-if="specInputStates[index]?.visible"
                                :ref="(el) => (inputRefs[index] = el)"
                                v-model="specInputStates[index].value"
                                size="small"
                                class="w-24"
                                @keyup.enter="handleInputConfirm(spec, index)"
                                @blur="handleInputConfirm(spec, index)"
                            />
                            <el-button
                                v-else
                                size="small"
                                icon="Plus"
                                @click="showInput(index)"
                                >添加值</el-button
                            >
                        </div>
                    </div>
                </div>
            </div>

            <el-button
                v-if="!isReadonly && internalSpecifications.length < 3"
                type="primary"
                plain
                class="w-full border-dashed rounded-xl! h-12"
                @click="addSpec"
            >
                <el-icon class="mr-1"><Plus /></el-icon>添加规格名 (最多3个)
            </el-button>
        </div>

        <!-- SKU 组合列表部分 -->
        <div class="border-t border-gray-100 pt-6">
            <div class="text-sm font-bold text-gray-600 mb-4">SKU 组合列表</div>
            <el-table
                :data="internalSkuList"
                border
                class="rounded-lg overflow-hidden"
                :show-header="internalSkuList.length > 0"
            >
                <template #empty>
                    <el-empty description="暂无规格组合，请先添加商品规格" :image-size="100" />
                </template>
                <el-table-column
                    v-for="spec in internalSpecifications.filter((s) => s.name)"
                    :key="spec.name"
                    :label="spec.name"
                    align="center"
                >
                    <template #default="{ row }: { row: GoodsSkuItem }">
                        <span class="font-medium text-gray-700">{{
                            row.specs.find((s) => s.name === spec.name)?.value
                        }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="价格" width="180" align="center">
                    <template #default="{ row }: { row: GoodsSkuItem }">
                        <el-input-number
                            v-model="row.price"
                            :min="0"
                            size="small"
                            class="w-full!"
                            controls-position="right"
                            :disabled="isReadonly"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="库存" width="180" align="center">
                    <template #default="{ row }: { row: GoodsSkuItem }">
                        <el-input-number
                            v-model="row.inventory"
                            :min="0"
                            size="small"
                            class="w-full!"
                            controls-position="right"
                            :disabled="isReadonly"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="是否启用" width="150" align="center">
                    <template #default="{ row }: { row: GoodsSkuItem }">
                        <el-switch
                            v-model="row.status"
                            :active-value="1"
                            :inactive-value="0"
                            :disabled="isReadonly"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-card>
</template>

<script setup lang="ts">
    import { ref, nextTick, watch, computed, reactive } from 'vue'
    import { Plus, Close } from '@element-plus/icons-vue'
    import { ElMessage, ElMessageBox, type InputInstance } from 'element-plus'

    import type {
        GoodsSpecification,
        GoodsSkuItem,
        GoodsSkuSpec,
    } from '@/api/merchant/goods'

    const props = defineProps<{
        specifications: GoodsSpecification[]
        skuList: GoodsSkuItem[]
        isReadonly: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:specifications', val: GoodsSpecification[]): void
        (e: 'update:skuList', val: GoodsSkuItem[]): void
    }>()

    const inputRefs = ref<(InputInstance | null)[]>([])
    const specInputStates = reactive<Array<{ visible: boolean; value: string }>>([])

    const internalSpecifications = computed({
        get: () => props.specifications,
        set: (val) => emit('update:specifications', val),
    })

    const internalSkuList = computed({
        get: () => props.skuList,
        set: (val) => emit('update:skuList', val),
    })

    // 规格处理
    const addSpec = () => {
        const newSpecs = [...internalSpecifications.value, { name: '', values: [] }]
        internalSpecifications.value = newSpecs
        specInputStates.push({ visible: false, value: '' })
    }

    const removeSpec = (index: number) => {
        const newSpecs = [...internalSpecifications.value]
        newSpecs.splice(index, 1)
        internalSpecifications.value = newSpecs
        specInputStates.splice(index, 1)
    }

    const showInput = (index: number) => {
        if (!specInputStates[index]) {
            specInputStates[index] = { visible: true, value: '' }
        } else {
            specInputStates[index].visible = true
        }
        nextTick(() => {
            inputRefs.value[index]?.focus()
        })
    }

    const handleInputConfirm = (spec: GoodsSpecification, index: number) => {
        const state = specInputStates[index]
        if (state && state.value) {
            if (!spec.values.includes(state.value)) {
                spec.values.push(state.value)
            } else {
                ElMessage.warning('规格值已存在')
            }
        }
        if (state) {
            state.visible = false
            state.value = ''
        }
    }

    const removeSpecValue = (spec: GoodsSpecification, val: string) => {
        const index = spec.values.indexOf(val)
        if (index !== -1) {
            spec.values.splice(index, 1)
        }
    }

    // SKU 生成逻辑
    const generateSkus = () => {
        const validSpecs = internalSpecifications.value.filter((s) => s.name && s.values.length > 0)
        if (validSpecs.length === 0) {
            internalSkuList.value = []
            return
        }

        const combinations = validSpecs.reduce(
            (acc: Record<string, string>[], spec: GoodsSpecification) => {
                const result: Record<string, string>[] = []
                acc.forEach((prev) => {
                    spec.values.forEach((val: string) => {
                        result.push({ ...prev, [spec.name]: val })
                    })
                })
                return result
            },
            [{} as Record<string, string>],
        )

        const oldSkuMap = new Map<string, GoodsSkuItem>()
        internalSkuList.value.forEach((sku) => {
            // 将数组形式的 specs 转换回对象以生成稳定的 key 用于对比
            const specObj = sku.specs.reduce((acc: Record<string, string>, curr: GoodsSkuSpec) => {
                acc[curr.name] = curr.value
                return acc
            }, {})
            const key = JSON.stringify(specObj)
            oldSkuMap.set(key, sku)
        })

        const newSkuList: GoodsSkuItem[] = combinations.map((combo) => {
            const key = JSON.stringify(combo)
            const existing = oldSkuMap.get(key)

            // 将组合对象转换为数组格式 [{ name: '', value: '' }]
            const specs: GoodsSkuSpec[] = Object.keys(combo).map((name) => ({
                name,
                value: combo[name],
            }))

            return {
                specs,
                price: existing ? existing.price : 0,
                inventory: existing ? existing.inventory : 0,
                status: existing ? existing.status : 1,
            }
        })
        internalSkuList.value = newSkuList
    }

    watch(
        () => internalSpecifications.value,
        () => generateSkus(),
        { deep: true },
    )

    watch(
        () => internalSpecifications.value.length,
        (newLen) => {
            while (specInputStates.length < newLen) {
                specInputStates.push({ visible: false, value: '' })
            }
        },
        { immediate: true },
    )

    const batchSet = (field: 'price' | 'inventory') => {
        const label = field === 'price' ? '价格 (分)' : '库存'
        ElMessageBox.prompt(`请输入统一的${label}`, '批量设置', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^\d+$/,
            inputErrorMessage: '请输入有效的数字',
        }).then(({ value }) => {
            const num = parseInt(value)
            const newList = internalSkuList.value.map((sku) => ({
                ...sku,
                [field]: num,
            }))
            internalSkuList.value = newList
        })
    }
</script>
