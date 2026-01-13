/**
 * 公共的统计类型定义
 */

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
 * 销售趋势数据点
 */
export interface TrendItem {
    date: string // 日期，如 "2024-03-20"
    revenue: number // 当日营收额
    revenueStr: string // 当日营收额字符串格式，单位元，保留两位小数
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
    saleAmount: string // 销售额（辅助展示，不参与主排序）
}

/**
 * 分类占比项
 */
export interface CategoryRatio {
    categoryId: string // 分类ID
    categoryName: string // 分类名称
    saleAmount: number // 销售额（分）
    saleRatio: number // 销售占比（0-1）
}

/**
 * 收藏统计概览
 */
export interface CollectSummary {
    todayFavoriteAdd: number // 今日新增收藏
    todayFavoriteCancel: number // 今日取消收藏
    todayFavoriteNetIncrease: number // 今日净增加
    totalFavoriteCount: number // 累计收藏总数
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
