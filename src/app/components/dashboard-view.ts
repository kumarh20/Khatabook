import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { ProfileTab } from './profile-view';

@Component({
  selector: 'app-dashboard-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-5 animate-in fade-in duration-200">
      
      <!-- Greeting & Shop Banner -->
      <div class="hero-gradient-blue rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div class="min-w-0">
            <!-- Pill Tag -->
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs text-[11px] font-extrabold text-blue-900 mb-2 border border-white/80 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Dukan Bahi Khata • Live Overview</span>
            </div>

            <!-- Greeting & Shop -->
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Namaste, {{ ledger.ownerName() || 'Vyapari' }} ji!
            </h2>
            <p class="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
              {{ ledger.businessName() }} • <span class="text-slate-500 font-medium">{{ todayDate }}</span>
            </p>

            <!-- Net Balance Highlight -->
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ₹{{ ledger.overview().totalDue.toLocaleString('en-IN') }}
              </span>
              <span class="text-xs sm:text-sm font-bold text-rose-600">Kul Lena Hai (Market Due)</span>
            </div>
          </div>

          <!-- Circular Recovery Rate Ring -->
          <div class="shrink-0 flex items-center gap-4 sm:flex-col sm:items-center bg-white/60 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/60 sm:border-0">
            <div class="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  class="text-blue-200/70"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="text-blue-600 transition-all duration-700 ease-out"
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
                <span class="text-xs sm:text-sm font-black text-slate-900">{{ ledger.recoveryRate() }}%</span>
              </div>
            </div>
            <div class="text-left sm:text-center">
              <span class="text-[11px] font-extrabold text-slate-800 block">Recovery Rate</span>
              <span class="text-[10px] font-medium text-slate-500">Jama vs Udhar</span>
            </div>
          </div>

        </div>
      </div>

      <!-- 4 High-Impact Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        <!-- Metric 1: Aapko Lena Hai (Rose/Coral) -->
        <button
          type="button"
          (click)="goToCustomers.emit('due')"
          class="app-card p-3.5 sm:p-4 text-left transition-all hover:-translate-y-0.5 cursor-pointer group"
          id="dash-card-due"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <mat-icon class="text-sm! w-4! h-4!">call_received</mat-icon>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
              {{ ledger.overview().dueCustomerCount }} Grahak
            </span>
          </div>
          <span class="text-[11px] text-slate-500 font-bold block">Aapko Lena Hai</span>
          <span class="text-base sm:text-xl font-black text-rose-600 tracking-tight block mt-0.5">
            ₹{{ ledger.overview().totalDue.toLocaleString('en-IN') }}
          </span>
          <div class="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <span>List dekhein</span>
            <mat-icon class="text-xs! w-3! h-3!">arrow_forward</mat-icon>
          </div>
        </button>

        <!-- Metric 2: Aapko Dena Hai (Emerald) -->
        <button
          type="button"
          (click)="goToCustomers.emit('advance')"
          class="app-card p-3.5 sm:p-4 text-left transition-all hover:-translate-y-0.5 cursor-pointer group"
          id="dash-card-advance"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <mat-icon class="text-sm! w-4! h-4!">call_made</mat-icon>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              {{ ledger.overview().advanceCustomerCount }} Grahak
            </span>
          </div>
          <span class="text-[11px] text-slate-500 font-bold block">Aapko Dena Hai</span>
          <span class="text-base sm:text-xl font-black text-emerald-600 tracking-tight block mt-0.5">
            ₹{{ ledger.overview().totalAdvance.toLocaleString('en-IN') }}
          </span>
          <div class="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
            <span>Advance list</span>
            <mat-icon class="text-xs! w-3! h-3!">arrow_forward</mat-icon>
          </div>
        </button>

        <!-- Metric 3: Kul Jama Liya (Maine Liye) -->
        <div class="app-card p-3.5 sm:p-4 text-left">
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <mat-icon class="text-sm! w-4! h-4!">payments</mat-icon>
            </div>
            <span class="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">All Time</span>
          </div>
          <span class="text-[11px] text-slate-500 font-bold block">Kul Jama Liya</span>
          <span class="text-base sm:text-xl font-black text-slate-900 tracking-tight block mt-0.5">
            ₹{{ ledger.totalReceivedAllTime().toLocaleString('en-IN') }}
          </span>
          <span class="text-[10px] text-slate-400 font-medium block mt-2">Cash/UPI collection</span>
        </div>

        <!-- Metric 4: Kul Udhar Diya (Maine Diye) -->
        <div class="app-card p-3.5 sm:p-4 text-left">
          <div class="flex items-center justify-between mb-2">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <mat-icon class="text-sm! w-4! h-4!">shopping_bag</mat-icon>
            </div>
            <span class="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">All Time</span>
          </div>
          <span class="text-[11px] text-slate-500 font-bold block">Kul Udhar Diya</span>
          <span class="text-base sm:text-xl font-black text-slate-900 tracking-tight block mt-0.5">
            ₹{{ ledger.totalGaveAllTime().toLocaleString('en-IN') }}
          </span>
          <span class="text-[10px] text-slate-400 font-medium block mt-2">Udhar sales volume</span>
        </div>

      </div>

      <!-- Quick Action Shortcuts Bar -->
      <div class="grid grid-cols-4 gap-2 sm:gap-3">
        <button
          type="button"
          (click)="openAddCustomer.emit()"
          class="app-action-card p-3 flex flex-col items-center text-center cursor-pointer group"
          id="dash-quick-add-cust"
        >
          <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <mat-icon class="text-lg! w-5! h-5!">person_add</mat-icon>
          </div>
          <span class="text-xs font-bold text-slate-800 leading-tight">Naya Grahak</span>
          <span class="text-[10px] text-slate-400 hidden sm:block">Khata Kholein</span>
        </button>

        <button
          type="button"
          (click)="openSheetModal.emit()"
          class="app-action-card p-3 flex flex-col items-center text-center cursor-pointer group"
          id="dash-quick-sheet"
        >
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <mat-icon class="text-lg! w-5! h-5!">cloud_sync</mat-icon>
          </div>
          <span class="text-xs font-bold text-slate-800 leading-tight">Google Sheet</span>
          <span class="text-[10px] text-slate-400 hidden sm:block">Sync & Backup</span>
        </button>

        <button
          type="button"
          (click)="goToProfile.emit('payment')"
          class="app-action-card p-3 flex flex-col items-center text-center cursor-pointer group"
          id="dash-quick-qr"
        >
          <div class="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <mat-icon class="text-lg! w-5! h-5!">qr_code_2</mat-icon>
          </div>
          <span class="text-xs font-bold text-slate-800 leading-tight">Payment QR</span>
          <span class="text-[10px] text-slate-400 hidden sm:block">Bhim UPI Standee</span>
        </button>

        <button
          type="button"
          (click)="openStatementModal.emit()"
          class="app-action-card p-3 flex flex-col items-center text-center cursor-pointer group"
          id="dash-quick-statement"
        >
          <div class="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <mat-icon class="text-lg! w-5! h-5!">receipt_long</mat-icon>
          </div>
          <span class="text-xs font-bold text-slate-800 leading-tight">Bahi Khata</span>
          <span class="text-[10px] text-slate-400 hidden sm:block">Print Hisab</span>
        </button>
      </div>

    </div>
  `
})
export class DashboardView {
  readonly ledger = inject(Ledger);

  readonly openAddCustomer = output<void>();
  readonly openSheetModal = output<void>();
  readonly openStatementModal = output<void>();
  readonly goToCustomers = output<'all' | 'due' | 'advance' | 'settled'>();
  readonly goToProfile = output<ProfileTab>();

  readonly todayDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());
}
