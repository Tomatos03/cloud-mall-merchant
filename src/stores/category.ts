import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCategoryList, type CategoryItem } from '@/api/merchant/category'
import { getCategoryTree } from '@/api/common/category'

export const useCategoryStore = defineStore('category', () => {
    const loading = ref(false)
    const _categoryList = ref<CategoryItem[]>([])
    const _categoryTree = ref<CategoryItem[]>([])
    const _listLoaded = ref(false)
    const _treeLoaded = ref(false)

    /**
     * 获取分类列表（扁平化），支持缓存
     */
    const loadCategoryList = async () => {
        if (_listLoaded.value) return _categoryList.value

        loading.value = true
        try {
            const res = await getCategoryList()
            _categoryList.value = res.data
            _listLoaded.value = true
            return _categoryList.value
        } finally {
            loading.value = false
        }
    }

    /**
     * 获取分类树形结构，支持缓存
     */
    const loadCategoryTree = async () => {
        if (_treeLoaded.value) return _categoryTree.value

        loading.value = true
        try {
            const res = await getCategoryTree()
            _categoryTree.value = res.data
            _treeLoaded.value = true
            return _categoryTree.value
        } finally {
            loading.value = false
        }
    }

    /**
     * 同步 getter：返回已加载的分类列表，如果未加载返回空数组
     */
    const categoryList = computed(() => {
        return _categoryList.value
    })

    /**
     * 同步 getter：返回已加载的分类树，如果未加载返回空数组
     */
    const categoryTree = computed(() => {
        return _categoryTree.value
    })

    /**
     * 根据分类ID获取分类名称
     */
    const getCategoryName = (categoryId: string): string => {
        const category = categoryList.value.find((item) => item.id === categoryId)
        return category?.name || '-'
    }

    /**
     * 根据分类ID获取完整的分类路径
     * @param categoryId 分类ID（通常是叶子分类）
     * @returns 分类路径数组，例如：[{ name: '电子产品' }, { name: '手机' }, { name: '苹果' }]
     */
    const getCategoryPath = (categoryId: string): CategoryItem[] => {
        const categoryMap = new Map<string, CategoryItem>()
        for (const item of categoryList.value) {
            categoryMap.set(item.id, item)
        }

        const path: CategoryItem[] = []
        let currentId: string | null | undefined = categoryId

        while (currentId && currentId !== '0') {
            const category = categoryMap.get(currentId)
            if (!category) {
                console.warn(`分类ID ${currentId} 未找到`)
                break
            }

            path.unshift(category)
            currentId = category.parentId
        }

        return path
    }

    /**
     * 根据分类ID获取分类路径字符串
     * @param categoryId 分类ID
     * @returns 分类路径字符串，例如：'电子产品 > 手机 > 苹果'，未找到返回 '-'
     */
    const getCategoryPathString = (categoryId: string): string => {
        const path = getCategoryPath(categoryId)
        return path.length > 0 ? path.map((item) => item.name).join(' > ') : '-'
    }

    /**
     * 根据分类ID路径数组获取完整的分类路径字符串
     * @param categoryIdPath 分类ID数组，例如 [1, 5, 7]
     * @returns 分类路径字符串，例如：'电子产品 > 手机 > 苹果'，未找到返回 '-'
     */
    const getCategoryPathStringByIdPath = (categoryIdPath: number[]): string => {
        if (!categoryIdPath || categoryIdPath.length === 0) {
            return '-'
        }
        const categoryMap = new Map<string, CategoryItem>()
        for (const item of categoryList.value) {
            categoryMap.set(item.id, item)
        }

        const path: CategoryItem[] = []
        for (const id of categoryIdPath) {
            const category = categoryMap.get(String(id))
            if (category) {
                path.push(category)
            }
        }

        return path.length > 0 ? path.map((item) => item.name).join(' > ') : '-'
    }

    /**
     * 根据分类ID路径数组获取一级分类名称
     * @param categoryIdPath 分类ID数组，例如 [1, 5, 7]
     * @returns 一级分类名称，未找到返回 '-'
     */
    const getFirstLevelCategoryName = (categoryIdPath: number[]): string => {
        if (!categoryIdPath || categoryIdPath.length === 0) {
            return '-'
        }
        return getCategoryName(String(categoryIdPath[0]))
    }

    return {
        categoryList,
        categoryTree,
        loading,
        loadCategoryList,
        loadCategoryTree,
        getCategoryName,
        getCategoryPath,
        getCategoryPathString,
        getCategoryPathStringByIdPath,
        getFirstLevelCategoryName,
    }
})
