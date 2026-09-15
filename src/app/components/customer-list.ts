import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { CustomerSummary } from '../models/ledger.models';
import { CalendarPickerModal } from './calendar-picker-modal';
import { I18nService } from '../services/i18n';

@Component({
  selector: 'app-customer-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, CalendarPickerModal],
  template: `
    <div class="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      
      <!-- Section Header with Search & Date Filter -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-[#1c1c1e] tracking-tight">{{ i18n.t().customerListHeading }}</h2>
          <p class="text-xs text-[#8e8e93] font-medium">{{ i18n.t().customerListSub }}</p>
        </div>

        <!-- Search & Date Filter Controls in Clean iOS Controls -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Search Input -->
          <div class="relative flex-1 sm:w-64">
            <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93] text-base! w-4! h-4!">search</mat-icon>
            <input
              type="text"
              [value]="searchTerm()"
              (input)="onSearchInput($event)"
              [placeholder]="i18n.t().searchPlaceholder"
              class="w-full pl-9 pr-8 py-2 text-xs font-semibold text-[#1c1c1e] placeholder-[#8e8e93] bg-white border border-slate-200/80 shadow-2xs rounded-xl outline-hidden focus:bg-white focus:ring-2 focus:ring-[#007aff]/30 transition-all"
              id="search-customer-input"
            />
            @if (searchTerm()) {
              <button
                type="button"
                (click)="searchTerm.set('')"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
                title="Clear search"
                id="clear-search-btn"
              >
                <mat-icon class="text-[10px]! w-3! h-3!">close</mat-icon>
              </button>
            }
          </div>

          <!-- Calendar Date Picker Trigger Button -->
          <div class="relative shrink-0">
            <button
              type="button"
              (click)="isCalendarModalOpen.set(true)"
              class="h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-95"
              [class.bg-[#dcfce7]]="selectedDate()"
              [class.border-[#86efac]]="selectedDate()"
              [class.text-[#15803d]]="selectedDate()"
              [class.bg-white]="!selectedDate()"
              [class.border-slate-200]="!selectedDate()"
              [class.text-[#1e293b]]="!selectedDate()"
              [title]="i18n.t().filterByDate"
              id="open-calendar-filter-btn"
            >
              <mat-icon class="text-sm! w-4! h-4!" [class.text-[#16a34a]]="selectedDate()" [class.text-[#007aff]]="!selectedDate()">calendar_month</mat-icon>
              @if (selectedDate()) {
                <span class="text-[11px] font-bold">{{ formatDisplayDate(selectedDate()) }}</span>
              } @else {
                <span class="hidden sm:inline text-[11px]">{{ i18n.t().calendar }}</span>
                <span class="sm:hidden text-[11px]">{{ i18n.t().date }}</span>
              }
            </button>
          </div>

          <!-- Add Customer Button in List -->
          <div class="relative shrink-0">
            <button
              type="button"
              (click)="openAddCustomer.emit()"
              class="h-9 px-3 sm:px-3.5 rounded-xl bg-[#007aff] hover:bg-[#0062cc] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95"
              title="Add Customer"
              id="list-add-customer-btn"
            >
              <mat-icon class="text-sm! w-4! h-4!">person_add</mat-icon>
              <span class="hidden sm:inline">{{ i18n.t().addCustomerBtn }}</span>
              <span class="sm:hidden">{{ i18n.t().customers }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Active Date Filter Pill Banner (if selected) -->
      @if (selectedDate()) {
        <div class="flex items-center justify-between gap-2 text-xs bg-[#e6f8ef] border border-[#86efac]/40 rounded-2xl px-3.5 py-2 text-emerald-950 animate-in fade-in duration-150">
          <div class="flex items-center gap-2 truncate">
            <div class="w-6 h-6 rounded-lg bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
              <mat-icon class="text-xs! w-3.5! h-3.5!">event</mat-icon>
            </div>
            <span class="truncate">{{ i18n.t().selectedDateLabel }}: <strong>{{ formatDisplayDate(selectedDate()) }}</strong> ({{ filteredCustomers().length }} {{ i18n.t().customersWithTx }})</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              (click)="isCalendarModalOpen.set(true)"
              class="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              id="change-active-date-btn"
            >
              {{ i18n.t().changeDateBtn }}
            </button>
            <span class="text-emerald-300">|</span>
            <button
              type="button"
              (click)="clearDateFilter()"
              class="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
              id="remove-active-date-filter-btn"
            >
              {{ i18n.t().removeFilterBtn }}
            </button>
          </div>
        </div>
      }

      <!-- Calendar Picker Modal -->
      @if (isCalendarModalOpen()) {
        <app-calendar-picker-modal
          [initialDate]="selectedDate()"
          (dateSelected)="onCalendarDateSelected($event)"
          (closeModal)="isCalendarModalOpen.set(false)"
        />
      }

      <!-- Segmented Control Tabs & Sort Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2.5">
        <div class="ios-segmented-control flex items-center overflow-x-auto scrollbar-none">
          
          <button
            type="button"
            (click)="filterType.set('all')"
            class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer whitespace-nowrap"
            [class.ios-segmented-btn-active]="filterType() === 'all'"
            [class.text-slate-500]="filterType() !== 'all'"
            id="filter-all-btn"
          >
            {{ i18n.t().filterAll }} ({{ ledger.overview().totalCustomerCount }})
          </button>

          <button
            type="button"
            (click)="filterType.set('due')"
            class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            [class.ios-segmented-btn-active]="filterType() === 'due'"
            [class.text-rose-600]="filterType() !== 'due'"
            id="filter-due-btn"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#ff3b30]"></span>
            <span>{{ i18n.t().filterDue }} ({{ ledger.overview().dueCustomerCount }})</span>
          </button>

          <button
            type="button"
            (click)="filterType.set('advance')"
            class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            [class.ios-segmented-btn-active]="filterType() === 'advance'"
            [class.text-emerald-600]="filterType() !== 'advance'"
            id="filter-advance-btn"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#34c759]"></span>
            <span>{{ i18n.t().filterAdvance }} ({{ ledger.overview().advanceCustomerCount }})</span>
          </button>

          <button
            type="button"
            (click)="filterType.set('settled')"
            class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer whitespace-nowrap"
            [class.ios-segmented-btn-active]="filterType() === 'settled'"
            [class.text-slate-500]="filterType() !== 'settled'"
            id="filter-settled-btn"
          >
            {{ i18n.t().filterSettled }} ({{ ledger.overview().settledCustomerCount }})
          </button>

        </div>

        <!-- Sort Selector in clean pill -->
        <div class="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-black/[0.06] px-3 py-1 rounded-full shadow-2xs">
          <mat-icon class="text-xs! w-3.5! h-3.5! text-slate-400">sort</mat-icon>
          <select
            [value]="sortOrder()"
            (change)="onSortChange($event)"
            class="bg-transparent border-0 text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer outline-hidden"
            id="customer-sort-select"
          >
            <option value="balance-desc">{{ i18n.t().sortHighBalance }}</option>
            <option value="recent">{{ i18n.t().sortRecent }}</option>
            <option value="name">{{ i18n.t().sortName }}</option>
          </select>
        </div>

      </div>

      <!-- Customer Cards List -->
      <div class="space-y-2">
        @if (filteredCustomers().length === 0) {
          <div class="p-8 text-center ios-card my-2">
            <div class="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              @if (!ledger.sheetConfig().scriptUrl) {
                <mat-icon class="text-2xl! w-7! h-7! text-amber-500">cloud_off</mat-icon>
              } @else {
                <mat-icon class="text-2xl! w-7! h-7!">person_search</mat-icon>
              }
            </div>
            @if (!ledger.sheetConfig().scriptUrl) {
              <h4 class="text-sm font-bold text-slate-800">{{ i18n.t().connectSheetPrompt }}</h4>
              <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {{ i18n.t().connectSheetDesc }}
              </p>
            } @else {
              <h4 class="text-sm font-bold text-slate-700">{{ i18n.t().noCustomerFound }}</h4>
              <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                @if (selectedDate()) {
                  {{ i18n.t().noRecordOnDate }} <strong>{{ formatDisplayDate(selectedDate()) }}</strong>
                } @else if (searchTerm()) {
                  "{{ searchTerm() }}"
                } @else {
                  {{ i18n.t().noRecordInCategory }}
                }
              </p>
              @if (selectedDate()) {
                <button
                  type="button"
                  (click)="clearDateFilter()"
                  class="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#007aff] text-xs font-bold hover:bg-blue-100 cursor-pointer transition-colors"
                  id="empty-reset-date-filter-btn"
                >
                  <mat-icon class="text-xs! w-3.5! h-3.5!">event_busy</mat-icon>
                  <span>{{ i18n.t().resetDateFilter }}</span>
                </button>
              }
            }
            <button
              type="button"
              (click)="openAddCustomer.emit()"
              class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 ios-btn-primary text-xs cursor-pointer"
              id="empty-add-customer-btn"
            >
              <mat-icon class="text-sm! w-4! h-4!">
                {{ !ledger.sheetConfig().scriptUrl ? 'add_link' : 'person_add' }}
              </mat-icon>
              <span>{{ !ledger.sheetConfig().scriptUrl ? i18n.t().connectSheetPrompt : i18n.t().addCustomerBtn }}</span>
            </button>
          </div>
        } @else {
          @for (item of filteredCustomers(); track item.customer.id) {
            <div
              class="ios-card-interactive p-3 sm:p-3.5 flex items-center justify-between gap-3 group"
              [id]="'customer-row-' + item.customer.id"
            >
              <!-- Clickable Area for Customer Details -->
              <button
                type="button"
                (click)="selectCustomer(item.customer.id)"
                class="flex items-center justify-between flex-1 min-w-0 text-left cursor-pointer outline-hidden"
              >
                <!-- Left: Squircle Avatar + Customer Info -->
                <div class="flex items-center gap-3 min-w-0 pr-2">
                  
                  <div
                    class="w-11 h-11 rounded-[12px] flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs"
                    [class.bg-[#fef4ea]]="item.status === 'due'"
                    [class.text-[#c2410c]]="item.status === 'due'"
                    [class.border]="true"
                    [class.border-[#fed7aa]/60]="item.status === 'due'"
                    [class.bg-[#eafaf1]]="item.status === 'advance'"
                    [class.text-[#15803d]]="item.status === 'advance'"
                    [class.border-[#86efac]/60]="item.status === 'advance'"
                    [class.bg-[#e8f2fc]]="item.status === 'settled'"
                    [class.text-[#0369a1]]="item.status === 'settled'"
                    [class.border-[#bae6fd]/60]="item.status === 'settled'"
                  >
                    {{ item.customer.name.slice(0, 1).toUpperCase() }}
                  </div>

                  <div class="min-w-0">
                    <h3 class="text-sm sm:text-base font-bold text-[#1c1c1e] truncate group-hover:text-[#007aff] transition-colors">
                      {{ item.customer.name }}
                    </h3>

                    <div class="flex items-center gap-2 text-[11px] text-[#8e8e93] mt-0.5 font-medium">
                      @if (item.customer.phone) {
                        <span class="truncate">+91 {{ item.customer.phone }}</span>
                      }
                      @if (item.customer.phone && item.lastTransaction) {
                        <span>•</span>
                      }
                      @if (item.lastTransaction) {
                        <span class="truncate text-slate-500 font-semibold">
                          {{ formatRelativeDate(item.lastTransaction.date) }}
                        </span>
                      }
                    </div>
                  </div>

                </div>

                <!-- Right: Balance Amount & Status Tag -->
                <div class="text-right shrink-0 pr-2">
                  <div
                    class="text-sm sm:text-base font-black tracking-tight"
                    [class.text-[#ea580c]]="item.status === 'due'"
                    [class.text-[#16a34a]]="item.status === 'advance'"
                    [class.text-[#64748b]]="item.status === 'settled'"
                  >
                    ₹{{ formatAmount(item.netBalance) }}
                  </div>
                  <div class="mt-0.5">
                    <span
                      class="text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-full"
                      [class.bg-[#ffedd5]]="item.status === 'due'"
                      [class.text-[#c2410c]]="item.status === 'due'"
                      [class.bg-[#dcfce7]]="item.status === 'advance'"
                      [class.text-[#15803d]]="item.status === 'advance'"
                      [class.bg-slate-100]="item.status === 'settled'"
                      [class.text-slate-500]="item.status === 'settled'"
                    >
                      @if (item.status === 'due') {
                        {{ i18n.t().filterDue }}
                      } @else if (item.status === 'advance') {
                        {{ i18n.t().filterAdvance }}
                      } @else {
                        {{ i18n.t().filterSettled }}
                      }
                    </span>
                  </div>
                </div>
              </button>

              <!-- Far Right Action: WhatsApp Reminder or Chevron -->
              <div class="flex items-center shrink-0">
                @if (item.status === 'due' && item.customer.phone) {
                  <a
                    [href]="ledger.getWhatsAppShareUrl(item.customer, item.netBalance)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#eafaf1] text-[#15803d] hover:bg-[#dcfce7] flex items-center justify-center transition-all border border-[#86efac]/60 active:scale-95 shadow-2xs"
                    [title]="i18n.t().sendWaReminderBtn"
                    [id]="'wa-reminder-' + item.customer.id"
                  >
                    <mat-icon class="text-xs! w-3.5! h-3.5! text-[#10b981]">chat</mat-icon>
                  </a>
                } @else {
                  <button
                    type="button"
                    (click)="selectCustomer(item.customer.id)"
                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-[#8e8e93] hover:bg-slate-200 hover:text-[#1c1c1e] flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    title="View Details"
                  >
                    <mat-icon class="text-xs! w-3.5! h-3.5!">chevron_right</mat-icon>
                  </button>
                }
              </div>

            </div>
          }
        }
      </div>

      <!-- Bottom bar: Customer Count & Add Customer Trigger -->
      <div class="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500 px-1">
        <span>{{ i18n.t().totalCustomersLabel }}: <strong class="text-slate-800 font-bold">{{ filteredCustomers().length }}</strong></span>
        <button
          type="button"
          (click)="openAddCustomer.emit()"
          class="app-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
          id="list-bottom-add-customer-btn"
        >
          <mat-icon class="text-xs! w-3.5! h-3.5!">add</mat-icon>
          <span>{{ i18n.t().addCustomerBtn }}</span>
        </button>
      </div>

    </div>
  `
})
export class CustomerList {
  readonly ledger = inject(Ledger);
  readonly i18n = inject(I18nService);
  readonly openAddCustomer = output<void>();
  readonly initialFilter = input<'all' | 'due' | 'advance' | 'settled'>('all');

