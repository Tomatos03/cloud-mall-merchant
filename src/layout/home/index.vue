<template>
    <el-container class="bg-[#f4f7fe] h-screen font-sans text-[#2d3748] overflow-hidden">
        <!-- 侧边栏 -->
        <el-aside
            width="240px"
            class="h-screen flex flex-col bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 transition-all duration-300 border-none"
        >
            <!-- Logo 区域 -->
            <div class="flex items-center gap-3 px-6 h-16 mt-2 mb-2">
                <div class="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
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
                    <template v-for="menu in resolvedMenus" :key="menu.path">
                        <!-- 无子菜单 -->
                        <el-menu-item
                            v-if="!menu.children || menu.children.length === 0"
                            :index="menu.path"
                            class="menu-item-custom"
                        >
                            <el-icon v-if="menu.meta?.icon" class="menu-icon">
                                <component :is="menu.meta.icon" />
                            </el-icon>
                            <template #title>
                                <span class="font-semibold">{{
                                    menu.meta?.title || menu.name
                                }}</span>
                            </template>
                        </el-menu-item>

                        <!-- 有子菜单 -->
                        <el-sub-menu v-else :index="menu.path" class="submenu-custom">
                            <template #title>
                                <el-icon v-if="menu.meta?.icon" class="menu-icon">
                                    <component :is="menu.meta.icon" />
                                </el-icon>
                                <span class="font-semibold">{{
                                    menu.meta?.title || menu.name
                                }}</span>
                            </template>
                            <el-menu-item
                                v-for="child in menu.children"
                                :key="child.path"
                                :index="child.path"
                                class="child-menu-item-custom"
                            >
                                <el-icon v-if="child.meta?.icon" :size="14">
                                    <component :is="child.meta.icon" />
                                </el-icon>
                                <template #title>
                                    <span class="text-[13px]">{{
                                        child.meta?.title || child.name
                                    }}</span>
                                </template>
                            </el-menu-item>
                        </el-sub-menu>
                    </template>
                </el-menu>
            </el-scrollbar>

            <!-- 侧边栏底部用户信息 -->
            <div class="p-4 border-t border-gray-50/50">
                <div
                    class="bg-gray-50/80 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-blue-50/50 transition-all duration-300"
                >
                    <el-avatar
                        :src="userAvatarUrl"
                        :size="32"
                        class="ring-2 ring-white shadow-sm"
                    />
                    <div class="overflow-hidden">
                        <div class="text-[13px] font-bold text-gray-700 truncate">
                            {{ userDisplayName }}
                        </div>
                        <div class="text-[10px] text-gray-400 truncate tracking-wider">
                            {{ userRoleText }}
                        </div>
                    </div>
                </div>
            </div>
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
    import Header from './model/Header.vue'
    import { computed } from 'vue'
    import { usePermissionStore } from '@/stores/permission'
    import { useUserStore } from '@/stores/user'
    import { ShoppingTrolley } from '@element-plus/icons-vue'
    import type { MenuItem } from '@/api/common'

    const route = useRoute()
    const router = useRouter()
    const permissionStore = usePermissionStore()
    const userStore = useUserStore()
    const loading = false;

    const DEFAULT_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

    /**
     * 计算当前活跃菜单项
     * 优先使用 meta.activeMenu，否则使用当前路由路径
     */
    const activeMenu = computed(() => {
        const { path } = route
        // 检查当前路径是否在菜单列表中
        const hasPath = (menus: MenuItem[]): boolean => {
            return menus.some((menu) => {
                if (menu.path === path) return true
                if (menu.children) return hasPath(menu.children)
                return false
            })
        }

        // 如果当前是基础路径且不在菜单中，默认指向第一个菜单项
        if (!hasPath(resolvedMenus.value)) {
            const first = resolvedMenus.value[0]
            if (first == undefined) return null
            return first.children && first.children.length > 0
                ? first.children[0]?.path
                : first.path
        }

        return path
    })

    // 用户信息计算属性
    const userDisplayName = computed(() => userStore.displayName || userStore.username || '用户')

    const userAvatarUrl = computed(() => {
        const avatar = userStore.avatarUrl
        return avatar && avatar.trim() !== '' ? avatar : DEFAULT_AVATAR
    })

    const userRoleText = computed(() => {
        const role = userStore.role
        if (role === 'ADMIN') return 'ADMINISTRATOR'
        if (role === 'MERCHANT') return 'MERCHANT'
        return 'NORMAL USER'
    })

    const handleMenuSelect = (path: string) => {
      if (!loading) {
        router.push(path)
      }
    }

    /**
     * 规范化路径拼接函数
     */
    const resolvePath = (basePath: string, routePath: string) => {
        if (routePath.startsWith('/')) return routePath
        const base = basePath.endsWith('/') ? basePath : basePath + '/'
        return (base + routePath.replace(/^\//, '')).replace(/\/+/g, '/')
    }

    /**
     * 处理菜单数据
     * 1. 处理 Layout 提升逻辑：如果顶级菜单是 Layout，则将其子菜单提升到顶层显示
     * 2. 确保所有菜单项的 path 都是完整的绝对路径，以便与 route.path 匹配
     */
    const resolvedMenus = computed(() => {
        const rawMenus = permissionStore.menus || []
        const result: MenuItem[] = []

        rawMenus.forEach((item: MenuItem) => {
            if (item.type === 'layout' && item.children && item.children.length > 0) {
                item.children.forEach((child: MenuItem) => {
                    const fullPath = resolvePath(item.routePath, child.routePath)
                    const processedChild = { ...child, path: fullPath }

                    // 处理子菜单的路径
                    if (child.children && child.children.length > 0) {
                        processedChild.children = child.children.map((grandChild: MenuItem) => ({
                            ...grandChild,
                            path: resolvePath(fullPath, grandChild.routePath),
                        }))
                    }
                    result.push(processedChild)
                })
            } else {
                // 顶级菜单项，确保路径是绝对的
                result.push({ ...item })
            }
        })
        return result
    })
</script>

<style scoped>
    /* 彻底移除 Element Plus 菜单默认右边框 */
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
