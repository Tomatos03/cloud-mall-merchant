import { useUserStore } from '@/stores/user'
import { useImStore } from '@/stores/im'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/login/index.vue'),
        },
        {
            path: '/',
            name: 'Home',
            component: () => import('@/layout/home/index.vue'),
            redirect: '/dashboard', // 重定向到工作台
            children: [
                // 工作台
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: () => import('@/views/dashboard/index.vue'),
                    meta: { title: '工作台' },
                },
                // 在线客服
                {
                    path: 'im',
                    name: 'IM',
                    component: () => import('@/views/im/index.vue'),
                    meta: { title: '在线客服', hidden: true },
                },
                // 店铺管理
                {
                    path: 'store',
                    name: 'Store',
                    component: () => import('@/views/store/index.vue'),
                    meta: { title: '店铺装饰' },
                },
                // 商品管理
                {
                    path: 'goods',
                    name: 'Goods',
                    meta: { title: '商品管理' },
                    children: [
                        {
                            path: 'list',
                            name: 'GoodsList',
                            component: () => import('@/views/goods/list/index.vue'),
                            meta: { title: '商品列表' },
                        },
                        {
                            path: 'publish',
                            name: 'GoodsPublish',
                            component: () => import('@/views/goods/publish/index.vue'),
                            meta: { title: '发布商品' },
                        },
                        {
                            path: 'comment',
                            name: 'GoodsComment',
                            component: () => import('@/views/goods/comment/index.vue'),
                            meta: { title: '商品评论' },
                        },
                    ],
                },
                // 订单管理
                {
                    path: 'order',
                    name: 'Order',
                    component: () => import('@/views/order/index.vue'),
                    meta: { title: '订单管理' },
                },
            ],
        },
        {
            path: '/404',
            name: 'NotFound',
            component: () => import('@/views/404/index.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/404',
        },
    ],
})

router.beforeEach(async (to, _from, next) => {
    if (needLogin(to.path)) return next('/login')

    const homePath = needRedirectToHome(to.path)
    if (homePath) return next(homePath)

    return next()
})

router.afterEach((to) => {
    const imStore = useImStore()
    imStore.setInIMPage(to.path.includes('/im'))
})

function needRedirectToHome(path: string) {
    if (path === '/login' && useUserStore().token) {
        return '/'
    }
    return undefined
}

function needLogin(path: string): boolean {
    if (path === '/login') {
        return false
    }
    return !useUserStore().token
}

export default router
