import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { ProfileTab } from './profile-view';
import { Customer } from '../models/ledger.models';
import { I18nService } from '../services/i18n';

@Component({
  selector: 'app-dashboard-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      <!-- 1. Pastel Sky Blue Hero Card ("Today focus" style) -->
      <div class="hero-gradient-blue p-5 sm:p-7 relative overflow-hidden">
        <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/20 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-sky-200/30 blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          <!-- Left: Greeting & Net Balance -->
          <div class="min-w-0">
            <!-- Translucent Pill Tag -->
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-[11px] font-bold text-white mb-3 border border-white/30 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>{{ ledger.businessCategory() }} • {{ i18n.t().todayFocus }}</span>
            </div>

            <!-- Greeting & Business Title -->
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-xs">
              {{ i18n.t().namaste }}, {{ ledger.ownerName() || i18n.t().vyapari }}!
            </h2>
            <p class="text-xs sm:text-sm text-white/85 font-medium mt-0.5">
              {{ ledger.businessName() }} • <span>{{ todayDate() }}</span>
            </p>

            <!-- Net Balance Highlight -->
            <div class="mt-4">
              <span class="text-xs font-bold uppercase tracking-wider text-white/80 block mb-1">
                {{ i18n.t().marketDue }}
              </span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ₹{{ ledger.overview().totalDue.toLocaleString('en-IN') }}
                </span>
                <span class="text-xs font-bold text-white bg-white/25 px-2.5 py-0.5 rounded-full border border-white/30">
                  {{ ledger.overview().dueCustomerCount }} {{ i18n.t().dueCustomersCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Circular Recovery Ring -->
          <div class="shrink-0 flex items-center gap-4 sm:flex-col sm:items-center bg-white/20 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-white/30">
            <div class="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  class="text-white/30"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="text-white transition-all duration-700 ease-out"
                  stroke-dasharray="100, 100"
                  [attr.stroke-dashoffset]="100 - ledger.recoveryRate()"
                  stroke-linecap="round"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="absolute flex flex-col items-center justify-center text-center">
                <span class="text-xs sm:text-sm font-black text-white">{{ ledger.recoveryRate() }}%</span>
              </div>
            </div>
            <div class="text-left sm:text-center">
              <span class="text-[11px] font-bold text-white block">{{ i18n.t().recoveryRate }}</span>
              <span class="text-[10px] text-white/80 font-medium">{{ i18n.t().jamaVsUdhar }}</span>
            </div>
          </div>

        </div>
      </div>

      <!-- 2. iOS Quick Action App Grid -->
      <div class="grid grid-cols-4 gap-2 sm:gap-3.5">
        
        <!-- Action 1: Add Customer -->
        <button
          type="button"
          (click)="openAddCustomer.emit()"
          class="ios-card-interactive p-3 sm:p-4 flex flex-col items-center text-center cursor-pointer group"
          id="dash-quick-add-cust"
        >
          <div class="w-11 h-11 rounded-[12px] bg-[#e8f2fc] text-[#007aff] flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 group-hover:bg-[#d8eafb] transition-all">
            <mat-icon class="text-xl! w-5! h-5!">person_add</mat-icon>
          </div>
          <span class="text-xs font-bold text-slate-800 leading-tight">{{ i18n.t().quickAddCust }}</span>
          <span class="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">{{ i18n.t().openAccount }}</span>
        </button>

        <!-- Action 2: Google Sheet Sync -->
        <button
          type="button"
          (click)="openSheetModal.emit()"
          class="ios-card-interactive p-3 sm:p-4 flex flex-col items-center text-center cursor-pointer group"
          id="dash-quick-sheet"
        >
          <div class="w-11 h-11 rounded-[12px] bg-[#eafaf1] text-[#10b981] flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 group-hover:bg-[#dbf6e7] transition-all">
            <mat-icon class="text-xl! w-5! h-5!">cloud_sync</mat-icon>
          </div>
          <span class="text-xs font-bold text-slate-800 leading-tight">{{ i18n.t().quickSheet }}</span>
          <span class="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">{{ i18n.t().cloudBackup }}</span>
        </button>

        <!-- Action 3: Bharat UPI QR -->
        <button
          type="button"
          (click)="goToProfile.emit('payment')"
          class="ios-card-interactive p-3 sm:p-4 flex flex-col items-center text-center cursor-pointer group"
          id="dash-quick-qr"
        >
          <div class="w-11 h-11 rounded-[12px] bg-[#f5eeff] text-[#8b5cf6] flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 group-hover:bg-[#ede0ff] transition-all">
            <mat-icon class="text-xl! w-5! h-5!">qr_code_2</mat-icon>
          </div>
          <span class="text-xs font-bold text-slate-800 leading-tight">{{ i18n.t().quickPaymentQr }}</span>
          <span class="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">{{ i18n.t().upiStandee }}</span>
        </button>

        <!-- Action 4: Statement -->
        <button
          type="button"
          (click)="openStatementModal.emit()"
          class="ios-card-interactive p-3 sm:p-4 flex flex-col items-center text-center cursor-pointer group"
          id="dash-quick-statement"
        >
          <div class="w-11 h-11 rounded-[12px] bg-[#fef4ea] text-[#f97316] flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 group-hover:bg-[#fee7d1] transition-all">
            <mat-icon class="text-xl! w-5! h-5!">receipt_long</mat-icon>
          </div>
          <span class="text-xs font-bold text-slate-800 leading-tight">{{ i18n.t().quickStatement }}</span>
          <span class="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">{{ i18n.t().pdfReport }}</span>
        </button>

      </div>

      <!-- 3. iOS Grouped Inset Financial Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        <!-- Metric 1: Aapko Lena Hai -->
        <button
          type="button"
          (click)="goToCustomers.emit('due')"
          class="ios-card-interactive p-4 text-left cursor-pointer group"
          id="dash-card-due"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 rounded-[10px] bg-[#fef4ea] text-[#f97316] flex items-center justify-center shadow-2xs">
              <mat-icon class="text-sm! w-4! h-4!">call_received</mat-icon>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-[#ffedd5] text-[#c2410c] text-[10px] font-bold border border-[#fed7aa]/60">
              {{ ledger.overview().dueCustomerCount }} {{ i18n.t().grahakCol }}
            </span>
          </div>
          <span class="text-xs text-slate-500 font-semibold block">{{ i18n.t().youWillGet }}</span>
          <span class="text-lg sm:text-xl font-black text-[#ea580c] tracking-tight block mt-0.5">
            ₹{{ ledger.overview().totalDue.toLocaleString('en-IN') }}
          </span>
          <div class="mt-2 flex items-center gap-1 text-[11px] text-[#007aff] font-semibold">
            <span>{{ i18n.t().dueList }}</span>
            <mat-icon class="text-xs! w-3! h-3!">chevron_right</mat-icon>
          </div>
        </button>

        <!-- Metric 2: Aapko Dena Hai -->
        <button
          type="button"
          (click)="goToCustomers.emit('advance')"
          class="ios-card-interactive p-4 text-left cursor-pointer group"
          id="dash-card-advance"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 rounded-[10px] bg-[#eafaf1] text-[#10b981] flex items-center justify-center shadow-2xs">
              <mat-icon class="text-sm! w-4! h-4!">call_made</mat-icon>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] text-[10px] font-bold border border-[#86efac]/60">
              {{ ledger.overview().advanceCustomerCount }} {{ i18n.t().grahakCol }}
            </span>
          </div>
          <span class="text-xs text-slate-500 font-semibold block">{{ i18n.t().youWillGive }}</span>
          <span class="text-lg sm:text-xl font-black text-[#16a34a] tracking-tight block mt-0.5">
            ₹{{ ledger.overview().totalAdvance.toLocaleString('en-IN') }}
          </span>
          <div class="mt-2 flex items-center gap-1 text-[11px] text-[#007aff] font-semibold">
            <span>{{ i18n.t().advanceList }}</span>
            <mat-icon class="text-xs! w-3! h-3!">chevron_right</mat-icon>
          </div>
        </button>

        <!-- Metric 3: Kul Jama Liya -->
        <div class="ios-card p-4 text-left">
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 rounded-[10px] bg-[#e8f2fc] text-[#0284c7] flex items-center justify-center shadow-2xs">
              <mat-icon class="text-sm! w-4! h-4!">payments</mat-icon>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0369a1] text-[10px] font-bold">
              All Time
            </span>
          </div>
          <span class="text-xs text-slate-500 font-semibold block">{{ i18n.t().totalReceived }}</span>
          <span class="text-lg sm:text-xl font-black text-slate-800 tracking-tight block mt-0.5">
            ₹{{ ledger.totalReceivedAllTime().toLocaleString('en-IN') }}
          </span>
          <span class="text-[11px] text-slate-400 font-medium block mt-2">{{ i18n.t().cashUpiCollection }}</span>
        </div>

        <!-- Metric 4: Kul Udhar Diya -->
        <div class="ios-card p-4 text-left">
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 rounded-[10px] bg-[#f5eeff] text-[#8b5cf6] flex items-center justify-center shadow-2xs">
              <mat-icon class="text-sm! w-4! h-4!">shopping_bag</mat-icon>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[#7e22ce] text-[10px] font-bold">
              All Time
            </span>
          </div>
          <span class="text-xs text-slate-500 font-semibold block">{{ i18n.t().totalGave }}</span>
          <span class="text-lg sm:text-xl font-black text-slate-800 tracking-tight block mt-0.5">
            ₹{{ ledger.totalGaveAllTime().toLocaleString('en-IN') }}
          </span>
          <span class="text-[11px] text-slate-400 font-medium block mt-2">{{ i18n.t().creditSalesVolume }}</span>
        </div>

      </div>

      <!-- 4. iOS Grouped Widget: Top Baaki Grahak -->
      @if (topDueCustomers().length > 0) {
        <div class="ios-card p-4 sm:p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-[8px] bg-[#fef4ea] text-[#ea580c] flex items-center justify-center shadow-2xs">
                <mat-icon class="text-sm! w-4! h-4!">priority_high</mat-icon>
              </div>
              <h3 class="font-bold text-sm text-[#1c1c1e] tracking-tight">
                {{ i18n.t().topDueHeading }}
              </h3>
            </div>
            <button
              type="button"
              (click)="goToCustomers.emit('due')"
              class="text-xs font-bold text-[#007aff] hover:underline cursor-pointer"
            >
              {{ i18n.t().seeAll }} ({{ ledger.overview().dueCustomerCount }})
            </button>
          </div>

          <!-- Customer Rows with 1-Tap WhatsApp Reminder -->
          <div class="divide-y divide-slate-100 mt-1">
            @for (item of topDueCustomers(); track item.customer.id) {
              <div class="py-2.5 flex items-center justify-between gap-3 group hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                <button
                  type="button"
                  (click)="selectCustomer.emit(item.customer.id)"
                  class="flex items-center gap-3 text-left min-w-0 cursor-pointer flex-1"
                >
                  <div class="w-9 h-9 rounded-[10px] bg-[#fef4ea] text-[#c2410c] font-bold text-sm flex items-center justify-center shrink-0 border border-[#fed7aa]/50 shadow-2xs">
                    {{ item.customer.name.slice(0, 1).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-bold text-xs sm:text-sm text-[#1c1c1e] truncate group-hover:text-[#007aff] transition-colors">
                      {{ item.customer.name }}
                    </h4>
                    <p class="text-[11px] text-slate-500 font-medium truncate">
                      +91 {{ item.customer.phone }}
                    </p>
                  </div>
                </button>

                <div class="flex items-center gap-2.5 shrink-0">
                  <div class="text-right">
                    <span class="text-xs sm:text-sm font-black text-[#ea580c] block">
                      ₹{{ item.netBalance.toLocaleString('en-IN') }}
                    </span>
                    <span class="text-[10px] text-[#c2410c] font-medium">{{ i18n.t().filterDue }}</span>
                  </div>

                  <a
                    [href]="getWhatsAppReminderUrl(item.customer, item.netBalance)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-2.5 py-1.5 rounded-full bg-[#eafaf1] hover:bg-[#dcfce7] text-[#15803d] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-[#86efac]/60 active:scale-95 shadow-2xs"
                    [title]="i18n.t().sendWaReminderBtn"
                  >
                    <mat-icon class="text-sm! w-4! h-4! text-[#10b981]">chat</mat-icon>
                    <span class="hidden sm:inline">{{ i18n.t().sendReminder }}</span>
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- 5. Halia Len-Den Activity -->
      @if (recentTransactions().length > 0) {
        <div class="ios-card p-4 sm:p-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-[8px] bg-[#e8f2fc] text-[#0284c7] flex items-center justify-center font-bold shadow-2xs">
                <mat-icon class="text-sm! w-4! h-4!">schedule</mat-icon>
              </div>
              <div>
                <h3 class="font-bold text-sm text-[#1e293b] tracking-tight">
                  {{ i18n.t().scheduleAndRecent }}
                </h3>
                <p class="text-[11px] text-slate-400 font-medium">{{ i18n.t().organizeDay }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="goToCustomers.emit('all')"
              class="text-xs font-bold text-[#007aff] hover:underline cursor-pointer"
              id="dash-see-all-btn"
            >
              {{ i18n.t().allCustomersBtn }}
            </button>
          </div>

          <div class="space-y-2 mt-3">
            @for (tx of recentTransactions(); track tx.id) {
              <button
                type="button"
                (click)="selectCustomer.emit(tx.customerId)"
                class="w-full p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group active:scale-98"
                [id]="'dash-tx-' + tx.id"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div
                    class="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 shadow-2xs tracking-tight"
                    [class.bg-[#ffedd5]]="tx.type === 'gave'"
                    [class.text-[#c2410c]]="tx.type === 'gave'"
                    [class.bg-[#dcfce7]]="tx.type === 'received'"
                    [class.text-[#15803d]]="tx.type === 'received'"
                  >
                    {{ formatTxTime(tx.date) }}
                  </div>

                  <div class="min-w-0">
                    <span class="font-bold text-xs sm:text-sm text-[#1e293b] truncate block group-hover:text-[#007aff] transition-colors">
                      {{ getCustomerName(tx.customerId) }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium truncate block">
                      {{ tx.note || (tx.type === 'gave' ? i18n.t().udharDiya : i18n.t().jamaHua) }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <div class="text-right">
                    <span
                      class="text-xs sm:text-sm font-black block"
                      [class.text-[#ea580c]]="tx.type === 'gave'"
                      [class.text-[#16a34a]]="tx.type === 'received'"
                    >
                      {{ tx.type === 'gave' ? '-' : '+' }}₹{{ tx.amount.toLocaleString('en-IN') }}
                    </span>
                    <span class="text-[10px] text-slate-400 block font-medium">
                      {{ tx.type === 'gave' ? i18n.t().udharDiya : i18n.t().jamaHua }}
                    </span>
                  </div>
                  <mat-icon class="text-slate-300 group-hover:text-[#007aff] text-base! w-4! h-4! transition-colors">chevron_right</mat-icon>
                </div>
              </button>
            }
          </div>
        </div>
      }

      <!-- 6. Habit Streak / Vyapar Performance -->
      <div class="ios-card p-4 sm:p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-sm text-[#1e293b] tracking-tight">{{ i18n.t().businessStreak }}</h3>
          <span class="text-[11px] font-bold text-slate-400">{{ i18n.t().liveHealth }}</span>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
            <span class="text-[11px] font-bold text-slate-500 block mb-1">{{ i18n.t().recoveryCol }}</span>
            <span class="text-lg sm:text-xl font-black text-slate-900 block">{{ ledger.recoveryRate() }}%</span>
            <div class="w-10 h-1 rounded-full bg-cyan-400 mx-auto mt-2"></div>
          </div>

          <div class="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <span class="text-[11px] font-bold text-slate-500 block mb-1">{{ i18n.t().totalJamaCol }}</span>
            <span class="text-lg sm:text-xl font-black text-emerald-700 block">₹{{ (ledger.totalReceivedAllTime() / 1000).toFixed(1) }}k</span>
            <div class="w-10 h-1 rounded-full bg-emerald-400 mx-auto mt-2"></div>
          </div>

          <div class="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
            <span class="text-[11px] font-bold text-slate-500 block mb-1">{{ i18n.t().grahakCol }}</span>
            <span class="text-lg sm:text-xl font-black text-purple-700 block">{{ ledger.customerSummaries().length }}</span>
            <div class="w-10 h-1 rounded-full bg-purple-400 mx-auto mt-2"></div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DashboardView {
  readonly ledger = inject(Ledger);
  readonly i18n = inject(I18nService);

  readonly openAddCustomer = output<void>();
  readonly openSheetModal = output<void>();
  readonly openStatementModal = output<void>();
  readonly goToCustomers = output<'all' | 'due' | 'advance' | 'settled'>();
  readonly goToProfile = output<ProfileTab>();
  readonly selectCustomer = output<string>();

  readonly todayDate = computed(() => {
    const locale = this.i18n.currentLanguage() === 'hi' ? 'hi-IN' : 'en-IN';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date());
  });

  readonly topDueCustomers = computed(() => {
    return this.ledger.customerSummaries()
      .filter(s => s.status === 'due' && s.netBalance > 0)
      .sort((a, b) => b.netBalance - a.netBalance)
      .slice(0, 4);
  });

  readonly recentTransactions = computed(() => {
    return [...this.ledger.transactions()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  });

  getCustomerName(customerId: string): string {
    const cust = this.ledger.customers().find(c => c.id === customerId);
    return cust ? cust.name : this.i18n.t().customers;
  }

  formatTxTime(dateStr: string): string {
    if (!dateStr) return '12:00';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '12:00';
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '12:00';
    }
  }

  getWhatsAppReminderUrl(cust: Customer, balance: number): string {
    const cleanPhone = cust.phone ? cust.phone.replace(/\D/g, '') : '';
    const text = this.i18n.currentLanguage() === 'hi'
      ? `नमस्ते ${cust.name} जी! ${this.ledger.businessName()} की तरफ से आपका ₹${balance.toLocaleString('en-IN')} का बकाया हिसाब बाकी है। कृपया जल्द से जल्द जमा करें। धन्यवाद!`
      : `Dear ${cust.name}, this is a gentle reminder from ${this.ledger.businessName()} that your pending balance is ₹${balance.toLocaleString('en-IN')}. Please clear it at your earliest convenience. Thank you!`;
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
  }
}
