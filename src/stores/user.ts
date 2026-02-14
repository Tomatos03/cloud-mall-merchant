import { defineStore } from 'pinia'


// 用户状态类型定义，规定了用户状态包含哪些字段及类型

export interface UserState {
    uid: string // 用户ID
    username: string // 用户名
    nickname: string // 用户昵称
    role: string // 用户角色
    token: string // 登录令牌
    avatarUrl: string // 用户头像URL
    storeId: string // 店铺ID
    storeName: string // 店铺名称
}

/**
 * 用户状态管理 Store
 * - 用于集中管理用户相关的状态数据
 * - 支持持久化，自动同步到 localStorage
 */
export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        uid: '',
        username: '',
        nickname: '',
        role: '',
        token: '',
        avatarUrl: '',
        storeId: '',
        storeName: '',
    }),
    getters: {
        // 获取显示名称，优先使用昵称，其次使用用户名
        displayName: (state) => state.nickname || state.username,
    },
    actions: {
        setToken(token: string) {
          this.token = token
        },
        /**
         * 批量设置用户信息
         * @param user 传入部分或全部用户字段，自动合并到当前状态
         */
        setUser(user: Partial<UserState>) {
            Object.assign(this, user)
        },

        /**
         * 更新用户个人资料
         * @param profile 个人资料数据
         */
        updateProfile(profile: Partial<UserState>) {
            if (profile.nickname !== undefined) this.nickname = profile.nickname
            if (profile.avatarUrl !== undefined) this.avatarUrl = profile.avatarUrl
        },

        /**
         * 清空用户信息（如退出登录时调用）
         */
        clearUser() {
            // 使用 $reset() 方法彻底重置所有用户状态，确保完全清理持久化数据
            this.$reset()
        },
    },
    // persist 配置用于状态持久化（依赖 pinia-plugin-persistedstate 插件）
    persist: true,
})
