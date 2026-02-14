<template>
    <el-container class="bg-[#f4f7fe] h-screen font-sans text-[#2d3748] overflow-hidden">
        <!-- 侧边栏 -->
        <el-aside
            width="240px"
            class="h-screen flex flex-col bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all duration-300 border-none"
        >
            <!-- Logo 区域 -->
            <div class="flex justify-center items-center gap-3 px-6 h-16 mt-2 mb-2">
                <div
                    class="p-2 flex justify-center items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100"
                >
                    <el-icon :size="20"><ShoppingTrolley /></el-icon>
                </div>
                <h1 class="text-lg font-black tracking-tight text-gray-800 uppercase">
                    Online Shop
                </h1>
            </div>

            <!-- 导航菜单 -->
            <el-scrollbar class="flex-1 px-4">
                <el-menu
                    :default-active="activeMenu"
                    class="sidebar-menu select-none border-none"
                    :collapse="false"
                    router
                    @select="handleMenuSelect"
                >
                    <template v-for="menu in menuItems" :key="menu.path">
                        <!-- 无子菜单 -->
                        <el-menu-item
                            v-if="!menu.children || menu.children.length === 0"
                            :index="menu.path"
                            class="menu-item-custom"
                        >
                            <el-icon v-if="menu.icon" class="menu-icon">
                                <component :is="menu.icon" />
                            </el-icon>
                            <template #title>
                                <span class="font-semibold">{{ menu.title }}</span>
                            </template>
                        </el-menu-item>

                        <!-- 有子菜单 -->
                        <el-sub-menu v-else :index="menu.path" class="submenu-custom">
                            <template #title>
                                <el-icon v-if="menu.icon" class="menu-icon">
                                    <component :is="menu.icon" />
                                </el-icon>
                                <span class="font-semibold">{{ menu.title }}</span>
                            </template>
                            <el-menu-item
                                v-for="child in menu.children"
                                :key="child.path"
                                :index="child.path"
                                class="child-menu-item-custom"
                            >
                                <el-icon v-if="child.icon" :size="14">
                                    <component :is="child.icon" />
                                </el-icon>
                                <template #title>
                                    <span class="text-[13px]">{{ child.title }}</span>
                                </template>
                            </el-menu-item>
                        </el-sub-menu>
                    </template>
                </el-menu>
            </el-scrollbar>
        </el-aside>

        <!-- 主体区域 -->
        <el-container class="h-full flex flex-col overflow-hidden">
            <el-header class="bg-transparent! h-16! flex items-center px-8 z-20 shrink-0">
                <Header class="w-full" />
            </el-header>

            <el-main class="flex-1 p-0! overflow-hidden relative">
                <router-view v-slot="{ Component }">
                    <transition name="fade-transform" mode="out-in">
                        <keep-alive>
                            <component :is="Component" :key="route.fullPath" />
                        </keep-alive>
                    </transition>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
    import { useRoute, useRouter } from 'vue-router'
    import Header from './modules/Header.vue'
    import { computed } from 'vue'
    import { useUserStore } from '@/stores/user'
    import {
        ShoppingTrolley,
        DataAnalysis,
        Shop,
        Goods,
        ShoppingCart,
    } from '@element-plus/icons-vue'

    interface MenuItem {
        path: string
        title: string
        icon?: any
        children?: MenuItem[]
    }

    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()

    const DEFAULT_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

    /**
     * 从路由定义生成菜单项
     * 获取根路由 '/' 下的所有子路由
     */
    const menuItems = computed(() => {
        const homeRoute = router.getRoutes().find((r) => r.path === '/')
        if (!homeRoute || !homeRoute.children) return []

        // 图标映射
        const iconMap: Record<string, any> = {
            statistics: DataAnalysis,
            store: Shop,
            goods: Goods,
            order: ShoppingCart,
        }

        /**
         * 递归构建菜单树
         * @param children 路由的子路由
         * @param parentPath 父路由路径
         */
        const buildMenuItems = (children: any[], parentPath = '/'): MenuItem[] => {
            return children
                .filter((child) => {
                    // 过滤掉没有 name 的路由（如纯容器路由）
                    return child.name && child.path
                })
                .map((child) => {
                    const childPath =
                        parentPath === '/' ? `/${child.path}` : `${parentPath}/${child.path}`
                    const menuItem: MenuItem = {
                        path: childPath,
                        title: child.meta?.title || child.name || '',
                        icon: iconMap[child.name?.toLowerCase()] || null,
                    }

                    // 递归处理子路由
                    if (child.children && child.children.length > 0) {
                        menuItem.children = buildMenuItems(child.children, childPath)
                    }

                    return menuItem
                })
        }

        return buildMenuItems(homeRoute.children)
    })

    /**
     * 计算当前活跃菜单项
     */
    const activeMenu = computed(() => {
        const currentPath = route.path

        // 递归查找匹配的菜单路径
        const findMatchingPath = (items: MenuItem[]): string | null => {
            for (const item of items) {
                if (item.path === currentPath) {
                    return item.path
                }
                if (item.children?.length) {
                    const found = findMatchingPath(item.children)
                    if (found) return found
                }
            }
            return null
        }

        const matched = findMatchingPath(menuItems.value)
        if (matched) return matched

        // 默认激活第一个菜单
        const firstMenu = menuItems.value[0]
        if (!firstMenu) return null

        return firstMenu.children?.[0]?.path || firstMenu.path || null
    })

    // 用户信息计算属性
    const userDisplayName = computed(() => userStore.displayName || userStore.username || '用户')

    const userAvatarUrl = computed(() => {
        const avatar = userStore.avatarUrl
        return avatar && avatar.trim() !== '' ? avatar : DEFAULT_AVATAR
    })

    const userRoleText = computed(() => {
        return 'NORMAL USER'
    })

    const handleMenuSelect = (path: string) => {
        router.push(path)
    }
