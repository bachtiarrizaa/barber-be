import { ItemType } from '../../transactions/enums/item-type.enum';

export interface TopItemsQueryParams {
  startDate: string;
  endDate: string;
  timezone: string;
  itemType?: ItemType;
  limit: number;
}

export interface TopItemsRawRow {
  itemId: string;
  itemName: string;
  itemType: string;
  totalQuantity: number;
  totalRevenue: string;
  transactionCount: number;
}

export interface TopItemsRow {
  itemId: string;
  itemName: string;
  itemType: string;
  totalQuantity: number;
  totalRevenue: string;
  transactionCount: number;
}
