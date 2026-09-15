export type TransactionType = 'gave' | 'received'; // 'gave' = Maine Diye (Udhar/Debit), 'received' = Maine Liye (Payment/Credit)

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  date: string; // ISO date string or YYYY-MM-DD
  createdAt: string;
}

export interface CustomerSummary {
  customer: Customer;
  totalGave: number;     // Total Udhar diya
  totalReceived: number; // Total Jama kiya
  netBalance: number;    // totalGave - totalReceived. Positive = Customer owes money (Lena hai), Negative = Advance (Dena hai)
  status: 'due' | 'advance' | 'settled';
  lastTransaction?: Transaction;
  transactionCount: number;
}

export interface LedgerOverview {
  totalDue: number;       // Aapko Lena Hai (Total positive net balances)
  totalAdvance: number;   // Aapko Dena Hai (Total negative net balances)
  netBalance: number;     // totalDue - totalAdvance
  dueCustomerCount: number;
  advanceCustomerCount: number;
  settledCustomerCount: number;
  totalCustomerCount: number;
}

export interface TransactionWithBalance extends Transaction {
  runningBalance: number;
}

export interface SheetConfig {
  scriptUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  connectedSheetName?: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  upiId: string;
  businessCategory: string;
}

export interface RecentTransactionItem extends Transaction {
  customerName: string;
  customerPhone: string;
}
