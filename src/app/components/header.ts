import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { I18nService } from '../services/i18n';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: {
    class: 'sticky top-0 z-30 block w-full'
  },
  template: `
    <header class="w-full bg-[#f3f6fb]/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-xs transition-all">
      <div class="max-w-4xl mx-auto px-3 sm:px-6 h-15 sm:h-17 flex items-center justify-between gap-2 sm:gap-3">
        
        <!-- Left: Profile Monogram + Business Title -->
        <div class="min-w-0 flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            (click)="viewChange.emit('profile')"
            class="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-[13px] sm:rounded-[14px] bg-gradient-to-br from-[#007aff] to-[#2563eb] text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-xs shrink-0 cursor-pointer active:scale-95 transition-transform"
            title="Profile & Settings"
            id="header-profile-avatar-btn"
          >
            {{ ledger.businessName().slice(0, 1).toUpperCase() }}
          </button>

          <div class="min-w-0">
            <button
              type="button"
              (click)="viewChange.emit('profile')"
              class="text-left group cursor-pointer outline-hidden truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[260px] md:max-w-[340px] block"
              title="Profile & Settings"
            >
              <h1 class="text-sm sm:text-base md:text-lg font-black text-slate-900 truncate tracking-tight group-hover:text-[#007aff] transition-colors leading-tight">
                {{ ledger.businessName() }}
              </h1>
            </button>
            <div class="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-medium leading-none mt-0.5 truncate">
              <span>{{ todayFormatted() }}</span>
              <span>•</span>
              <span class="text-slate-600 font-semibold truncate">{{ ledger.businessCategory() }}</span>
            </div>
          </div>
        </div>

        <!-- Center: Desktop Segmented Control -->
        <nav class="hidden md:flex items-center ios-segmented-control shrink-0">
          <button
            type="button"
            (click)="viewChange.emit('dashboard')"
            class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer flex items-center gap-1.5"
            [class.ios-segmented-btn-active]="currentView() === 'dashboard'"
            [class.text-slate-500]="currentView() !== 'dashboard'"
            id="nav-tab-dashboard"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">grid_view</mat-icon>
            <span>{{ i18n.t().dashboard }}</span>
          </button>

          <button
            type="button"
            (click)="viewChange.emit('customers')"
            class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer flex items-center gap-1.5"
            [class.ios-segmented-btn-active]="currentView() === 'customers'"
            [class.text-slate-500]="currentView() !== 'customers'"
            id="nav-tab-customers"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">people</mat-icon>
            <span>{{ i18n.t().customerList }}</span>
            @if (ledger.overview().dueCustomerCount > 0) {
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] font-black"
                [class.bg-[#ff3b30]]="currentView() !== 'customers'"
                [class.text-white]="currentView() !== 'customers'"
                [class.bg-slate-900]="currentView() === 'customers'"
                [class.text-white]="currentView() === 'customers'"
              >
                {{ ledger.overview().dueCustomerCount }}
              </span>
            }
          </button>

          <button
            type="button"
            (click)="viewChange.emit('profile')"
            class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer flex items-center gap-1.5"
            [class.ios-segmented-btn-active]="currentView() === 'profile'"
            [class.text-slate-500]="currentView() !== 'profile'"
            id="nav-tab-profile"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">storefront</mat-icon>
            <span>{{ i18n.t().dukaan }}</span>
          </button>
        </nav>

        <!-- Right: Right Corner Sync Icon -->
        <div class="flex items-center shrink-0">
          <button
            type="button"
            (click)="openSheetSettings.emit()"
            class="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-95 relative"
            id="sheet-sync-status-btn"
            [title]="ledger.sheetConfig().scriptUrl ? i18n.t().sheetSyncedTooltip : i18n.t().sheetUnsyncedTooltip"
          >
            @if (ledger.sheetConfig().syncStatus === 'syncing') {
              <mat-icon class="text-base! w-4! h-4! text-[#ff9500] animate-spin">sync</mat-icon>
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff9500]"></span>
            } @else if (ledger.sheetConfig().scriptUrl && ledger.sheetConfig().syncStatus === 'synced') {
              <mat-icon class="text-base! w-4! h-4! text-[#16a34a]">cloud_done</mat-icon>
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#16a34a] ring-2 ring-white"></span>
            } @else if (ledger.sheetConfig().syncStatus === 'error') {
              <mat-icon class="text-base! w-4! h-4! text-[#ff3b30]">sync_problem</mat-icon>
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff3b30]"></span>
            } @else {
              <mat-icon class="text-base! w-4! h-4! text-slate-400">cloud_queue</mat-icon>
            }
          </button>
        </div>

      </div>
    </header>
  `
})
export class Header {
  readonly ledger = inject(Ledger);
  readonly i18n = inject(I18nService);

  readonly currentView = input<'dashboard' | 'customers' | 'profile'>('dashboard');
  readonly viewChange = output<'dashboard' | 'customers' | 'profile'>();
  readonly openAddCustomer = output<void>();
  readonly openSheetSettings = output<void>();

  readonly todayFormatted = computed(() => {
    const locale = this.i18n.currentLanguage() === 'hi' ? 'hi-IN' : 'en-IN';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(new Date());
  });
}
