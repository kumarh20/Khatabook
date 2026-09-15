import { ChangeDetectionStrategy, Component, inject, output, input, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';

@Component({
  selector: 'app-summary-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-4 mb-6">
      
      <!-- Screen 1 Hero Card: Soft Pastel Blue Gradient with Circular Progress (Direct match to screenshot) -->
      <div class="hero-gradient-blue rounded-[28px] p-5 sm:p-6 relative overflow-hidden transition-all">
        <div class="flex items-center justify-between gap-4">
          
          <div class="min-w-0">
            <!-- Pill Tag -->
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-xs text-[11px] font-extrabold text-blue-900 mb-2.5 border border-white/80 shadow-2xs">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Dukan Ka Kul Hisab (Net Status)</span>
            </div>

            <!-- Big Bold Headline -->
            <div class="flex items-baseline gap-2">
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ₹{{ ledger.overview().totalDue.toLocaleString('en-IN') }}
              </h2>
              <span class="text-xs sm:text-sm font-bold text-slate-700">Lena Hai (Due)</span>
            </div>

            <!-- Subtitle with dot separators matching screenshot -->
            <p class="text-xs text-slate-600 font-medium mt-1">
              {{ ledger.overview().dueCustomerCount }} grahak udhar • {{ ledger.overview().advanceCustomerCount }} advance • {{ ledger.sheetConfig().scriptUrl ? 'Cloud sync live' : 'Offline' }}
            </p>
          </div>

          <!-- Right: Circular Progress Ring (Matching the 72% circular ring in the screenshot) -->
          <div class="shrink-0 flex flex-col items-center">
            <div class="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <!-- Background track -->
                <path
                  class="text-blue-200/70"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <!-- Progress bar -->
                <path
                  class="text-blue-600 transition-all duration-700 ease-out"
                  stroke-dasharray="100, 100"
                  [attr.stroke-dashoffset]="100 - duePercentage()"
                  stroke-linecap="round"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="absolute flex flex-col items-center justify-center text-center">
                <span class="text-xs sm:text-sm font-black text-slate-900">{{ duePercentage() }}%</span>
              </div>
            </div>
            <span class="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Udhar Ratio</span>
          </div>

        </div>
      </div>

      <!-- Quick Action Cards (3 Crisp White Squircle Cards Matching Screenshot 'Add Task / Event / Notes') -->
      <div class="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        
        <!-- Action 1: Add Customer -->
        <button
          type="button"
          (click)="quickAddCustomer.emit()"
          class="app-action-card p-3 sm:p-3.5 text-left flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 cursor-pointer group"
          id="quick-add-customer-card"
        >
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-sky-100">
            <mat-icon class="text-lg! w-5! h-5!">person_add</mat-icon>
          </div>
          <div class="min-w-0 text-center sm:text-left">
            <span class="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Naya Grahak</span>
            <span class="text-[10px] text-slate-400 font-medium hidden sm:block">Quick entry</span>
          </div>
        </button>

        <!-- Action 2: Sheet Sync -->
        <button
          type="button"
          (click)="quickOpenSheet.emit()"
          class="app-action-card p-3 sm:p-3.5 text-left flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 cursor-pointer group"
          id="quick-sheet-sync-card"
        >
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-100">
            <mat-icon class="text-lg! w-5! h-5!">grid_on</mat-icon>
          </div>
          <div class="min-w-0 text-center sm:text-left">
            <span class="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Sheet Sync</span>
            <span class="text-[10px] text-slate-400 font-medium hidden sm:block">Drive backup</span>
          </div>
        </button>

        <!-- Action 3: Statement / Hisab -->
        <button
          type="button"
          (click)="filterSelected.emit('all')"
          class="app-action-card p-3 sm:p-3.5 text-left flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 cursor-pointer group"
          id="quick-statement-card"
        >
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-orange-100">
            <mat-icon class="text-lg! w-5! h-5!">receipt_long</mat-icon>
          </div>
          <div class="min-w-0 text-center sm:text-left">
            <span class="text-xs sm:text-sm font-extrabold text-slate-900 block leading-tight">Sabhi Grahak</span>
            <span class="text-[10px] text-slate-400 font-medium hidden sm:block">{{ ledger.customers().length }} records</span>
          </div>
        </button>

      </div>

      <!-- Habit Streak / Mini Metric Counters (Matching 86, 72, 91 bar counters at bottom of screen 1) -->
      <div class="app-card p-4 sm:p-5">
        <div class="flex items-center justify-between mb-3 text-xs text-slate-400 font-bold tracking-wider">
          <span>Lena Hai • Dena Hai • Kul Grahak</span>
          <span class="text-[11px] text-slate-500 font-medium">Bahi Khata Summary</span>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center">
          
          <!-- Metric 1: Lena Hai (Rose/Coral) -->
          <button
            type="button"
            (click)="filterSelected.emit('due')"
            class="text-left group cursor-pointer p-2 rounded-xl transition-all hover:bg-slate-50"
            [class.bg-rose-50]="currentFilter() === 'due'"
          >
            <span class="text-lg sm:text-2xl font-black text-rose-600 block">
              ₹{{ formatShortAmount(ledger.overview().totalDue) }}
            </span>
            <span class="text-[11px] text-slate-500 font-bold block mt-0.5">Lena Hai</span>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full bg-rose-500 rounded-full w-4/5"></div>
            </div>
          </button>

          <!-- Metric 2: Dena Hai (Emerald) -->
          <button
            type="button"
            (click)="filterSelected.emit('advance')"
            class="text-left group cursor-pointer p-2 rounded-xl transition-all hover:bg-slate-50"
            [class.bg-emerald-50]="currentFilter() === 'advance'"
          >
            <span class="text-lg sm:text-2xl font-black text-emerald-600 block">
              ₹{{ formatShortAmount(ledger.overview().totalAdvance) }}
            </span>
            <span class="text-[11px] text-slate-500 font-bold block mt-0.5">Dena Hai</span>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full w-3/5"></div>
            </div>
          </button>

          <!-- Metric 3: Total Customers (Purple) -->
          <button
            type="button"
            (click)="filterSelected.emit('all')"
            class="text-left group cursor-pointer p-2 rounded-xl transition-all hover:bg-slate-50"
            [class.bg-purple-50]="currentFilter() === 'all'"
          >
            <span class="text-lg sm:text-2xl font-black text-purple-600 block">
              {{ ledger.customers().length }}
            </span>
            <span class="text-[11px] text-slate-500 font-bold block mt-0.5">Grahak</span>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div class="h-full bg-purple-500 rounded-full w-full"></div>
            </div>
          </button>

        </div>
      </div>

    </div>
  `
})
export class SummaryCards {
  readonly ledger = inject(Ledger);
  readonly currentFilter = input<string>('all');
  readonly filterSelected = output<'all' | 'due' | 'advance' | 'settled'>();
  readonly quickAddCustomer = output<void>();
  readonly quickOpenSheet = output<void>();

  readonly duePercentage = computed(() => {
    const ov = this.ledger.overview();
    const total = ov.totalDue + ov.totalAdvance;
    if (total === 0) return 0;
    return Math.min(100, Math.round((ov.totalDue / total) * 100));
  });

  formatShortAmount(num: number): string {
    if (num >= 100000) {
      return (num / 100000).toFixed(1) + 'L';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toLocaleString('en-IN');
  }
}
