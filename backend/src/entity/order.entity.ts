/**
 * 订单实体
 */
export interface Order {
  id: string;
  userId: number;
  username: string;
  blindBoxId: number;
  blindBoxName: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * 订单创建请求数据结构
 */
export interface CreateOrderDto {
  blindBoxId: number;
  quantity: number;
}

/**
 * 订单更新请求数据结构
 */
export interface UpdateOrderDto {
  status?: 'pending' | 'completed' | 'cancelled';
}