  readonly searchTerm = signal('');
  readonly filterType = signal<'all' | 'due' | 'advance' | 'settled'>('all');
  readonly sortOrder = signal<'balance-desc' | 'recent' | 'name'>('balance-desc');
  readonly selectedDate = signal<string>('');
  readonly isCalendarModalOpen = signal<boolean>(false);

  constructor() {
    effect(() => {
      const init = this.initialFilter();
      if (init) {
        this.filterType.set(init);
      }
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortOrder.set(select.value as 'balance-desc' | 'recent' | 'name');
  }

  onCalendarDateSelected(dateStr: string): void {
    this.selectedDate.set(dateStr);
    this.isCalendarModalOpen.set(false);
  }

  clearDateFilter(): void {
    this.selectedDate.set('');
  }

  formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const locale = this.i18n.currentLanguage() === 'hi' ? 'hi-IN' : 'en-IN';
      return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  selectCustomer(id: string): void {
    this.ledger.selectCustomer(id);
  }

  setFilter(filter: 'all' | 'due' | 'advance' | 'settled'): void {
    this.filterType.set(filter);
  }

  readonly filteredCustomers = computed<CustomerSummary[]>(() => {
    let list = [...this.ledger.customerSummaries()];
    const query = this.searchTerm().trim().toLowerCase();
    const filter = this.filterType();
    const sort = this.sortOrder();
    const dateVal = this.selectedDate();

    // 1. Filter by specific date if selected
    if (dateVal) {
      const activeCustIds = new Set(
        this.ledger
          .transactions()
          .filter((t) => (t.date && t.date.slice(0, 10) === dateVal) || (t.createdAt && t.createdAt.slice(0, 10) === dateVal))
          .map((t) => t.customerId)
      );
      list = list.filter((item) => activeCustIds.has(item.customer.id));
    }

    // 2. Filter by search query (Name or Phone)
    if (query) {
      list = list.filter(
        (item) =>
          item.customer.name.toLowerCase().includes(query) ||
          item.customer.phone.includes(query) ||
          (item.customer.address && item.customer.address.toLowerCase().includes(query))
      );
    }

    // 3. Filter by status chip
    if (filter === 'due') {
      list = list.filter((item) => item.status === 'due');
    } else if (filter === 'advance') {
      list = list.filter((item) => item.status === 'advance');
    } else if (filter === 'settled') {
      list = list.filter((item) => item.status === 'settled');
    }

    // 4. Sort
    if (sort === 'balance-desc') {
      list.sort((a, b) => b.netBalance - a.netBalance);
    } else if (sort === 'recent') {
      list.sort((a, b) => {
        const dateA = a.lastTransaction ? new Date(a.lastTransaction.date).getTime() : 0;
        const dateB = b.lastTransaction ? new Date(b.lastTransaction.date).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sort === 'name') {
      list.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
    }

    return list;
  });

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  formatAmount(amount: number): string {
    return Math.abs(amount).toLocaleString('en-IN');
  }

  formatRelativeDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      const isHi = this.i18n.currentLanguage() === 'hi';
      if (diffDays === 0) return isHi ? 'आज' : 'Today';
      if (diffDays === 1) return isHi ? 'कल' : 'Yesterday';
      if (diffDays < 7) return isHi ? `${diffDays} दिन पहले` : `${diffDays}d ago`;
      const locale = isHi ? 'hi-IN' : 'en-IN';
      return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  }
}
