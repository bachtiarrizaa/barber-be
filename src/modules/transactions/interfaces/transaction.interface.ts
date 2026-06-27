import { ICustomer } from '../../customers/entities/customer.entity';
import { IUser } from '../../users/entities/user.entity';
import { IVoucherRedemption } from '../../vouchers/entities/voucher-redemption.entity';
import { ItemType } from '../enums/item-type.enum';

export interface TransactionItemSnapshot {
  itemType: ItemType;
  itemId: string;
  itemName: string;
  price: string;
  quantity: number;
  subtotal: string;
}

export interface FinalizeTransactionParams {
  cashier: IUser;
  barber: IUser;
  customer: ICustomer | null;
  transactionItems: TransactionItemSnapshot[];
  subtotal: number;
  discountAmount: number;
  total: number;
  totalServiceAmount: number;
  totalProductAmount: number;
  serviceCommissionRate: number;
  productCommissionRate: number;
  serviceCommissionAmount: number;
  productCommissionAmount: number;
  totalCommissionAmount: number;
  amountPaid: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'qris' | 'transfer';
  voucherRedemption: IVoucherRedemption | null;
}
