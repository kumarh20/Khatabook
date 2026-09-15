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
        
        <!-- Left: Category Themed Icon + Business Title -->
        <div class="min-w-0 flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            (click)="viewChange.emit('profile')"
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-[13px] sm:rounded-[14px] bg-linear-to-br from-[#007aff] to-[#2563eb] text-white flex items-center justify-center font-black shadow-xs shrink-0 cursor-pointer active:scale-95 transition-all hover:shadow-md hover:shadow-blue-500/20"
            title="Profile & Settings"
            id="header-profile-avatar-btn"
          >
            <mat-icon class="text-lg! sm:text-xl! w-5! h-5! sm:w-5.5! sm:h-5.5!">{{ categoryIcon() }}</mat-icon>
          </button>

          <div class="min-w-0">
            <button
              type="button"
              (click)="viewChange.emit('profile')"
              class="text-left group cursor-pointer outline-hidden truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[260px] md:max-w-[340px] block"
              title="Profile & Settings"
            >
              <h1 class="text-sm sm:text-base md:text-lg font-black text-slate-800 truncate tracking-tight group-hover:text-[#007aff] transition-colors leading-tight">
                {{ ledger.businessName() }}
              </h1>
            </button>
            <div class="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none mt-0.5 truncate">
              <span>{{ todayFormatted() }}</span>
              <span>•</span>
              <span class="inline-flex items-center gap-1 text-slate-600 font-semibold truncate">
                <mat-icon class="text-[11px]! w-3! h-3! text-[#007aff] shrink-0">{{ categoryIcon() }}</mat-icon>
                <span class="truncate">{{ ledger.businessCategory() }}</span>
              </span>
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
                [class.bg-rose-500]="currentView() !== 'customers'"
                [class.text-white]="currentView() !== 'customers'"
                [class.bg-slate-800]="currentView() === 'customers'"
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
              <svg class="w-4.5 h-4.5 text-amber-500 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
            } @else if (ledger.sheetConfig().scriptUrl && ledger.sheetConfig().syncStatus === 'synced') {
              <mat-icon class="text-base! w-4.5! h-4.5! text-emerald-600">cloud_done</mat-icon>
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            } @else if (ledger.sheetConfig().syncStatus === 'error') {
              <mat-icon class="text-base! w-4.5! h-4.5! text-rose-500">sync_problem</mat-icon>
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            } @else {
              <mat-icon class="text-base! w-4.5! h-4.5! text-slate-400">cloud_queue</mat-icon>
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

  readonly categoryIcon = computed(() => {
    const cat = this.ledger.businessCategory();
    switch (cat) {
      case 'Kirana & General Store':
        return 'storefront';
      case 'Electronics & Mobile':
        return 'smartphone';
      case 'Medical & Pharmacy':
        return 'local_pharmacy';
      case 'Garments & Clothing':
        return 'checkroom';
      case 'Hardware & Sanitary':
        return 'construction';
      case 'Wholesale & Distribution':
        return 'inventory_2';
      case 'Dairy & Bakery':
        return 'bakery_dining';
      case 'Jewellery & Ornaments':
        return 'diamond';
      default:
        return 'store';
    }
  });

  readonly todayFormatted = computed(() => {
    const locale = this.i18n.currentLanguage() === 'hi' ? 'hi-IN' : 'en-IN';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(new Date());
  });
}
