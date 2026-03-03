import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCategoryList, type CategoryNode } from '@/api/category'
import { getCategoryTree } from '@/api/category'

export const useCategoryStore = defineStore('category', () => {
    const loading = ref(false)
    const _categoryList = ref<CategoryNode[]>([])
    const _categoryTree = ref<CategoryNode[]>([])
    const _listLoaded = ref(false)
    const _treeLoaded = ref(false)
    const _categoryMap = ref<Map<string, CategoryNode>>(new Map())
    const _mapInitialized = ref(false)

    /**
     * 初始化分类Map（从已加载的列表构建）- 仅初始化一次
     */
    const initCategoryMap = () => {
        if (_mapInitialized.value) {
            return true
        }

        if (!_listLoaded.value) {
            console.warn('❌ 分类列表未加载，请先调用 loadCategoryList()')
            return false
        }

        // 构建map
        _categoryMap.value.clear()
        for (const item of _categoryList.value) {
            const id = String(item.id)
            _categoryMap.value.set(id, item)
        }

        _mapInitialized.value = true

        console.log('✅ 分类Map已初始化:', {
            mapSize: _categoryMap.value.size,
            ids: Array.from(_categoryMap.value.keys()),
        })

        return true
    }

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

            // 加载后立即初始化map
            initCategoryMap()

            // 调试：输出已加载的分类信息
            console.log('✅ 分类列表已加载:', {
                count: _categoryList.value.length,
                ids: _categoryList.value.map((item) => item.id),
                data: _categoryList.value,
            })

            return _categoryList.value
        } catch (error) {
            console.error('❌ 分类列表加载失败:', error)
            throw error
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
        if (!_mapInitialized.value) {
            return '-'
        }
        const category = _categoryMap.value.get(String(categoryId))
        return category?.name || '-'
    }

    /**
     * 根据分类ID获取完整的分类路径
     * @param categoryId 分类ID（通常是叶子分类）
     * @returns 分类路径数组，例如：[{ name: '电子产品' }, { name: '手机' }, { name: '苹果' }]
     */
    const getCategoryPath = (categoryId: string): CategoryNode[] => {
        // 确保map已初始化
        if (!_mapInitialized.value) {
            return []
        }

        const path: CategoryNode[] = []
        let currentId: string | null | undefined = String(categoryId)

        console.log(`🔍 获取分类路径，输入ID: ${categoryId}`)

        while (currentId && currentId !== '0') {
            const category = _categoryMap.value.get(currentId)
            if (!category) {
                console.warn(
                    `❌ 分类ID ${currentId} 未找到。已加载分类ID: ${Array.from(_categoryMap.value.keys()).join(', ')}`,
                )
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

        // 确保map已初始化
        if (!_mapInitialized.value) {
            return '-'
        }

        const path: CategoryNode[] = []
        for (const id of categoryIdPath) {
            const category = _categoryMap.value.get(String(id))
            if (category) {
                path.push(category)
            } else {
                console.warn(
                    `❌ 分类ID ${id} 未找到。已加载分类ID: ${Array.from(_categoryMap.value.keys()).join(', ')}`,
                )
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

    /**
     * 获取已加载的所有分类ID（调试用）
     */
    const getLoadedCategoryIds = (): string[] => {
        if (!_mapInitialized.value) {
            return []
        }
        return Array.from(_categoryMap.value.keys())
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
        getLoadedCategoryIds,
    }
})
