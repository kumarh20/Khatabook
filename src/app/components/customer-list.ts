import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { CustomerSummary } from '../models/ledger.models';

@Component({
  selector: 'app-customer-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="space-y-4">
      
      <!-- Section Header with Search & Date Filter (Matching Screenshot 1 & 2 layout) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Grahak Bahi Khata</h2>
          <p class="text-xs text-slate-500 font-medium">Len-den ki puri list aur hisab kitab</p>
        </div>

        <!-- Search & Date Filter Controls in Clean Pills -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Search Input -->
          <div class="relative flex-1 sm:w-64">
            <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base! w-4! h-4!">search</mat-icon>
            <input
              type="text"
              [value]="searchTerm()"
              (input)="onSearchInput($event)"
              placeholder="Naam ya phone khojein..."
              class="w-full pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 bg-white border border-slate-200/80 rounded-full shadow-2xs outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              id="search-customer-input"
            />
            @if (searchTerm()) {
              <button
                type="button"
                (click)="searchTerm.set('')"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
                id="clear-search-btn"
              >
                <mat-icon class="text-xs! w-3.5! h-3.5!">close</mat-icon>
              </button>
            }
          </div>

          <!-- Small Date Filter Button / Input -->
          <div class="relative shrink-0">
            @if (!isDateFilterOpen()) {
              <button
                type="button"
                (click)="isDateFilterOpen.set(true)"
                class="h-9 px-3 rounded-full border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                [class.bg-blue-50]="selectedDate()"
                [class.border-blue-300]="selectedDate()"
                [class.text-blue-700]="selectedDate()"
                [class.bg-white]="!selectedDate()"
                [class.border-slate-200/80]="!selectedDate()"
                [class.text-slate-600]="!selectedDate()"
                [class.hover:bg-slate-50]="!selectedDate()"
                title="Tarikh se filter karein"
                id="open-date-filter-btn"
              >
                <mat-icon class="text-sm! w-4! h-4!">calendar_today</mat-icon>
                @if (selectedDate()) {
                  <span class="text-[11px]">{{ formatDisplayDate(selectedDate()) }}</span>
                } @else {
                  <span class="hidden sm:inline text-[11px]">Tarikh</span>
                }
              </button>
            } @else {
              <!-- Small Inline Date Field -->
              <div class="flex items-center gap-1.5 bg-white border border-blue-400 rounded-full pl-3 pr-2 py-1 shadow-xs animate-in fade-in duration-150">
                <mat-icon class="text-xs! w-3.5! h-3.5! text-blue-600">event</mat-icon>
                <input
                  type="date"
                  [value]="selectedDate()"
                  (change)="onDateChange($event)"
                  class="text-xs font-bold text-slate-800 bg-transparent outline-hidden cursor-pointer"
                  id="customer-date-input"
                />
                @if (selectedDate()) {
                  <button
                    type="button"
                    (click)="clearDateFilter()"
                    class="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                    title="Date hatayein"
                    id="clear-date-filter-btn"
                  >
                    <mat-icon class="text-xs! w-3! h-3!">close</mat-icon>
                  </button>
                }
                <button
                  type="button"
                  (click)="isDateFilterOpen.set(false)"
                  class="text-slate-400 hover:text-slate-700 text-xs ml-0.5 cursor-pointer"
                  title="Done"
                  id="close-date-picker-btn"
                >
                  <mat-icon class="text-xs! w-3.5! h-3.5!">check</mat-icon>
                </button>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Active Date Filter Pill Banner (if selected) -->
      @if (selectedDate()) {
        <div class="flex items-center justify-between gap-2 text-xs bg-blue-50 border border-blue-200/80 rounded-2xl px-3.5 py-1.5 text-blue-950 animate-in fade-in duration-150">
          <div class="flex items-center gap-2 truncate">
            <mat-icon class="text-sm! w-4! h-4! text-blue-600 shrink-0">filter_alt</mat-icon>
            <span class="truncate">Tarikh filter: <strong>{{ formatDisplayDate(selectedDate()) }}</strong> ({{ filteredCustomers().length }} grahak)</span>
          </div>
          <button
            type="button"
            (click)="clearDateFilter()"
            class="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer shrink-0"
            id="remove-active-date-filter-btn"
          >
            Hatayein
          </button>
        </div>
      }

      <!-- Filter Segmented Tabs & Sort Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          
          <button
            type="button"
            (click)="filterType.set('all')"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            [class.bg-slate-900]="filterType() === 'all'"
            [class.text-white]="filterType() === 'all'"
            [class.bg-white]="filterType() !== 'all'"
            [class.text-slate-600]="filterType() !== 'all'"
            [class.border]="filterType() !== 'all'"
            [class.border-slate-200]="filterType() !== 'all'"
            id="filter-all-btn"
          >
            Sabhi ({{ ledger.overview().totalCustomerCount }})
          </button>

          <button
            type="button"
            (click)="filterType.set('due')"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs"
            [class.bg-rose-600]="filterType() === 'due'"
            [class.text-white]="filterType() === 'due'"
            [class.bg-white]="filterType() !== 'due'"
            [class.text-rose-700]="filterType() !== 'due'"
            [class.border]="filterType() !== 'due'"
            [class.border-rose-200]="filterType() !== 'due'"
            id="filter-due-btn"
          >
            <span class="w-1.5 h-1.5 rounded-full" [class.bg-white]="filterType() === 'due'" [class.bg-rose-500]="filterType() !== 'due'"></span>
            <span>Lena Hai ({{ ledger.overview().dueCustomerCount }})</span>
          </button>

          <button
            type="button"
            (click)="filterType.set('advance')"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-2xs"
            [class.bg-emerald-600]="filterType() === 'advance'"
            [class.text-white]="filterType() === 'advance'"
            [class.bg-white]="filterType() !== 'advance'"
            [class.text-emerald-700]="filterType() !== 'advance'"
            [class.border]="filterType() !== 'advance'"
            [class.border-emerald-200]="filterType() !== 'advance'"
            id="filter-advance-btn"
          >
            <span class="w-1.5 h-1.5 rounded-full" [class.bg-white]="filterType() === 'advance'" [class.bg-emerald-500]="filterType() !== 'advance'"></span>
            <span>Dena Hai ({{ ledger.overview().advanceCustomerCount }})</span>
          </button>

          <button
            type="button"
            (click)="filterType.set('settled')"
            class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            [class.bg-slate-900]="filterType() === 'settled'"
            [class.text-white]="filterType() === 'settled'"
            [class.bg-white]="filterType() !== 'settled'"
            [class.text-slate-600]="filterType() !== 'settled'"
            [class.border]="filterType() !== 'settled'"
            [class.border-slate-200]="filterType() !== 'settled'"
            id="filter-settled-btn"
          >
            Barabar ({{ ledger.overview().settledCustomerCount }})
          </button>

        </div>

        <!-- Sort Selector in clean pill -->
        <div class="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200/80 px-3 py-1 rounded-full shadow-2xs">
          <mat-icon class="text-xs! w-3.5! h-3.5! text-slate-400">sort</mat-icon>
          <select
            [value]="sortOrder()"
            (change)="onSortChange($event)"
            class="bg-transparent border-0 text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer outline-hidden"
            id="customer-sort-select"
          >
            <option value="balance-desc">Zyada Baaki (High to Low)</option>
            <option value="recent">Haliye Len-Den (Recent)</option>
            <option value="name">Naam (A to Z)</option>
          </select>
        </div>

      </div>

      <!-- Customer Cards List (Clean Floating Cards with Soft Shadow Matching Screenshot) -->
      <div class="space-y-2.5">
        @if (filteredCustomers().length === 0) {
          <div class="p-8 text-center app-card my-2">
            <div class="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              @if (!ledger.sheetConfig().scriptUrl) {
                <mat-icon class="text-2xl! w-7! h-7! text-amber-500">cloud_off</mat-icon>
              } @else {
                <mat-icon class="text-2xl! w-7! h-7!">person_search</mat-icon>
              }
            </div>
            @if (!ledger.sheetConfig().scriptUrl) {
              <h4 class="text-sm font-bold text-slate-800">Google Sheet Connect Karein</h4>
              <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Bahi-khata direct Google Sheet me automatically sync hoga. Shuru karne ke liye pehle apni Sheet connect karein.
              </p>
            } @else {
              <h4 class="text-sm font-bold text-slate-700">Koi grahak nahi mila</h4>
              <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                @if (selectedDate()) {
                  Tarikh <strong>{{ formatDisplayDate(selectedDate()) }}</strong> ko koi bhi len-den record nahi mila.
                } @else if (searchTerm()) {
                  "{{ searchTerm() }}" se milta julta koi grahak nahi mila.
                } @else {
                  Is category me abhi koi record nahi hai.
                }
              </p>
              @if (selectedDate()) {
                <button
                  type="button"
                  (click)="clearDateFilter()"
                  class="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 cursor-pointer transition-colors"
                  id="empty-reset-date-filter-btn"
                >
                  <mat-icon class="text-xs! w-3.5! h-3.5!">event_busy</mat-icon>
                  <span>Sabhi Tarikh Dekhein (Reset)</span>
                </button>
              }
            }
            <button
              type="button"
              (click)="openAddCustomer.emit()"
              class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 app-btn-primary text-xs cursor-pointer"
              id="empty-add-customer-btn"
            >
              <mat-icon class="text-sm! w-4! h-4!">
                {{ !ledger.sheetConfig().scriptUrl ? 'add_link' : 'person_add' }}
              </mat-icon>
              <span>{{ !ledger.sheetConfig().scriptUrl ? 'Sheet Connect Karein' : '+ Naya Grahak Jodein' }}</span>
            </button>
          </div>
        } @else {
          @for (item of filteredCustomers(); track item.customer.id) {
            <div
              class="app-card-interactive p-3.5 sm:p-4 flex items-center justify-between gap-3 group"
              [id]="'customer-row-' + item.customer.id"
            >
              <!-- Clickable Area for Customer Details -->
              <button
                type="button"
                (click)="selectCustomer(item.customer.id)"
                class="flex items-center justify-between flex-1 min-w-0 text-left cursor-pointer outline-hidden"
              >
                <!-- Left: Status Badge Pill + Info (Direct match to screenshot item design) -->
                <div class="flex items-center gap-3 min-w-0 pr-2">
                  
                  <!-- Left Status Pill (Like time tags '10:30' in screenshot) -->
                  <div
                    class="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider shrink-0 uppercase"
                    [class.badge-pill-rose]="item.status === 'due'"
                    [class.badge-pill-mint]="item.status === 'advance'"
                    [class.badge-pill-blue]="item.status === 'settled'"
                  >
                    @if (item.status === 'due') {
                      Lena
                    } @else if (item.status === 'advance') {
                      Dena
                    } @else {
                      Nill
                    }
                  </div>

                  <!-- Customer Name & Details -->
                  <div class="min-w-0">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {{ item.customer.name }}
                    </h3>

                    <div class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-medium">
                      @if (item.customer.phone) {
                        <span class="truncate">{{ item.customer.phone }}</span>
                      }
                      @if (item.customer.phone && item.lastTransaction) {
                        <span>•</span>
                      }
                      @if (item.lastTransaction) {
                        <span class="truncate text-slate-500">
                          {{ formatRelativeDate(item.lastTransaction.date) }}
                        </span>
                      }
                    </div>
                  </div>

                </div>

                <!-- Right: Balance Amount -->
                <div class="text-right shrink-0 pr-2">
                  <div
                    class="text-sm sm:text-base font-black tracking-tight"
                    [class.text-rose-600]="item.status === 'due'"
                    [class.text-emerald-600]="item.status === 'advance'"
                    [class.text-slate-500]="item.status === 'settled'"
                  >
                    ₹{{ formatAmount(item.netBalance) }}
                  </div>
                  <div
                    class="text-[10px] font-extrabold uppercase tracking-wider"
                    [class.text-rose-500]="item.status === 'due'"
                    [class.text-emerald-600]="item.status === 'advance'"
                    [class.text-slate-400]="item.status === 'settled'"
                  >
                    @if (item.status === 'due') {
                      Lena Hai
                    } @else if (item.status === 'advance') {
                      Dena Hai
                    } @else {
                      Barabar
                    }
                  </div>
                </div>
              </button>

              <!-- Far Right Action: Circular WhatsApp or Arrow Button (Matching circular controls in screenshot) -->
              <div class="flex items-center shrink-0">
                @if (item.status === 'due' && item.customer.phone) {
                  <a
                    [href]="ledger.getWhatsAppShareUrl(item.customer, item.netBalance)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-all border border-emerald-200/60"
                    title="WhatsApp Reminder bhejein"
                    [id]="'wa-reminder-' + item.customer.id"
                  >
                    <mat-icon class="text-xs! w-3.5! h-3.5!">chat</mat-icon>
                  </a>
                } @else {
                  <button
                    type="button"
                    (click)="selectCustomer(item.customer.id)"
                    class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-all"
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
        <span>Kul Grahak: <strong class="text-slate-800 font-bold">{{ filteredCustomers().length }}</strong></span>
        <button
          type="button"
          (click)="openAddCustomer.emit()"
          class="app-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
          id="list-bottom-add-customer-btn"
        >
          <mat-icon class="text-xs! w-3.5! h-3.5!">add</mat-icon>
          <span>Naya Grahak</span>
        </button>
      </div>

    </div>
  `
})
export class CustomerList {
  readonly ledger = inject(Ledger);
  readonly openAddCustomer = output<void>();
  readonly initialFilter = input<'all' | 'due' | 'advance' | 'settled'>('all');

  readonly searchTerm = signal('');
  readonly filterType = signal<'all' | 'due' | 'advance' | 'settled'>('all');
  readonly sortOrder = signal<'balance-desc' | 'recent' | 'name'>('balance-desc');
  readonly selectedDate = signal<string>('');
  readonly isDateFilterOpen = signal<boolean>(false);

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

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(input.value);
  }

  clearDateFilter(): void {
    this.selectedDate.set('');
  }

  formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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

    // 1. Filter by specific date if selected (matches transactions on that calendar day)
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
      if (diffDays === 0) return 'Aaj';
      if (diffDays === 1) return 'Kal';
      if (diffDays < 7) return `${diffDays} din pehle`;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  }
}
