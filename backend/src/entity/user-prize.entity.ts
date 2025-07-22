/**
 * 用户奖品实体
 */
export interface UserPrize {
  id: string;
  userId: number;
  prizeId: number;
  prizeName: string;
  prizeDescription: string;
  prizeImageUrl?: string;
  prizeValue: number;
  rarity: string;
  blindBoxId: number;
  blindBoxName: string;
  orderId: string;
  obtainedAt: string;
  createdAt: string;
}

/**
 * 用户奖品创建数据结构
 */
export interface CreateUserPrizeDto {
  userId: number;
  prizeId: number;
  blindBoxId: number;
  orderId: string;
}
