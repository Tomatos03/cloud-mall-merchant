<template>
    <div class="h-full flex flex-col p-6 bg-[#f4f7fe]">
        <div
            class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4"
        >
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <el-button text @click="router.back()">
                        <el-icon><ArrowLeft /></el-icon>
                        返回
                    </el-button>
                    <span class="ml-2 text-base font-semibold text-gray-700">申请加入秒杀活动</span>
                </div>
            </div>

            <el-descriptions :column="1" border v-if="activity">
                <el-descriptions-item label="活动名称">{{ activity.name }}</el-descriptions-item>
                <el-descriptions-item label="活动时间">
                    {{ activity.activityDate }} {{ activity.startHour }}:00 ~
                    {{ activity.startHour + 1 }}:00
                </el-descriptions-item>
            </el-descriptions>
        </div>

        <div class="flex-1 overflow-auto">
            <div
                class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5 mb-4"
            >
                <h3 class="text-base font-semibold text-gray-700 mb-4">选择商品</h3>
                <div class="mb-4">
                    <el-input
                        v-model="goodsSearch"
                        placeholder="搜索商品名称"
                        clearable
                        @input="handleGoodsSearch"
                        style="width: 300px"
                    >
                        <template #prefix>
                            <el-icon><Search /></el-icon>
                        </template>
                    </el-input>
                </div>

                <div
                    v-if="selectedGoods"
                    class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                    <div class="flex items-center gap-4">
                        <el-image
                            :src="selectedGoods.displayImageUrls?.[0]"
                            class="w-16 h-16 rounded-lg"
                            fit="cover"
                        />
                        <div class="flex-1">
                            <div class="font-medium text-gray-700">
                                {{ selectedGoods.goodsName }}
                            </div>
                            <div class="text-sm text-gray-500">
                                原价: ¥{{ selectedGoods.price }}
                            </div>
                            <div class="text-sm text-gray-500">
                                库存: {{ selectedGoods.inventory }}件
                            </div>
                        </div>
                        <el-button text type="danger" @click="selectedGoods = undefined">
                            <el-icon><Close /></el-icon>
                            取消
                        </el-button>
                    </div>
                </div>

                <div v-else class="grid grid-cols-2 gap-4 max-h-80 overflow-auto">
                    <div
                        v-for="goods in filteredGoods"
                        :key="goods.goodsId"
                        class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        @click="selectGoods(goods)"
                    >
                        <div class="flex items-center gap-3">
                            <el-image
                                :src="goods.displayImageUrls?.[0]"
                                class="w-14 h-14 rounded-lg"
                                fit="cover"
                            />
                            <div class="flex-1 min-w-0">
                                <div class="font-medium text-gray-700 truncate">
                                    {{ goods.goodsName }}
                                </div>
                                <div class="text-sm text-gray-500">原价: ¥{{ goods.price }}</div>
                                <div class="text-sm text-gray-500">
                                    库存: {{ goods.inventory }}件
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        v-if="filteredGoods.length === 0"
                        class="col-span-2 text-center py-8 text-gray-400"
                    >
                        暂无可参与秒杀的商品
                    </div>
                </div>
            </div>

            <div
                class="bg-white rounded-lg border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5"
            >
                <h3 class="text-base font-semibold text-gray-700 mb-4">秒杀设置</h3>
                <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
                    <el-form-item label="秒杀价格" prop="seckillPrice">
                        <el-input
                            v-model="form.seckillPrice"
                            placeholder="请输入秒杀价格"
                            style="width: 200px"
                        >
                            <template #prefix>¥</template>
                        </el-input>
                        <div class="text-xs text-gray-400 mt-1" v-if="selectedGoods">
                            必须小于原价 ¥{{ selectedGoods.price }}
                        </div>
                    </el-form-item>
                    <el-form-item label="秒杀库存" prop="stock">
                        <el-input
                            v-model.number="form.stock"
                            placeholder="请输入秒杀库存"
                            style="width: 200px"
                        >
                            <template #append>件</template>
                        </el-input>
                        <div class="text-xs text-gray-400 mt-1" v-if="selectedGoods">
                            最大: {{ selectedGoods.inventory }}件
                        </div>
                    </el-form-item>
                </el-form>

                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div class="text-sm text-amber-700">
                        <div class="font-medium mb-1">温馨提示:</div>
                        <ul class="list-disc list-inside space-y-1">
                            <li>秒杀价格必须低于商品原价</li>
                            <li>秒杀库存不能超过商品总库存</li>
                            <li>提交申请后需等待平台审核</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-4 flex justify-end gap-3">
            <el-button @click="router.back()">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
                提交申请
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { ArrowLeft, Search, Close } from '@element-plus/icons-vue'
    import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
    import {
        fetchActivityDetail,
        fetchMyGoodsForApply,
        submitApply,
        type SeckillActivityItem,
        type GoodsSimple,
    } from '@/api/seckill'

    const route = useRoute()
    const router = useRouter()
    const formRef = ref<FormInstance>()

    const activityId = Number(route.params.activityId)
    const activity = ref<SeckillActivityItem>()
    const goodsList = ref<GoodsSimple[]>([])
    const goodsSearch = ref('')
    const selectedGoods = ref<GoodsSimple | undefined>()
    const submitting = ref(false)

    const form = ref({
        seckillPrice: '',
        stock: undefined as number | undefined,
    })

    const filteredGoods = computed(() => {
        if (!goodsSearch.value) return goodsList.value
        return goodsList.value.filter((g) =>
            g.goodsName.toLowerCase().includes(goodsSearch.value.toLowerCase()),
        )
    })

    const rules: FormRules = {
        seckillPrice: [
            { required: true, message: '请输入秒杀价格', trigger: 'blur' },
            {
                validator: (_rule, value, callback) => {
                    if (!value) {
                        callback(new Error('请输入秒杀价格'))
                    } else if (
                        selectedGoods.value &&
                        parseFloat(value) >= parseFloat(selectedGoods.value.price)
                    ) {
                        callback(new Error('秒杀价格必须小于原价'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
        stock: [
            { required: true, message: '请输入秒杀库存', trigger: 'blur' },
            { type: 'number', min: 1, message: '库存至少为1', trigger: 'blur' },
            {
                validator: (_rule, value, callback) => {
                    if (!value) {
                        callback(new Error('请输入秒杀库存'))
                    } else if (selectedGoods.value && value > selectedGoods.value.inventory) {
                        callback(new Error('库存不能超过商品总库存'))
                    } else {
                        callback()
                    }
                },
                trigger: 'blur',
            },
        ],
    }

    const loadData = async () => {
        const [activityRes, goodsRes] = await Promise.all([
            fetchActivityDetail(activityId),
            fetchMyGoodsForApply(activityId),
        ])
        activity.value = activityRes.data
        goodsList.value = goodsRes.data || []
    }

    const handleGoodsSearch = () => {}

    const selectGoods = (goods: GoodsSimple) => {
        selectedGoods.value = goods
        form.value.seckillPrice = ''
        form.value.stock = undefined
    }

    const handleSubmit = async () => {
        if (!selectedGoods.value) {
            ElMessage.warning('请选择参与秒杀的商品')
            return
        }

        const valid = await formRef.value?.validate().catch(() => false)
        if (!valid) return

        submitting.value = true
        try {
            await submitApply({
                activityId,
                productId: Number(selectedGoods.value.goodsId),
                seckillPrice: form.value.seckillPrice,
                stock: form.value.stock!,
            })
            ElMessage.success('申请提交成功')
            router.push('/seckill/applies')
        } finally {
            submitting.value = false
        }
    }

    onMounted(() => {
        loadData()
    })
</script>
