import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { ProfileTab } from './profile-view';
import { I18nService } from '../services/i18n';

@Component({
  selector: 'app-dashboard-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      
      <!-- 1. Pastel Sky Blue Hero Card (Exact match to screenshot) -->
      <div class="hero-gradient-blue p-5 sm:p-6 relative overflow-hidden rounded-[20px]">
        <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/15 blur-2xl pointer-events-none"></div>

        <div class="relative z-10">
          
          <!-- Translucent Pill Tag -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-xs text-[11px] font-bold text-white mb-3 border border-white/35 shadow-2xs">
            <span class="w-2 h-2 rounded-full bg-white"></span>
            <span>{{ ledger.businessCategory() }} • {{ i18n.t().todayFocus }}</span>
          </div>

          <!-- Greeting & Business Title -->
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            {{ i18n.t().namaste }}, {{ ledger.ownerName() || i18n.t().vyapari }}!
          </h2>
          <p class="text-xs sm:text-sm text-white/90 font-medium mt-0.5">
            {{ ledger.businessName() }} • <span>{{ todayDate() }}</span>
          </p>

          <!-- Net Market Due Highlight -->
          <div class="mt-4">
            <span class="text-[11px] font-bold uppercase tracking-wider text-white/85 block mb-1">
              {{ i18n.t().marketDue }}
            </span>
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                ₹{{ ledger.overview().totalDue.toLocaleString('en-IN') }}
              </span>
              <span class="text-xs font-bold text-white bg-white/25 backdrop-blur-xs px-3 py-1 rounded-full border border-white/35 shadow-2xs">
                {{ ledger.overview().dueCustomerCount }} {{ i18n.t().dueCustomersCount }}
              </span>
            </div>
          </div>

          <!-- Recovery Rate Inner Glass Card (Exact layout from Screenshot) -->
          <div class="mt-4 bg-white/20 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-white/35 flex items-center gap-4 shadow-inner">
            <div class="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
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
            <div class="min-w-0">
              <div class="text-sm font-bold text-white leading-tight">{{ i18n.t().recoveryRate }}</div>
              <div class="text-xs text-white/80 font-medium mt-0.5">{{ i18n.t().jamaVsUdhar }}</div>
            </div>
          </div>

        </div>
      </div>

      <!-- 2. iOS Quick Action App Grid with Entry Animation -->
      <div class="grid grid-cols-4 gap-2 sm:gap-3.5 animate-fade-in-up">
        
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

      <!-- 4. Habit Streak / Vyapar Performance -->
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
}
