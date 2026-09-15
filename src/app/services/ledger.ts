import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Customer,
  Transaction,
  CustomerSummary,
  LedgerOverview,
  TransactionWithBalance,
  SheetConfig,
  TransactionType,
  BusinessProfile,
  RecentTransactionItem
} from '../models/ledger.models';
import { getCookie, setCookie, deleteCookie } from '../utils/cookie.utils';
import { I18nService, LanguageCode } from './i18n';

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const COOKIE_KEYS = {
  SHEET_URL: 'okcredit_sheet_url',
  BUSINESS_NAME: 'okcredit_shop_name',
  SHEET_NAME: 'okcredit_sheet_name',
  LAST_SYNCED: 'okcredit_last_synced',
  AUTO_SYNC: 'okcredit_auto_sync',
  OWNER_NAME: 'okcredit_owner_name',
  PHONE: 'okcredit_phone',
  ADDRESS: 'okcredit_address',
  UPI_ID: 'okcredit_upi_id',
  CATEGORY: 'okcredit_category',
  CUSTOM_QR: 'okcredit_custom_qr'
};

interface SheetApiResponse {
  status?: string;
  message?: string;
  sheetName?: string;
  isPermissionError?: boolean;
  error?: string;
  customers?: Customer[];
  transactions?: Transaction[];
  settings?: Partial<BusinessProfile>;
}

@Injectable({
  providedIn: 'root'
})
export class Ledger {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly i18n = inject(I18nService);

  // Core reactive in-memory signals (zero disk latency, ultra-fast UI)
  readonly businessName = signal<string>('Shree Ganesh Traders');
  readonly ownerName = signal<string>('Ramesh Kumar');
  readonly phone = signal<string>('9876543210');
  readonly address = signal<string>('Shop No. 12, Main Bazar');
  readonly upiId = signal<string>('ganeshtraders@upi');
  readonly businessCategory = signal<string>('Kirana & General Store');
  readonly customQrUrl = signal<string>('');

  readonly customers = signal<Customer[]>([]);
  readonly transactions = signal<Transaction[]>([]);
  readonly activeCustomerId = signal<string | null>(null);
  readonly isInitialLoading = signal<boolean>(false);

  readonly sheetConfig = signal<SheetConfig>({
    scriptUrl: '',
    autoSync: true,
    syncStatus: 'idle'
  });

