import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type Unit } from '@/api/common/unit'
import { fetchUnitList } from '@/api/merchant/unit'

export const useUnitStore = defineStore('unit', () => {
    const loading = ref(false)
    const _unitList = ref<Unit[]>([])
    const _listLoaded = ref(false)

    /**
     * 获取单位列表，支持缓存
     */
    const loadUnitList = async () => {
        if (_listLoaded.value) return _unitList.value

        loading.value = true
        try {
            const res = await fetchUnitList()
            _unitList.value = res.data.map((item): Unit => {
                return {
                    id: item.id,
                    name: item.name,
                }
            })

            _listLoaded.value = true
            return _unitList.value
        } finally {
            loading.value = false
        }
    }

    /**
     * 同步 getter：返回已加载的单位列表，如果未加载返回空数组
     */
    const unitList = computed(() => {
        return _unitList.value
    })

    /**
     * 根据单位ID获取单位名称
     */
    const getUnitName = (unitId: string): string => {
        const unit = unitList.value.find((item) => item.id === unitId)
        return unit?.name || '-'
    }

    return {
        unitList,
        loading,
        loadUnitList,
        getUnitName,
    }
})
