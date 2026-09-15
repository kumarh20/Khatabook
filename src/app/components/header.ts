import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <header class="sticky top-0 z-30 bg-[#f0f5fa]/90 backdrop-blur-md border-b border-slate-200/60 transition-all">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-3">
        
        <!-- Left: Hello, [Shop Name] + Date (Matching Screenshot 'Hello, Jamie / Tuesday, 18 June') -->
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 group">
            @if (isEditingName()) {
              <div class="flex items-center gap-1.5">
                <input
                  #nameInput
                  type="text"
                  [value]="ledger.businessName()"
                  (keydown.enter)="saveBusinessName(nameInput.value)"
                  (keydown.escape)="isEditingName.set(false)"
                  class="text-sm font-bold text-slate-900 bg-white border border-blue-400 rounded-xl px-2.5 py-1 outline-hidden shadow-xs"
                  placeholder="Dukan ka naam"
                  id="business-name-input"
                />
                <button
                  type="button"
                  (click)="saveBusinessName(nameInput.value)"
                  class="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center cursor-pointer"
                  id="save-business-name-btn"
                >
                  <mat-icon class="text-xs! w-3.5! h-3.5!">check</mat-icon>
                </button>
                <button
                  type="button"
                  (click)="isEditingName.set(false)"
                  class="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                  id="cancel-business-name-btn"
                >
                  <mat-icon class="text-xs! w-3.5! h-3.5!">close</mat-icon>
                </button>
              </div>
            } @else {
              <button
                type="button"
                (click)="viewChange.emit('profile')"
                class="text-left group cursor-pointer outline-hidden flex items-center gap-1.5"
                title="Profile & Dukan settings"
              >
                <h1 class="text-base sm:text-xl font-extrabold text-slate-900 truncate tracking-tight group-hover:text-blue-600 transition-colors">
                  {{ ledger.businessName() }}
                </h1>
              </button>
              <button
                type="button"
                (click)="isEditingName.set(true)"
                class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 cursor-pointer transition-all"
                title="Dukan ka naam badlein"
                id="edit-business-name-btn"
              >
                <mat-icon class="text-xs! w-3.5! h-3.5!">edit</mat-icon>
              </button>
            }
          </div>
          <p class="text-xs text-slate-500 font-medium mt-0.5">
            {{ todayFormatted }} • Udhar Bahi Khata
          </p>
        </div>

        <!-- Center: Desktop Navigation Tabs -->
        <nav class="hidden md:flex items-center gap-1 bg-white/90 p-1 rounded-full border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            (click)="viewChange.emit('dashboard')"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            [class.bg-slate-900]="currentView() === 'dashboard'"
            [class.text-white]="currentView() === 'dashboard'"
            [class.text-slate-600]="currentView() !== 'dashboard'"
            [class.hover:text-slate-900]="currentView() !== 'dashboard'"
            id="nav-tab-dashboard"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">dashboard</mat-icon>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            (click)="viewChange.emit('customers')"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            [class.bg-slate-900]="currentView() === 'customers'"
            [class.text-white]="currentView() === 'customers'"
            [class.text-slate-600]="currentView() !== 'customers'"
            [class.hover:text-slate-900]="currentView() !== 'customers'"
            id="nav-tab-customers"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">people</mat-icon>
            <span>Grahak List</span>
            @if (ledger.overview().dueCustomerCount > 0) {
              <span
                class="px-1.5 py-0.2 rounded-full text-[9px] font-black"
                [class.bg-rose-500]="currentView() !== 'customers'"
                [class.text-white]="currentView() !== 'customers'"
                [class.bg-white]="currentView() === 'customers'"
                [class.text-slate-900]="currentView() === 'customers'"
              >
                {{ ledger.overview().dueCustomerCount }}
              </span>
            }
          </button>

          <button
            type="button"
            (click)="viewChange.emit('profile')"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            [class.bg-slate-900]="currentView() === 'profile'"
            [class.text-white]="currentView() === 'profile'"
            [class.text-slate-600]="currentView() !== 'profile'"
            [class.hover:text-slate-900]="currentView() !== 'profile'"
            id="nav-tab-profile"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">storefront</mat-icon>
            <span>Profile</span>
          </button>
        </nav>

        <!-- Right Side: Sheet Sync Status Pill & Add Customer Button -->
        <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          <!-- Google Sheet Sync Status Pill (Clean pastel badge) -->
          <button
            type="button"
            (click)="openSheetSettings.emit()"
            class="app-btn-secondary px-3 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
            [class.badge-pill-mint]="ledger.sheetConfig().scriptUrl && ledger.sheetConfig().syncStatus === 'synced'"
            [class.badge-pill-amber]="ledger.sheetConfig().syncStatus === 'syncing'"
            [class.badge-pill-rose]="ledger.sheetConfig().syncStatus === 'error'"
            id="sheet-sync-status-btn"
          >
            @if (ledger.sheetConfig().syncStatus === 'syncing') {
              <mat-icon class="text-sm! w-4! h-4! animate-spin text-amber-600">sync</mat-icon>
              <span class="hidden sm:inline font-bold">Syncing...</span>
            } @else if (ledger.sheetConfig().scriptUrl && ledger.sheetConfig().syncStatus === 'synced') {
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <mat-icon class="text-sm! w-4! h-4! text-emerald-600">cloud_done</mat-icon>
              <span class="hidden sm:inline font-bold">Sheet Synced</span>
            } @else if (ledger.sheetConfig().syncStatus === 'error') {
              <mat-icon class="text-sm! w-4! h-4! text-rose-500">sync_problem</mat-icon>
              <span class="hidden sm:inline font-bold">Sync Error</span>
            } @else {
              <mat-icon class="text-sm! w-4! h-4! text-slate-400">cloud_off</mat-icon>
              <span class="hidden sm:inline font-bold">Connect Sheet</span>
            }
          </button>

          <!-- Add Customer Button (Matching crisp dark pill from screenshot) -->
          <button
            type="button"
            (click)="openAddCustomer.emit()"
            class="app-btn-primary px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            id="header-add-customer-btn"
          >
            <mat-icon class="text-sm! w-4! h-4!">add</mat-icon>
            <span class="font-bold hidden sm:inline">+ Naya Grahak</span>
            <span class="font-bold sm:hidden">+ Grahak</span>
          </button>

        </div>

      </div>
    </header>
  `
})
export class Header {
  readonly ledger = inject(Ledger);
  readonly currentView = input<'dashboard' | 'customers' | 'profile'>('dashboard');
  readonly viewChange = output<'dashboard' | 'customers' | 'profile'>();
  readonly openAddCustomer = output<void>();
  readonly openSheetSettings = output<void>();

  readonly isEditingName = signal(false);

  readonly todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(new Date());

  saveBusinessName(val: string): void {
    if (val.trim()) {
      this.ledger.setBusinessName(val);
    }
    this.isEditingName.set(false);
  }
}