  // UI status and notification signals
  readonly toastMessage = signal<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initSessionFromCookies();
    this.setupBackgroundSync();
  }

  private initSessionFromCookies(): void {
    if (!this.isBrowser) return;

    // Purge any legacy localStorage and sessionStorage data
    // Directive: Koi data local ya session me nahi rahega, direct Google Sheet se sync hoga
    try {
      localStorage.removeItem('okcredit_customers_v1');
      localStorage.removeItem('okcredit_transactions_v1');
      localStorage.removeItem('okcredit_sheet_config_v1');
      localStorage.removeItem('okcredit_business_name_v1');
      sessionStorage.clear();
    } catch {
      // ignore
    }

    // Fast session lookup via Cookies
    const cookieSheetUrl = getCookie(COOKIE_KEYS.SHEET_URL) || '';
    const cookieShop = getCookie(COOKIE_KEYS.BUSINESS_NAME) || 'Shree Ganesh Traders';
    const cookieSheetName = getCookie(COOKIE_KEYS.SHEET_NAME) || '';
    const cookieLastSync = getCookie(COOKIE_KEYS.LAST_SYNCED) || '';
    const cookieOwner = getCookie(COOKIE_KEYS.OWNER_NAME);
    const cookiePhone = getCookie(COOKIE_KEYS.PHONE);
    const cookieAddress = getCookie(COOKIE_KEYS.ADDRESS);
    const cookieUpi = getCookie(COOKIE_KEYS.UPI_ID);
    const cookieCat = getCookie(COOKIE_KEYS.CATEGORY);
    const cookieCustomQr = getCookie(COOKIE_KEYS.CUSTOM_QR);

    this.businessName.set(cookieShop);
    if (cookieOwner) this.ownerName.set(cookieOwner);
    if (cookiePhone) this.phone.set(cookiePhone);
    if (cookieAddress) this.address.set(cookieAddress);
    if (cookieUpi) this.upiId.set(cookieUpi);
    if (cookieCat) this.businessCategory.set(cookieCat);
    if (cookieCustomQr) this.customQrUrl.set(cookieCustomQr);

    if (cookieSheetUrl) {
      this.sheetConfig.set({
        scriptUrl: cookieSheetUrl,
        autoSync: true,
        connectedSheetName: cookieSheetName,
        lastSyncedAt: cookieLastSync,
        syncStatus: 'syncing'
      });

      // Directly pull latest data from Google Sheet into memory
      this.isInitialLoading.set(true);
      this.pullFromGoogleSheet(false).finally(() => {
        this.isInitialLoading.set(false);
      });
    } else {
      // First time / Not connected: Empty in-memory dataset, prompts user to connect Sheet
      this.customers.set([]);
      this.transactions.set([]);
      this.sheetConfig.set({
        scriptUrl: '',
        autoSync: true,
        syncStatus: 'idle'
      });
    }
  }

  private setupBackgroundSync(): void {
    if (!this.isBrowser) return;

    // Continuous automatic background sync every 30 seconds
    setInterval(() => {
      const cfg = this.sheetConfig();
      if (cfg.scriptUrl && cfg.autoSync && cfg.syncStatus !== 'syncing') {
        this.pullFromGoogleSheet(false);
      }
    }, 30000);

    // Auto-sync whenever tab/window regains focus
    window.addEventListener('focus', () => {
      const cfg = this.sheetConfig();
      if (cfg.scriptUrl && cfg.autoSync && cfg.syncStatus !== 'syncing') {
        this.pullFromGoogleSheet(false);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const cfg = this.sheetConfig();
        if (cfg.scriptUrl && cfg.autoSync && cfg.syncStatus !== 'syncing') {
          this.pullFromGoogleSheet(false);
        }
      }
    });
  }

  // Computed: Customer Summaries with calculated balances
  readonly customerSummaries = computed<CustomerSummary[]>(() => {
    const custs = this.customers();
    const txs = this.transactions();

    return custs.map((cust) => {
      const custTxs = txs
        .filter((t) => t.customerId === cust.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let totalGave = 0;
      let totalReceived = 0;

      for (const t of custTxs) {
        if (t.type === 'gave') {
          totalGave += Number(t.amount || 0);
        } else {
          totalReceived += Number(t.amount || 0);
        }
      }

      const netBalance = totalGave - totalReceived;
      let status: 'due' | 'advance' | 'settled' = 'settled';
      if (netBalance > 0) {
        status = 'due';
      } else if (netBalance < 0) {
        status = 'advance';
      }

      return {
        customer: cust,
        totalGave,
        totalReceived,
        netBalance,
        status,
        lastTransaction: custTxs[0],
        transactionCount: custTxs.length
      };
    });
  });

  // Computed: Overall Ledger Totals (Aapko Lena Hai, Aapko Dena Hai)
  readonly overview = computed<LedgerOverview>(() => {
    const summaries = this.customerSummaries();

    let totalDue = 0;
    let totalAdvance = 0;
    let dueCount = 0;
    let advanceCount = 0;
    let settledCount = 0;

    for (const s of summaries) {
      if (s.netBalance > 0) {
        totalDue += s.netBalance;
        dueCount++;
      } else if (s.netBalance < 0) {
        totalAdvance += Math.abs(s.netBalance);
        advanceCount++;
      } else {
        settledCount++;
      }
    }

    return {
      totalDue,
      totalAdvance,
      netBalance: totalDue - totalAdvance,
      dueCustomerCount: dueCount,
      advanceCustomerCount: advanceCount,
      settledCustomerCount: settledCount,
      totalCustomerCount: summaries.length
    };
  });

  // Computed: Currently selected customer
  readonly activeCustomer = computed<Customer | null>(() => {
    const id = this.activeCustomerId();
    if (!id) return null;
    return this.customers().find((c) => c.id === id) || null;
  });

  // Computed: Active customer summary
  readonly activeCustomerSummary = computed<CustomerSummary | null>(() => {
    const id = this.activeCustomerId();
    if (!id) return null;
    return this.customerSummaries().find((s) => s.customer.id === id) || null;
  });

  // Computed: Chronological ledger transactions with running balance for active customer
  readonly activeCustomerLedger = computed<TransactionWithBalance[]>(() => {
    const id = this.activeCustomerId();
    if (!id) return [];

    const custTxs = this.transactions()
      .filter((t) => t.customerId === id)
      // Sort oldest to newest to compute running balance
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentBalance = 0;
    const withBalance: TransactionWithBalance[] = [];

    for (const tx of custTxs) {
      if (tx.type === 'gave') {
        currentBalance += Number(tx.amount || 0);
      } else {
        currentBalance -= Number(tx.amount || 0);
      }
      withBalance.push({
        ...tx,
        runningBalance: currentBalance
      });
    }

    // Return newest first for display in ledger table
    return withBalance.reverse();
  });

  // Computed: All-time Total Given (Udhar Diya)
  readonly totalGaveAllTime = computed<number>(() => {
    return this.transactions().reduce((sum, tx) => tx.type === 'gave' ? sum + Number(tx.amount || 0) : sum, 0);
  });

  // Computed: All-time Total Received (Jama Liya)
  readonly totalReceivedAllTime = computed<number>(() => {
    return this.transactions().reduce((sum, tx) => tx.type === 'received' ? sum + Number(tx.amount || 0) : sum, 0);
  });

  // Computed: Recovery Rate Percentage
  readonly recoveryRate = computed<number>(() => {
    const gave = this.totalGaveAllTime();
    const received = this.totalReceivedAllTime();
    if (gave === 0) return 100;
    return Math.min(100, Math.round((received / gave) * 100));
  });

  // Computed: Top Due Customers (defaulters/priority recovery)
  readonly topDueCustomers = computed<CustomerSummary[]>(() => {
    return this.customerSummaries()
      .filter((s) => s.netBalance > 0)
      .sort((a, b) => b.netBalance - a.netBalance)
      .slice(0, 5);
  });

  // Computed: Recent Transactions Across Store (Latest 10)
  readonly recentTransactions = computed<RecentTransactionItem[]>(() => {
    const txs = [...this.transactions()];
    const custMap = new Map<string, Customer>();
    for (const c of this.customers()) {
      custMap.set(c.id, c);
    }

    return txs
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
      .slice(0, 10)
      .map((t) => {
        const cust = custMap.get(t.customerId);
        return {
          ...t,
          customerName: cust ? cust.name : 'Grahak',
          customerPhone: cust ? cust.phone : ''
        };
      });
  });

  // Profile update
  updateProfile(profile: Partial<BusinessProfile>): void {
    if (profile.businessName !== undefined && profile.businessName.trim()) {
      this.businessName.set(profile.businessName.trim());
      setCookie(COOKIE_KEYS.BUSINESS_NAME, profile.businessName.trim(), 365);
    }
    if (profile.ownerName !== undefined && profile.ownerName.trim()) {
      this.ownerName.set(profile.ownerName.trim());
      setCookie(COOKIE_KEYS.OWNER_NAME, profile.ownerName.trim(), 365);
    }
    if (profile.phone !== undefined) {
      this.phone.set(profile.phone.trim());
      setCookie(COOKIE_KEYS.PHONE, profile.phone.trim(), 365);
    }
    if (profile.address !== undefined) {
      this.address.set(profile.address.trim());
      setCookie(COOKIE_KEYS.ADDRESS, profile.address.trim(), 365);
    }
    if (profile.upiId !== undefined) {
      this.upiId.set(profile.upiId.trim());
      setCookie(COOKIE_KEYS.UPI_ID, profile.upiId.trim(), 365);
    }
    if (profile.businessCategory !== undefined) {
      this.businessCategory.set(profile.businessCategory.trim());
      setCookie(COOKIE_KEYS.CATEGORY, profile.businessCategory.trim(), 365);
    }
    if (profile.customQrUrl !== undefined) {
      this.customQrUrl.set(profile.customQrUrl);
      if (profile.customQrUrl) {
        setCookie(COOKIE_KEYS.CUSTOM_QR, profile.customQrUrl, 365);
      } else {
        deleteCookie(COOKIE_KEYS.CUSTOM_QR);
      }
    }
    this.triggerBackgroundSync();
    this.showToast('Vyapar profile details update ho gayi hain', 'success');
  }

  // Export Complete Ledger to CSV
  exportLedgerCsv(): void {
    if (!this.isBrowser) return;

    const custMap = new Map<string, Customer>();
    for (const c of this.customers()) {
      custMap.set(c.id, c);
    }

    const headers = ['Transaction ID', 'Date', 'Customer Name', 'Phone', 'Address', 'Type (Gave/Received)', 'Amount (INR)', 'Note', 'Created At'];
    const rows = this.transactions().map((t) => {
      const c = custMap.get(t.customerId);
      return [
        `"${t.id}"`,
        `"${t.date}"`,
        `"${(c?.name || '').replace(/"/g, '""')}"`,
        `"${c?.phone || ''}"`,
        `"${(c?.address || '').replace(/"/g, '""')}"`,
        `"${t.type === 'gave' ? 'Maine Diye (Udhar)' : 'Maine Liye (Jama)'}"`,
        `"${t.amount}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`,
        `"${t.createdAt}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `Udhar_Bahi_Khata_${this.businessName().replace(/\s+/g, '_')}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('CSV Bahi Khata file download ho gayi!', 'success');
  }

  // Export JSON Backup
  exportLedgerJson(): void {
    if (!this.isBrowser) return;

    const data = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      businessName: this.businessName(),
      ownerName: this.ownerName(),
      phone: this.phone(),
      address: this.address(),
      upiId: this.upiId(),
      businessCategory: this.businessCategory(),
      customQrUrl: this.customQrUrl(),
      customers: this.customers(),
      transactions: this.transactions()
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `OkCredit_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('JSON Backup file download ho gayi!', 'success');
  }

  // Import JSON Backup
  importLedgerJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.customers) && Array.isArray(parsed.transactions)) {
        this.customers.set(parsed.customers);
        this.transactions.set(parsed.transactions);
        if (parsed.businessName) {
          this.businessName.set(parsed.businessName);
          setCookie(COOKIE_KEYS.BUSINESS_NAME, parsed.businessName, 365);
        }
        if (parsed.ownerName) {
          this.ownerName.set(parsed.ownerName);
          setCookie(COOKIE_KEYS.OWNER_NAME, parsed.ownerName, 365);
        }
        if (parsed.phone) {
          this.phone.set(parsed.phone);
          setCookie(COOKIE_KEYS.PHONE, parsed.phone, 365);
        }
        if (parsed.address) {
          this.address.set(parsed.address);
          setCookie(COOKIE_KEYS.ADDRESS, parsed.address, 365);
        }
        if (parsed.upiId) {
          this.upiId.set(parsed.upiId);
          setCookie(COOKIE_KEYS.UPI_ID, parsed.upiId, 365);
        }
        if (parsed.businessCategory) {
          this.businessCategory.set(parsed.businessCategory);
          setCookie(COOKIE_KEYS.CATEGORY, parsed.businessCategory, 365);
        }
        if (parsed.customQrUrl !== undefined) {
          this.customQrUrl.set(parsed.customQrUrl);
          if (parsed.customQrUrl) {
            setCookie(COOKIE_KEYS.CUSTOM_QR, parsed.customQrUrl, 365);
          } else {
            deleteCookie(COOKIE_KEYS.CUSTOM_QR);
          }
        }
        this.triggerBackgroundSync();
        this.showToast('Backup successfully restore ho gaya!', 'success');
        return true;
      } else {
        throw new Error('Invalid backup structure');
      }
    } catch {
      this.showToast('Backup file corrupt ya invalid hai', 'error');
      return false;
    }
  }

  // Business Name update
  setBusinessName(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    this.businessName.set(trimmed);
    setCookie(COOKIE_KEYS.BUSINESS_NAME, trimmed, 365);
    this.triggerBackgroundSync();
    this.showToast('Shop/Business name updated', 'success');
  }

  // Select Customer
  selectCustomer(id: string | null): void {
    this.activeCustomerId.set(id);
  }

  // Customer CRUD - Instant in-memory operations with background Google Sheet sync
  addCustomer(name: string, phone: string, address?: string): Customer {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    const newCustomer: Customer = {
      id: generateUuid(),
      name: trimmedName,
      phone: trimmedPhone,
      address: address?.trim() || '',
      createdAt: new Date().toISOString()
    };

    // Instant local memory update (0ms latency)
    this.customers.update((list) => [newCustomer, ...list]);
    this.showToast(`${trimmedName} grahak joda gaya`, 'success');
    this.triggerBackgroundSync();
    return newCustomer;
  }

  updateCustomer(id: string, updates: { name?: string; phone?: string; address?: string }): void {
    this.customers.update((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              ...(updates.name ? { name: updates.name.trim() } : {}),
              ...(updates.phone ? { phone: updates.phone.trim() } : {}),
              ...(updates.address !== undefined ? { address: updates.address.trim() } : {}),
              updatedAt: new Date().toISOString()
            }
          : c
      )
    );
    this.showToast('Customer information updated', 'success');
    this.triggerBackgroundSync();
  }

  deleteCustomer(id: string): void {
    const cust = this.customers().find((c) => c.id === id);
    const name = cust ? cust.name : 'Customer';

    this.customers.update((list) => list.filter((c) => c.id !== id));
    this.transactions.update((list) => list.filter((t) => t.customerId !== id));

    if (this.activeCustomerId() === id) {
      this.activeCustomerId.set(null);
    }

    this.showToast(`${name} aur unka hisab hata diya gaya`, 'info');
    this.triggerBackgroundSync();
  }

  // Transaction CRUD - Instant in-memory operations with background Google Sheet sync
  addTransaction(customerId: string, type: TransactionType, amount: number, note?: string, date?: string): Transaction {
    const numAmount = Math.abs(Number(amount));
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid amount');
    }

    const newTx: Transaction = {
      id: generateUuid(),
      customerId,
      type,
      amount: numAmount,
      note: note?.trim() || '',
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Instant local memory update
    this.transactions.update((list) => [newTx, ...list]);

    const actionText = type === 'gave' ? 'Udhar (Maine Diye)' : 'Jama (Maine Liye)';
    this.showToast(`₹${numAmount.toLocaleString('en-IN')} ${actionText} record kiya gaya`, 'success');
    this.triggerBackgroundSync();
    return newTx;
  }

  updateTransaction(id: string, updates: { amount?: number; note?: string; date?: string; type?: TransactionType }): void {
    this.transactions.update((list) =>
      list.map((t) => {
        if (t.id === id) {
          const newAmount = updates.amount !== undefined ? Math.abs(Number(updates.amount)) : t.amount;
          return {
            ...t,
            ...(updates.amount !== undefined ? { amount: newAmount } : {}),
            ...(updates.note !== undefined ? { note: updates.note.trim() } : {}),
            ...(updates.date ? { date: updates.date } : {}),
            ...(updates.type ? { type: updates.type } : {})
          };
        }
        return t;
      })
    );
    this.showToast('Transaction updated', 'success');
    this.triggerBackgroundSync();
  }

  deleteTransaction(id: string): void {
    this.transactions.update((list) => list.filter((t) => t.id !== id));
    this.showToast('Entry delete kar di gayi', 'info');
    this.triggerBackgroundSync();
  }

  // Toast notification helper
  showToast(text: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => {
      if (this.toastMessage()?.text === text) {
        this.toastMessage.set(null);
      }
    }, 4000);
  }

  dismissToast(): void {
    this.toastMessage.set(null);
  }

  // ==========================================
  // GOOGLE SHEETS / EXCEL SYNC ENGINE
  // ==========================================

  saveSheetConfig(scriptUrl: string, autoSync = true, sheetName?: string): void {
    const cleanUrl = scriptUrl.trim();
    setCookie(COOKIE_KEYS.SHEET_URL, cleanUrl, 365);
    setCookie(COOKIE_KEYS.AUTO_SYNC, String(autoSync), 365);
    if (sheetName) {
      setCookie(COOKIE_KEYS.SHEET_NAME, sheetName, 365);
    }

    this.sheetConfig.update((c) => ({
      ...c,
      scriptUrl: cleanUrl,
      autoSync,
      connectedSheetName: sheetName || c.connectedSheetName,
      syncStatus: 'idle',
      errorMessage: undefined
    }));

    // Auto-pull fresh data immediately from connected sheet
    this.pullFromGoogleSheet(false);
  }

  disconnectSheet(): void {
    deleteCookie(COOKIE_KEYS.SHEET_URL);
    deleteCookie(COOKIE_KEYS.SHEET_NAME);
    deleteCookie(COOKIE_KEYS.LAST_SYNCED);

    // Clear in-memory active data completely (no storage persistence)
    this.customers.set([]);
    this.transactions.set([]);
    this.activeCustomerId.set(null);

    this.sheetConfig.set({
      scriptUrl: '',
      autoSync: true,
      syncStatus: 'idle'
    });
    this.showToast('Google Sheet disconnected. Local me koi data nahi bacha hai.', 'info');
  }

  async testConnection(url: string): Promise<{ success: boolean; message: string; sheetName?: string; isPermissionError?: boolean }> {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      return { success: false, message: 'Google Apps Script Web App URL dalna zaroori hai.' };
    }

    try {
      // First attempt backend proxy (for local dev / SSR)
      let resData: SheetApiResponse | null = null;
      let isSuccess = false;

      try {
        const response = await fetch('/api/sheet-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scriptUrl: cleanUrl,
            action: 'test'
          })
        });

        if (response.status !== 404) {
          resData = await response.json();
          isSuccess = response.ok && resData?.status === 'success';
        }
      } catch {
        // Backend proxy unavailable (e.g. static hosting on GitHub Pages)
        resData = null;
      }

      // If backend proxy not available or 404, fallback to direct client-side fetch (GitHub Pages mode)
      if (!resData) {
        const testUrl = new URL(cleanUrl);
        testUrl.searchParams.set('action', 'test');
        const directRes = await fetch(testUrl.toString(), {
          method: 'GET',
          redirect: 'follow',
          headers: { Accept: 'application/json, text/plain, */*' }
        });
        const text = await directRes.text();
        try {
          resData = JSON.parse(text);
          isSuccess = resData?.status === 'success';
        } catch {
          return {
            success: false,
            message: 'Google Apps Script se valid response nahi mila. Check karein ki "Who has access" = "Anyone" set hai.'
          };
        }
      }

      if (isSuccess) {
        return {
          success: true,
          message: resData?.message || 'Sheet se connection successful!',
          sheetName: resData?.sheetName || 'Google Sheet'
        };
      } else {
        return {
          success: false,
          isPermissionError: resData?.isPermissionError,
          message: resData?.error || resData?.message || 'Connection fail hua. Kripya URL check karein.'
        };
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error';
      return { success: false, message: `Connection error: ${msg}` };
    }
  }

  triggerBackgroundSync(): void {
    const config = this.sheetConfig();
    if (!config.scriptUrl) {
      return;
    }
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }
    this.syncDebounceTimer = setTimeout(() => {
      this.syncWithGoogleSheet(false);
    }, 600);
  }

  async syncWithGoogleSheet(showFeedback = true): Promise<void> {
    const config = this.sheetConfig();
    if (!config.scriptUrl) {
      if (showFeedback) {
        this.showToast('Kripya pehle Google Sheet ka Web App link connect karein', 'info');
      }
      return;
    }

    this.sheetConfig.update((c) => ({ ...c, syncStatus: 'syncing', errorMessage: undefined }));

    try {
      // Send current in-memory state directly to Google Sheet including Settings
      const currentLang = this.i18n.currentLanguage();
      const payload = {
        customers: this.customers(),
        transactions: this.transactions(),
        settings: {
          businessName: this.businessName(),
          ownerName: this.ownerName(),
          phone: this.phone(),
          address: this.address(),
          businessCategory: this.businessCategory(),
          upiId: this.upiId(),
          customQrUrl: this.customQrUrl(),
          language: currentLang
        }
      };

      let resData: SheetApiResponse | null = null;
      let isSuccess = false;

      // 1. Try server-side proxy first (for dev/SSR)
      try {
        const response = await fetch('/api/sheet-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scriptUrl: config.scriptUrl,
            action: 'saveData',
            data: payload
          })
        });

        if (response.status !== 404) {
          resData = await response.json();
          isSuccess = response.ok && resData?.status === 'success';
        }
      } catch {
        resData = null;
      }

      // 2. Static host fallback (direct browser POST with text/plain to bypass CORS preflight)
      if (!resData) {
        const directRes = await fetch(config.scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'saveData',
            data: payload
          }),
          redirect: 'follow'
        });
        const text = await directRes.text();
        try {
          resData = JSON.parse(text);
          isSuccess = resData?.status === 'success';
        } catch {
          isSuccess = false;
        }
      }

      if (isSuccess) {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setCookie(COOKIE_KEYS.LAST_SYNCED, nowStr, 365);
        this.sheetConfig.update((c) => ({
          ...c,
          syncStatus: 'synced',
          lastSyncedAt: nowStr,
          errorMessage: undefined
        }));
        if (showFeedback) {
          this.showToast('Google Sheet me data safalta se sync ho gaya!', 'success');
        }
      } else {
        const errorMsg = resData?.error || resData?.message || 'Sync failed';
        this.sheetConfig.update((c) => ({
          ...c,
          syncStatus: 'error',
          errorMessage: errorMsg
        }));
        if (showFeedback) {
          this.showToast(`Sync fail: ${errorMsg}`, 'error');
        }
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Network error';
      this.sheetConfig.update((c) => ({
        ...c,
        syncStatus: 'error',
        errorMessage: errorMsg
      }));
      if (showFeedback) {
        this.showToast(`Sync error: ${errorMsg}`, 'error');
      }
    }
  }

  async pullFromGoogleSheet(showFeedback = true): Promise<void> {
    const config = this.sheetConfig();
    if (!config.scriptUrl) {
      if (showFeedback) {
        this.showToast('Google Sheet ka Web App link dalein', 'error');
      }
      return;
    }

    this.sheetConfig.update((c) => ({ ...c, syncStatus: 'syncing', errorMessage: undefined }));

    try {
      let resData: SheetApiResponse | null = null;
      let isSuccess = false;

      // 1. Try server-side proxy first
      try {
        const response = await fetch('/api/sheet-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scriptUrl: config.scriptUrl,
            action: 'getData'
          })
        });

        if (response.status !== 404) {
          resData = await response.json();
          isSuccess = response.ok && resData?.status === 'success';
        }
      } catch {
        resData = null;
      }

      // 2. Static host fallback (direct GET fetch)
      if (!resData) {
        const pullUrl = new URL(config.scriptUrl);
        pullUrl.searchParams.set('action', 'getData');
        const directRes = await fetch(pullUrl.toString(), {
          method: 'GET',
          redirect: 'follow',
          headers: { Accept: 'application/json, text/plain, */*' }
        });
        const text = await directRes.text();
        try {
          resData = JSON.parse(text);
          isSuccess = resData?.status === 'success';
        } catch {
          isSuccess = false;
        }
      }

      if (isSuccess && resData) {
        const sheetCustomers: Customer[] = (resData.customers || []).map((c: Customer) => ({
          ...c,
          id: c.id ? String(c.id) : generateUuid()
        }));
        const sheetTransactions: Transaction[] = (resData.transactions || []).map((t: Transaction) => ({
          ...t,
          id: t.id ? String(t.id) : generateUuid()
        }));

        // Direct in-memory signals update
        this.customers.set(sheetCustomers);
        this.transactions.set(sheetTransactions);

        // Restore store profile & user settings from Settings tab if present
        if (resData.settings) {
          const s = resData.settings;
          if (s.businessName && s.businessName.trim()) {
            this.businessName.set(s.businessName.trim());
            setCookie(COOKIE_KEYS.BUSINESS_NAME, s.businessName.trim(), 365);
          }
          if (s.ownerName && s.ownerName.trim()) {
            this.ownerName.set(s.ownerName.trim());
            setCookie(COOKIE_KEYS.OWNER_NAME, s.ownerName.trim(), 365);
          }
          if (s.phone && s.phone.trim()) {
            this.phone.set(s.phone.trim());
            setCookie(COOKIE_KEYS.PHONE, s.phone.trim(), 365);
          }
          if (s.address !== undefined) {
            this.address.set(s.address.trim());
            setCookie(COOKIE_KEYS.ADDRESS, s.address.trim(), 365);
          }
          if (s.businessCategory && s.businessCategory.trim()) {
            this.businessCategory.set(s.businessCategory.trim());
            setCookie(COOKIE_KEYS.CATEGORY, s.businessCategory.trim(), 365);
          }
          if (s.upiId && s.upiId.trim()) {
            this.upiId.set(s.upiId.trim());
            setCookie(COOKIE_KEYS.UPI_ID, s.upiId.trim(), 365);
          }
          if (s.customQrUrl !== undefined) {
            this.customQrUrl.set(s.customQrUrl);
            if (s.customQrUrl) {
              setCookie(COOKIE_KEYS.CUSTOM_QR, s.customQrUrl, 365);
            }
          }
          if (s.language && (s.language === 'hi' || s.language === 'en')) {
            this.i18n.setLanguage(s.language as LanguageCode);
          }
        }

        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setCookie(COOKIE_KEYS.LAST_SYNCED, nowStr, 365);

        this.sheetConfig.update((c) => ({
          ...c,
          syncStatus: 'synced',
          lastSyncedAt: nowStr
        }));

        if (showFeedback) {
          if (sheetCustomers.length > 0 || sheetTransactions.length > 0) {
            this.showToast(`${sheetCustomers.length} grahak aur ${sheetTransactions.length} records sheet se sync hue!`, 'success');
          } else {
            this.showToast('Google Sheet abhi khali hai. Naya grahak jodne par sheet me sync hoga.', 'info');
          }
        }
      } else {
        throw new Error(resData?.error || resData?.message || 'Pull failed');
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Network error';
      this.sheetConfig.update((c) => ({ ...c, syncStatus: 'error', errorMessage: errorMsg }));
      if (showFeedback) {
        this.showToast(`Data load nahi ho paya: ${errorMsg}`, 'error');
      }
    }
  }

  // Quick WhatsApp message generator
  getWhatsAppShareUrl(customer: Customer, netBalance: number): string {
    const shop = this.businessName();
    const formattedAmount = Math.abs(netBalance).toLocaleString('en-IN');
    let message = '';

    if (netBalance > 0) {
      message = `Namaste ${customer.name} ji,\n\n${shop} se aapka total ₹${formattedAmount} ka hisab baki hai.\nKripya samay par bhugtan (payment) karein.\n\nDhanyawad! 🙏`;
    } else if (netBalance < 0) {
      message = `Namaste ${customer.name} ji,\n\n${shop} me aapka ₹${formattedAmount} advance jama hai.\n\nDhanyawad! 🙏`;
    } else {
      message = `Namaste ${customer.name} ji,\n\n${shop} me aapka pura hisab barabar ho chuka hai.\n\nDhanyawad! 🙏`;
    }

    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
  }
}
