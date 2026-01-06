import { defineStore } from 'pinia'
import { fetchMenus } from '@/api/common/menu'
import { useUserStore } from '@/stores/user'

import type { MenuItem } from '@/api/common/menu'
import type { Router, RouteRecordRaw } from 'vue-router'
import type { ComponentResolver } from '@/router'

interface PermissionState {
  menus: MenuItem[]
  routesLoaded: boolean
  currentRole: string
  addedRouteNames: string[] // 记录动态添加的路由 name, 防止切换账号时的重复注册卡死
}

export const usePermissionStore = defineStore('permission', {
    state: (): PermissionState => ({
        menus: [],
        routesLoaded: false,
        currentRole: '',
        addedRouteNames: [],
    }),
    actions: {
        setMenus(menus: MenuItem[]) {
            this.menus = menus
        },
        setRoutesLoaded(loaded = true) {
            this.routesLoaded = loaded
        },
        setCurrentRole(role = '') {
            this.currentRole = role
        },
        clear(router?: Router) {
            this.menus = []
            this.routesLoaded = false
            this.currentRole = ''
            // 清理动态注册的路由
            if (router) {
                this.addedRouteNames.forEach(name => {
                    if (router.hasRoute(name)) {
                        router.removeRoute(name)
                    }
                })
            }
            this.addedRouteNames = []
        },

        // 拉取菜单数据（单一职责：只负责拿数据并存储）
        async loadMenus(role: string) {
          const res = await fetchMenus(role)
          const menus = res.data || []
          this.setMenus(menus)
          return menus
        },
        menusToRoutes(
          menus: MenuItem[],
          componentResolver: ComponentResolver,
        ): RouteRecordRaw[] {
          const mapMenu = (menu: MenuItem): RouteRecordRaw => {
            const route: unknown = {
              path: menu.routePath,
              name: menu.name,
              component: componentResolver(menu.type, menu.path),
              meta: menu.meta || {},
              ...(menu.children?.length ? { children: menu.children.map(mapMenu) } : {}),
              ...(menu.redirect ? { redirect: menu.redirect } : {}),
            }

            return route as RouteRecordRaw
          }

          return menus.map(mapMenu)
        },
        // 整合步骤：拉取 -> 转换 -> 注册（方便在路由守卫中直接调用）
        async loadAndRegisterRoutes(
            router: Router,
            componentResolver: ComponentResolver,
        ) {
            const role = useUserStore().role
            const menus = await this.loadMenus(role)
            const routes = this.menusToRoutes(menus, componentResolver)
            console.log('动态路由', routes)
            this.addRoutesToRouter(router, routes)
            this.setRoutesLoaded(true)
            this.setCurrentRole(role)
            return routes
        },

        // 恢复持久化的路由
        async restoreRoutesFromPersist(
            router: Router,
            componentResolver: ComponentResolver,
        ) {
            const userStore = useUserStore()
            const role = userStore.role
            // 没有持久化菜单则无法恢复
            if (!this.menus) return []

            const routes = this.menusToRoutes(this.menus, componentResolver)
            this.addRoutesToRouter(router, routes)
            this.setRoutesLoaded(true)
            this.setCurrentRole(role)
            return routes
        },

        // register routes into a router instance and keep added route names for cleanup
        addRoutesToRouter(router: Router, routes: RouteRecordRaw[], parentName?: string) {
          routes.forEach(routeItem => {
            // 记录动态添加的路由 name
            if (routeItem.name && !this.addedRouteNames.includes(routeItem.name as string)) {
              this.addedRouteNames.push(routeItem.name as string)
            }

            if (router.hasRoute(routeItem.name as string)) {
              return;
            }

            if (parentName) {
              router.addRoute(parentName,routeItem)
            } else {
              router.addRoute(routeItem)
            }


            if (routeItem.children?.length) {
              this.addRoutesToRouter(router, routeItem.children, routeItem.name as string)
            }
          })
        },
    },
    persist: true,
})