</script>

<style scoped>
    .sidebar-menu,
    :deep(.el-menu),
    :deep(.el-aside) {
        border-right: none !important;
    }

    /* 菜单项基础样式 */
    .menu-item-custom,
    :deep(.el-sub-menu__title) {
        height: 46px !important;
        line-height: 46px !important;
        margin: 4px 0 !important;
        border-radius: 12px !important;
        color: #64748b !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    /* 子菜单项样式 */
    .child-menu-item-custom {
        height: 40px !important;
        line-height: 40px !important;
        margin: 2px 0 !important;
        border-radius: 10px !important;
        padding-left: 48px !important;
        color: #64748b !important;
    }

    /* 悬浮与激活状态 */
    .menu-item-custom:hover,
    :deep(.el-sub-menu__title:hover),
    .child-menu-item-custom:hover {
        color: #3b82f6 !important;
        background-color: #f8fafc !important;
    }

    :deep(.el-menu-item.is-active) {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.3);
    }

    :deep(.el-menu-item.is-active .el-icon),
    :deep(.el-menu-item.is-active span) {
        color: #ffffff !important;
    }

    .menu-icon {
        margin-right: 12px;
        font-size: 18px;
        transition: transform 0.3s ease;
    }

    /* 优化后的过渡动画 - 更丝滑的贝塞尔曲线和位移 */
    .fade-transform-enter-active,
    .fade-transform-leave-active {
        transition:
            opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .fade-transform-enter-from {
        opacity: 0;
        transform: translateX(20px);
    }

    .fade-transform-leave-to {
        opacity: 0;
        transform: translateX(-20px);
    }

    /* 隐藏滚动条 */
    :deep(.el-scrollbar__wrap) {
        overflow-x: hidden;
    }

    /* 确保 el-main 容器正确处理 Flex 布局 */
    :deep(.el-main) {
        min-height: 0;
    }
</style>
