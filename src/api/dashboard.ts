/**
 * 工作台统计数据 API
 */
import { http } from '@/utils/http'

const PREFIX = '/statistics'

/**
 * 仪表板概览（对应 DashboardOverviewVO）
 */
export interface DashboardOverview {
    todayRevenue: number // 今日营收（已支付订单金额）
    todayOrderCount: number // 今日订单数（成功下单）
    todayNewUserCount: number // 今日新增用户数
    totalRevenue: number // 累计营收（历史总收入）
}

/**
 * 仪表板完整数据（一次性获取所有数据）
 */
export interface DashboardData {
    dashboardOverview: DashboardOverview // 核心指标概览
    revenueTrend: Record<string, number> // 销售趋势数据（默认7天）
    goodsSalesRank: TopProduct[] // 商品销量排行
    categorySalesRatio: CategoryRatio[] // 分类销售占比
    goodsFavoriteRank: TopCollectedProduct[] // 收藏商品排行
}

/**
 * 商城核心指标概览
 */
export interface MallSummary {
    todayRevenue: number // 今日营收：今日已支付订单的总金额
    todayOrders: number // 今日订单：今日新增的订单总数
    todayNewUsers: number // 今日新增用户：今日新注册的用户数
    totalRevenue: number // 累计营收：商城上线至今所有已支付订单总额
    totalOrders: number // 累计订单：商城上线至今所有订单总数
    totalUsers: number // 累计用户：商城注册用户总数
    revenueTrend: number // 营收同比：(今日营收 - 昨日营收) / 昨日营收 * 100
    orderTrend: number // 订单同比：(今日订单 - 昨日订单) / 昨日订单 * 100
}

/**
 * 商品销量排行项
 */
export interface TopProduct {
    rank: number // 排名
    goodsId: number // 商品ID
    goodsName: string // 商品名称
    goodsCover: string // 商品封面图
    saleCount: number // 销量（核心排序指标）
    saleAmount: string // 销售额
}

/**
 * 分类占比项
 */
export interface CategoryRatio {
    categoryId: string // 分类ID
    categoryName: string // 分类名称
    saleAmount: number // 销售额
    saleRatio: number // 销售占比
}

/**
 * 收藏商品排行项
 */
export interface TopCollectedProduct {
    rank: number // 排名
    goodsId: string // 商品ID
    goodsName: string // 商品名称
    goodsImage: string // 商品图片
    favoriteTotal: number // 累计收藏数
    favoriteLast7Days: number // 最近7天收藏数
}

/**
 * 获取仪表板完整数据（一次性获取所有数据）
 */
export function getDashboardData() {
    return http.get<DashboardData>(`${PREFIX}/all`)
}

/**
 * 获取销售趋势数据
 * @param days 天数，如 7 或 30
 */
export function getSalesTrend(days: number) {
    return http.get<Record<string, number>>(`${PREFIX}/revenue-trend`, { params: { days } })
}
