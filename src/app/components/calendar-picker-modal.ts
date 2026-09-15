import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { Transaction } from '../models/ledger.models';

interface CalendarDay {
  dayNumber: number;
  dateStr: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  txCount: number;
  totalGave: number;
  totalReceived: number;
  hasGave: boolean;
  hasReceived: boolean;
}

@Component({
  selector: 'app-calendar-picker-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/35 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        class="bg-[#ffffff] w-full max-w-md rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-[0_12px_40px_rgba(100,125,160,0.18)] max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        id="calendar-picker-dialog"
      >
        
        <!-- Modal Top Bar -->
        <div class="pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-[10px] bg-[#dcfce7] text-[#16a34a] flex items-center justify-center font-bold shadow-2xs">
              <mat-icon class="text-base! w-4! h-4!">calendar_month</mat-icon>
            </div>
            <div>
              <h3 class="font-bold text-base text-[#1e293b] tracking-tight leading-tight">Calendar</h3>
              <p class="text-[11px] text-slate-400 font-medium">Tareekh chun kar hisab dekhein</p>
            </div>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            id="close-calendar-modal-btn"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">close</mat-icon>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto space-y-3.5 py-3 pr-0.5 scrollbar-thin">

          <!-- 1. Soft Mint Green Hero Card (Matching Screen 2 in Screenshot) -->
          <div class="hero-gradient-mint-ss p-4 rounded-xl text-slate-800 relative overflow-hidden shadow-xs border border-emerald-200/50">
            <!-- Background aesthetic wave/glow -->
            <div class="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-white/30 blur-xl pointer-events-none"></div>

            <div class="relative z-10 flex items-center justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  (click)="prevMonth()"
                  class="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-95"
                  title="Pichhla Mahina"
                  id="cal-prev-month-btn"
                >
                  <mat-icon class="text-xs! w-3.5! h-3.5!">chevron_left</mat-icon>
                </button>
                <h4 class="text-base font-bold text-slate-900 tracking-tight px-1">
                  {{ monthName() }} {{ currentYear() }}
                </h4>
                <button
                  type="button"
                  (click)="nextMonth()"
                  class="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-95"
                  title="Agla Mahina"
                  id="cal-next-month-btn"
                >
                  <mat-icon class="text-xs! w-3.5! h-3.5!">chevron_right</mat-icon>
                </button>
              </div>

              <!-- Quick Today Jump -->
              <button
                type="button"
                (click)="goToToday()"
                class="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-[11px] font-bold text-emerald-800 cursor-pointer shadow-2xs transition-all active:scale-95"
                id="cal-today-btn"
              >
                Aaj (Today)
              </button>
            </div>

            <!-- Month Stats Subtitle -->
            <p class="text-[11px] text-emerald-900/80 font-medium mb-2.5">
              {{ monthTxCount() }} len-den • ₹{{ monthTotalVolume().toLocaleString('en-IN') }} kul karobar
            </p>

            <!-- Quick Filter Pill Tags (From Screenshot Screen 2) -->
            <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
              <button
                type="button"
                (click)="typeFilter.set('all')"
                class="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                [class.bg-white]="typeFilter() === 'all'"
                [class.text-emerald-900]="typeFilter() === 'all'"
                [class.bg-white/50]="typeFilter() !== 'all'"
                [class.text-slate-700]="typeFilter() !== 'all'"
                id="cal-filter-all"
              >
                Sabhi (All)
              </button>
              <button
                type="button"
                (click)="typeFilter.set('due')"
                class="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                [class.bg-white]="typeFilter() === 'due'"
                [class.text-rose-700]="typeFilter() === 'due'"
                [class.bg-white/50]="typeFilter() !== 'due'"
                [class.text-slate-700]="typeFilter() !== 'due'"
                id="cal-filter-due"
              >
                Lena Hai (Due)
              </button>
              <button
                type="button"
                (click)="typeFilter.set('advance')"
                class="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                [class.bg-white]="typeFilter() === 'advance'"
                [class.text-emerald-800]="typeFilter() === 'advance'"
                [class.bg-white/50]="typeFilter() !== 'advance'"
                [class.text-slate-700]="typeFilter() !== 'advance'"
                id="cal-filter-advance"
              >
                Dena Hai (Advance)
              </button>
            </div>
          </div>

          <!-- 2. Month Calendar Card with Day Grid (Matching Screen 2) -->
          <div class="bg-[#ffffff] rounded-xl p-3.5 border border-slate-100 shadow-2xs">
            
            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 text-center mb-2">
              @for (dayName of weekDays; track dayName) {
                <span class="text-[11px] font-bold text-slate-400 py-1">
                  {{ dayName }}
                </span>
              }
            </div>

            <!-- Days Grid -->
            <div class="grid grid-cols-7 gap-1 text-center">
              @for (day of calendarDays(); track day.dateStr) {
                <button
                  type="button"
                  (click)="onSelectDay(day.dateStr)"
                  class="h-10 rounded-lg flex flex-col items-center justify-center p-0.5 relative cursor-pointer transition-all active:scale-95 group"
                  [class.bg-[#007aff]]="day.isSelected"
                  [class.text-white]="day.isSelected"
                  [class.font-bold]="day.isSelected || day.isToday"
                  [class.bg-slate-50]="!day.isSelected && day.isToday"
                  [class.text-slate-800]="!day.isSelected && day.isCurrentMonth"
                  [class.text-slate-300]="!day.isSelected && !day.isCurrentMonth"
                  [class.hover:bg-slate-100]="!day.isSelected"
                  [id]="'cal-day-' + day.dateStr"
                >
                  <!-- Day Number -->
                  <span
                    class="text-xs leading-none"
                    [class.text-white]="day.isSelected"
                    [class.text-[#007aff]]="!day.isSelected && day.isToday"
                  >
                    {{ day.dayNumber }}
                  </span>

                  <!-- Colorful indicator pills / dots (Matching Screenshot's cute colorful pills under days) -->
                  @if (day.txCount > 0) {
                    <div class="flex items-center gap-0.5 mt-1">
                      @if (day.hasGave && !day.isSelected) {
                        <!-- Peach/Rose pill for gave/due -->
                        <span class="w-3 h-1 rounded-full bg-[#f87171]" title="Diye"></span>
                      }
                      @if (day.hasReceived && !day.isSelected) {
                        <!-- Mint/Green pill for received -->
                        <span class="w-3 h-1 rounded-full bg-[#34d399]" title="Jama"></span>
                      }
                      @if (day.isSelected) {
                        <span class="w-3 h-1 rounded-full bg-white/90"></span>
                      }
                    </div>
                  } @else {
                    <span class="h-1 mt-1"></span>
                  }
                </button>
              }
            </div>
          </div>

          <!-- 3. Marked Day Details Section (Matching Bottom Section of Screen 2) -->
          <div class="bg-[#ffffff] rounded-xl p-3.5 border border-slate-100 shadow-2xs space-y-2.5">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold text-slate-900 tracking-tight">Marked day details</h4>
                <p class="text-[11px] text-slate-400 font-medium">
                  Selected date: <strong class="text-slate-700">{{ formatDisplayDate(activeDate()) || 'Koi tarikh chuni nahi' }}</strong>
                </p>
              </div>

              @if (activeDate()) {
                <button
                  type="button"
                  (click)="clearFilter()"
                  class="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                  id="cal-clear-date-btn"
                >
                  Clear Tarikh
                </button>
              }
            </div>

            <!-- Day's Transactions List -->
            @if (activeDayTransactions().length > 0) {
              <div class="space-y-2 pt-1">
                @for (tx of activeDayTransactions(); track tx.id) {
                  <div class="p-2.5 rounded-lg bg-[#f8fafc] border border-slate-100 flex items-center justify-between gap-2.5">
                    
                    <div class="flex items-center gap-2.5 min-w-0">
                      <!-- Soft Colored Time Badge (From Screen 1 & 2 in Screenshot) -->
                      <div
                        class="px-2 py-1 rounded-[8px] text-[11px] font-bold shrink-0"
                        [class.bg-[#ffedd5]]="tx.type === 'gave'"
                        [class.text-[#c2410c]]="tx.type === 'gave'"
                        [class.bg-[#dcfce7]]="tx.type === 'received'"
                        [class.text-[#15803d]]="tx.type === 'received'"
                      >
                        {{ formatTxTime(tx.date) }}
                      </div>

                      <div class="min-w-0">
                        <h5 class="text-xs font-bold text-slate-900 truncate">
                          {{ getCustomerName(tx.customerId) }}
                        </h5>
                        <p class="text-[10px] text-slate-400 truncate">
                          {{ tx.note || (tx.type === 'gave' ? 'Udhar / Diye' : 'Jama / Payment') }}
                        </p>
                      </div>
                    </div>

                    <!-- Amount Badge -->
                    <div class="text-right shrink-0">
                      <span
                        class="text-xs font-black block"
                        [class.text-rose-600]="tx.type === 'gave'"
                        [class.text-emerald-600]="tx.type === 'received'"
                      >
                        {{ tx.type === 'gave' ? '-' : '+' }}₹{{ tx.amount.toLocaleString('en-IN') }}
                      </span>
                      <span class="text-[9px] text-slate-400">
                        {{ tx.type === 'gave' ? 'Udhar Diya' : 'Jama Hua' }}
                      </span>
                    </div>

                  </div>
                }
              </div>
            } @else if (activeDate()) {
              <div class="py-4 text-center text-slate-400 text-xs">
                <mat-icon class="text-base! w-4! h-4! text-slate-300 mb-0.5">event_busy</mat-icon>
                <p class="font-medium text-[11px]">Is tarikh ko koi bhi len-den darj nahi hai.</p>
              </div>
            } @else {
              <div class="py-4 text-center text-slate-400 text-xs">
                <mat-icon class="text-base! w-4! h-4! text-slate-300 mb-0.5">touch_app</mat-icon>
                <p class="font-medium text-[11px]">Upar calendar se koi tarikh tap karke hisab dekhein.</p>
              </div>
            }

          </div>

        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            (click)="applyAllDates()"
            class="px-3.5 py-2 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all active:scale-95"
            id="cal-apply-all-btn"
          >
            Sabhi Tarikh (Reset)
          </button>

          <button
            type="button"
            (click)="applySelectedDate()"
            [disabled]="!activeDate()"
            class="px-4 py-2 rounded-[14px] bg-[#007aff] hover:bg-[#0066d6] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
            id="cal-apply-date-btn"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">check</mat-icon>
            <span>Tarikh Filter Karein</span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .hero-gradient-mint-ss {
      background: linear-gradient(135deg, #a7f3d0 0%, #bbf7d0 50%, #dcfce7 100%);
    }
  `]
})
export class CalendarPickerModal {
  readonly ledger = inject(Ledger);
  readonly initialDate = input<string>('');
  readonly dateSelected = output<string>();
  readonly closeModal = output<void>();

  readonly weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly currentYear = signal<number>(new Date().getFullYear());
  readonly currentMonth = signal<number>(new Date().getMonth());
  readonly activeDate = signal<string>('');
  readonly typeFilter = signal<'all' | 'due' | 'advance'>('all');

  constructor() {
    const init = this.initialDate();
    if (init && init.length === 10) {
      this.activeDate.set(init);
      const [y, m] = init.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        this.currentYear.set(y);
        this.currentMonth.set(m - 1);
      }
    } else {
      // Default active date to today's date formatted
      const todayStr = this.getTodayDateStr();
      this.activeDate.set(todayStr);
    }
  }

  readonly monthName = computed(() => {
    return this.monthNames[this.currentMonth()];
  });

  getTodayDateStr(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  prevMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
  }

  goToToday(): void {
    const now = new Date();
    this.currentYear.set(now.getFullYear());
    this.currentMonth.set(now.getMonth());
    this.activeDate.set(this.getTodayDateStr());
  }

  onSelectDay(dateStr: string): void {
    this.activeDate.set(dateStr);
  }

  clearFilter(): void {
    this.activeDate.set('');
  }

  applyAllDates(): void {
    this.dateSelected.emit('');
    this.closeModal.emit();
  }

  applySelectedDate(): void {
    this.dateSelected.emit(this.activeDate());
    this.closeModal.emit();
  }

  // Generate calendar days for current month view
  readonly calendarDays = computed<CalendarDay[]>(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const todayStr = this.getTodayDateStr();
    const selected = this.activeDate();
    const filter = this.typeFilter();

    // Map transactions by YYYY-MM-DD
    const txMap = new Map<string, Transaction[]>();
    for (const tx of this.ledger.transactions()) {
      const dateOnly = (tx.date || tx.createdAt || '').slice(0, 10);
      if (dateOnly) {
        const arr = txMap.get(dateOnly) || [];
        arr.push(tx);
        txMap.set(dateOnly, arr);
      }
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday-based week index (0 = Mo, 6 = Su)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: CalendarDay[] = [];

    // 1. Previous month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      days.push(this.buildCalendarDay(dNum, dateStr, false, todayStr, selected, txMap, filter));
    }

    // 2. Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(this.buildCalendarDay(d, dateStr, true, todayStr, selected, txMap, filter));
    }

    // 3. Next month leading days to complete grid (multiples of 7)
    let nextDayNum = 1;
    while (days.length % 7 !== 0 || days.length < 35) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(nextDayNum).padStart(2, '0')}`;
      days.push(this.buildCalendarDay(nextDayNum, dateStr, false, todayStr, selected, txMap, filter));
      nextDayNum++;
    }

    return days;
  });

  private buildCalendarDay(
    dayNumber: number,
    dateStr: string,
    isCurrentMonth: boolean,
    todayStr: string,
    selected: string,
    txMap: Map<string, Transaction[]>,
    filter: 'all' | 'due' | 'advance'
  ): CalendarDay {
    let dayTxs = txMap.get(dateStr) || [];
    if (filter === 'due') {
      dayTxs = dayTxs.filter((t) => t.type === 'gave');
    } else if (filter === 'advance') {
      dayTxs = dayTxs.filter((t) => t.type === 'received');
    }

    let gaveSum = 0;
    let recSum = 0;
    for (const t of dayTxs) {
      if (t.type === 'gave') gaveSum += t.amount;
      if (t.type === 'received') recSum += t.amount;
    }

    return {
      dayNumber,
      dateStr,
      isCurrentMonth,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selected,
      txCount: dayTxs.length,
      totalGave: gaveSum,
      totalReceived: recSum,
      hasGave: gaveSum > 0,
      hasReceived: recSum > 0
    };
  }

  // Month overview stats
  readonly monthTxCount = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return this.ledger.transactions().filter((t) => (t.date || '').startsWith(prefix)).length;
  });

  readonly monthTotalVolume = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return this.ledger
      .transactions()
      .filter((t) => (t.date || '').startsWith(prefix))
      .reduce((acc, t) => acc + (t.amount || 0), 0);
  });

  // Transactions on active day
  readonly activeDayTransactions = computed<Transaction[]>(() => {
    const dateVal = this.activeDate();
    if (!dateVal) return [];
    return this.ledger
      .transactions()
      .filter((t) => (t.date && t.date.slice(0, 10) === dateVal) || (t.createdAt && t.createdAt.slice(0, 10) === dateVal));
  });

  getCustomerName(customerId: string): string {
    const c = this.ledger.customers().find((cust) => cust.id === customerId);
    return c ? c.name : 'Grahak';
  }

  formatTxTime(dateStr: string): string {
    if (!dateStr) return '00:00';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '12:00';
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '12:00';
    }
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
}
