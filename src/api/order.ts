import { http } from '@/utils/http'

const PREFIX = '/orders'

// ============ 枚举定义 ============

/**
 * 订单类型枚举
 */
export enum OrderType {
    /**
     * 父订单（聚合订单，多店铺场景）
     */
    PARENT = 'PARENT',

    /**
     * 子订单（多店铺场景下的单个店铺订单）
     */
    SUB = 'SUB',

    /**
     * 普通订单（单店铺场景）
     */
    NORMAL = 'NORMAL',
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
    /**
     * 待支付
     */
    CREATED = 'CREATED',

    /**
     * 已支付
     */
    PAID = 'PAID',

    /**
     * 已发货
     */
    SHIPPED = 'SHIPPED',

    /**
     * 已完成
     */
    FINISHED = 'FINISHED',

    /**
     * 已取消
     */
    CANCELED = 'CANCELED',

    /**
     * 已关闭
     */
    CLOSED = 'CLOSED',
}

// ============ 类型定义 ============

/**
 * 订单详情中的商品项
 */
export interface OrderGoodsItem {
    goodsId: string // 商品ID
    goodsName: string // 商品名称
    goodsMainImageUrl: string // 商品图片
    goodsPrice: string // 商品价格（单位：元）
    quantity: number // 数量
    totalPrice: string // 小计（单位：元）
    createTime: string // 创建时间
    selectedSpecs?: Record<string, string> // 选中的规格（规格名： 规格值）
}

/**
 * 子订单/店铺订单项
 */
export interface OrderStoreItem {
    orderNo: string // 子订单号
    storeId: string // 店铺ID
    storeName: string // 店铺名称
    status: string // 订单状态
    items: OrderGoodsItem[] // 商品列表
    totalPrice: string // 该店铺订单总价（单位：元）
    count: number // 商品总数
}

/**
 * 订单详情对象
 */
export interface OrderDetail {
    orderNo: string // 主订单号
    status: string // 订单状态
    createTime: string // 下单时间
    storeOrders: OrderStoreItem[] // 店铺订单列表
    totalPrice: string // 订单总价（单位：元）
}

/**
 * 订单列表项类型 (用于表格展示)
 */
export interface OrderItem {
    orderNo: string // 订单号
    orderStatus: string // 订单状态
    orderType: OrderType // 订单类型
    createTime: string // 下单时间
    goodsNum: number // 商品数量
    totalPrice: string // 订单总价（单位：元）
    buyerName: string // 买家名称
    phone: string // 电话
    detailAddress: string // 详细地址
}

// ============ 状态映射 ============

/**
 * 订单状态映射
 */
export const OrderStatusMap: Record<
    string,
    { label: string; type: 'warning' | 'primary' | 'success' | 'info' | 'danger' }
> = {
    CREATED: { label: '等待买家付款', type: 'warning' },
    PAID: { label: '等待发货', type: 'primary' },
    SHIPPED: { label: '已发货', type: 'success' },
    FINISHED: { label: '交易完成', type: 'success' },
    CANCELED: { label: '订单已取消', type: 'info' },
    CLOSED: { label: '订单已关闭', type: 'info' },
}

// ============ 工具函数 ============

/**
 * 获取订单状态信息
 * @param status 订单状态码
 */
export function getOrderStatusInfo(status: OrderStatus) {
    if (!status) {
        return { label: '-', type: 'info' as const }
    }
    return OrderStatusMap[status] || { label: '-', type: 'info' as const }
}

/**
 * 获取订单类型标签
 */
export function getOrderTypeLabel(orderType: OrderType): string {
    const typeMap: Record<string, string> = {
        [OrderType.PARENT]: '聚合订单',
        [OrderType.SUB]: '普通订单',
        [OrderType.NORMAL]: '普通订单',
    }
    return typeMap[orderType] || '-'
}

// ============ 分页相关 ============

/**
 * 分页查询参数
 */
export interface OrderPageParams {
    page: number
    pageSize: number
    status?: string // 订单状态（可选）
    [key: string]: string | number | undefined
}

/**
 * 分页响应结构
 */
export interface OrderPageResult {
    records: OrderItem[]
    total: number
    page: number
    pageSize: number
}

// ============ API 函数 ============

/**
 * 获取订单列表（分页查询）
 * @param params 分页查询参数
 */
export function fetchOrderPage(params: OrderPageParams) {
    return http.get<OrderPageResult>(`${PREFIX}/page`, { params })
}

/**
 * 获取订单详情
 * @param orderNo 订单号
 */
export function fetchOrderDetail(orderNo: string) {
    return http.get<OrderDetail>(`${PREFIX}/${orderNo}`)
}

/**
 * 取消订单
 * @param orderNo 订单号
 */
export function cancelOrder(orderNo: string) {
    return http.put(`${PREFIX}/${orderNo}/cancel`)
}

/**
 * 发货
 * @param orderNo 订单号
 */
export function shipOrder(orderNo: string) {
    return http.put(`${PREFIX}/${orderNo}/ship`)
}
