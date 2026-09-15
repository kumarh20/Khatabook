import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { Transaction, TransactionWithBalance, TransactionType } from '../models/ledger.models';

@Component({
  selector: 'app-customer-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (customer(); as cust) {
      <div class="space-y-4 pb-24">
        
        <!-- Top Navigation Header -->
        <div class="flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
          
          <!-- Back button & Customer Name -->
          <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              (click)="backToList.emit()"
              class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              title="Grahak list par wapas jayein"
              id="detail-back-btn"
            >
              <mat-icon class="text-sm! w-4! h-4!">arrow_back</mat-icon>
            </button>

            <div class="min-w-0">
              <h2 class="text-base sm:text-lg font-black text-slate-900 truncate leading-tight tracking-tight">
                {{ cust.name }}
              </h2>
              <div class="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                @if (cust.phone) {
                  <a [href]="'tel:' + cust.phone" class="hover:text-blue-600 flex items-center gap-1 font-semibold">
                    <mat-icon class="text-xs! w-3.5! h-3.5!">call</mat-icon>
                    <span>{{ cust.phone }}</span>
                  </a>
                }
                @if (cust.address) {
                  <span>•</span>
                  <span class="truncate max-w-[120px] sm:max-w-xs">{{ cust.address }}</span>
                }
              </div>
            </div>
          </div>

          <!-- Customer Actions Menu -->
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <!-- WhatsApp reminder button -->
            @if (summary()?.status === 'due' && cust.phone) {
              <a
                [href]="ledger.getWhatsAppShareUrl(cust, summary()?.netBalance || 0)"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-emerald-200/80 transition-colors shadow-2xs"
                title="Send WhatsApp Reminder"
                id="detail-wa-reminder-btn"
              >
                <mat-icon class="text-xs! w-3.5! h-3.5!">chat</mat-icon>
                <span class="hidden sm:inline">WhatsApp</span>
              </a>
            }

            <!-- Statement / Print Button -->
            <button
              type="button"
              (click)="openStatement.emit()"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
              title="Statement / Print Bahi Khata"
              id="detail-statement-btn"
            >
              <mat-icon class="text-xs! w-3.5! h-3.5!">receipt_long</mat-icon>
            </button>

            <!-- Edit customer button -->
            <button
              type="button"
              (click)="editCustomer.emit()"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
              title="Edit Customer"
              id="detail-edit-customer-btn"
            >
              <mat-icon class="text-xs! w-3.5! h-3.5!">edit</mat-icon>
            </button>

            <!-- Delete customer button -->
            <button
              type="button"
              (click)="confirmDeleteCustomer()"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer transition-colors"
              title="Delete Customer"
              id="detail-delete-customer-btn"
            >
              <mat-icon class="text-xs! w-3.5! h-3.5!">delete_outline</mat-icon>
            </button>
          </div>

        </div>

        <!-- Net Balance Hero Banner (Pastel Gradient Card matching Screenshot 2/3) -->
        <div
          class="rounded-[28px] p-5 sm:p-6 transition-all"
          [class.hero-gradient-rose]="summary()?.status === 'due'"
          [class.hero-gradient-mint]="summary()?.status === 'advance'"
          [class.hero-gradient-blue]="summary()?.status === 'settled'"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div>
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs text-[11px] font-extrabold uppercase tracking-wider mb-2.5 shadow-2xs"
                [class.text-rose-800]="summary()?.status === 'due'"
                [class.text-emerald-800]="summary()?.status === 'advance'"
                [class.text-blue-800]="summary()?.status === 'settled'"
              >
                @if (summary()?.status === 'due') {
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  <span>Aapko Lena Hai (Total Due)</span>
                } @else if (summary()?.status === 'advance') {
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Aapko Dena Hai (Advance)</span>
                } @else {
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>Hisab Barabar (Settled)</span>
                }
              </span>

              <div
                class="text-3xl sm:text-4xl font-black tracking-tight"
                [class.text-rose-700]="summary()?.status === 'due'"
                [class.text-emerald-800]="summary()?.status === 'advance'"
                [class.text-slate-900]="summary()?.status === 'settled'"
              >
                ₹{{ formatAmount(summary()?.netBalance || 0) }}
              </div>
            </div>

            <!-- Breakdown totals in clean white rounded card -->
            <div class="flex items-center gap-4 sm:gap-6 bg-white/90 backdrop-blur-xs rounded-2xl px-4 py-2.5 border border-white shadow-2xs self-start sm:self-auto">
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Kul Diya</span>
                <span class="font-black text-rose-600 text-xs sm:text-sm">
                  ₹{{ (summary()?.totalGave || 0).toLocaleString('en-IN') }}
                </span>
              </div>
              <div class="w-px h-6 bg-slate-200"></div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Kul Liya</span>
                <span class="font-black text-emerald-600 text-xs sm:text-sm">
                  ₹{{ (summary()?.totalReceived || 0).toLocaleString('en-IN') }}
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- Filter Sub-tabs for Transactions -->
        <div class="flex items-center justify-between gap-2 pt-1">
          <div class="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              (click)="txFilter.set('all')"
              class="px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer shadow-2xs"
              [class.bg-slate-900]="txFilter() === 'all'"
              [class.text-white]="txFilter() === 'all'"
              [class.bg-white]="txFilter() !== 'all'"
              [class.text-slate-600]="txFilter() !== 'all'"
              [class.border]="txFilter() !== 'all'"
              [class.border-slate-200]="txFilter() !== 'all'"
              id="tx-filter-all"
            >
              Sabhi ({{ ledger.activeCustomerLedger().length }})
            </button>
            <button
              type="button"
              (click)="txFilter.set('gave')"
              class="px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              [class.bg-rose-600]="txFilter() === 'gave'"
              [class.text-white]="txFilter() === 'gave'"
              [class.bg-white]="txFilter() !== 'gave'"
              [class.text-rose-700]="txFilter() !== 'gave'"
              [class.border]="txFilter() !== 'gave'"
              [class.border-rose-200]="txFilter() !== 'gave'"
              id="tx-filter-gave"
            >
              <span>Maine Diye</span>
            </button>
            <button
              type="button"
              (click)="txFilter.set('received')"
              class="px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              [class.bg-emerald-600]="txFilter() === 'received'"
              [class.text-white]="txFilter() === 'received'"
              [class.bg-white]="txFilter() !== 'received'"
              [class.text-emerald-700]="txFilter() !== 'received'"
              [class.border]="txFilter() !== 'received'"
              [class.border-emerald-200]="txFilter() !== 'received'"
              id="tx-filter-received"
            >
              <span>Maine Liye</span>
            </button>
          </div>

          <span class="text-[11px] text-slate-400 font-bold tracking-wider uppercase hidden sm:inline">
            Len-Den History
          </span>
        </div>

        <!-- Ledger Entries Table / List -->
        <div class="space-y-2.5">
          @if (filteredTransactions().length === 0) {
            <div class="p-8 text-center app-card">
              <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                <mat-icon class="text-xl! w-5! h-5!">receipt</mat-icon>
              </div>
              <h4 class="text-xs sm:text-sm font-bold text-slate-700">Koi len-den record nahi hai</h4>
              <p class="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Niche diye gaye buttons se "Maine Diye" ya "Maine Liye" record karein.
              </p>
            </div>
          } @else {
            @for (tx of filteredTransactions(); track tx.id) {
              <div class="app-card p-3.5 sm:p-4 flex items-center justify-between gap-3 group" [id]="'tx-row-' + tx.id">
                
                <!-- Left: Date, Type Tag & Note -->
                <div class="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0"
                    [class.badge-pill-rose]="tx.type === 'gave'"
                    [class.badge-pill-mint]="tx.type === 'received'"
                  >
                    {{ tx.type === 'gave' ? 'Diye' : 'Liye' }}
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <span class="text-xs text-slate-500 font-medium">
                        {{ formatTxDate(tx.date) }}
                      </span>
                    </div>

                    @if (tx.note) {
                      <p class="text-xs sm:text-sm text-slate-800 font-bold truncate">
                        {{ tx.note }}
                      </p>
                    } @else {
                      <p class="text-xs text-slate-400 italic">
                        Koi note nahi
                      </p>
                    }
                  </div>
                </div>

                <!-- Right: Amount, Running Balance & Actions -->
                <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div class="text-right">
                    <div
                      class="text-sm sm:text-base font-black tracking-tight"
                      [class.text-rose-600]="tx.type === 'gave'"
                      [class.text-emerald-600]="tx.type === 'received'"
                    >
                      {{ tx.type === 'gave' ? '-' : '+' }} ₹{{ tx.amount.toLocaleString('en-IN') }}
                    </div>
                    <div class="text-[10px] text-slate-400 font-semibold">
                      Baaki: ₹{{ formatAmount(tx.runningBalance) }}
                    </div>
                  </div>

                  <!-- Action Buttons on Transaction -->
                  <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      (click)="editTx.emit(tx)"
                      class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                      title="Edit transaction"
                      [id]="'edit-tx-' + tx.id"
                    >
                      <mat-icon class="text-xs! w-3.5! h-3.5!">edit</mat-icon>
                    </button>
                    <button
                      type="button"
                      (click)="deleteTx(tx.id)"
                      class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 flex items-center justify-center cursor-pointer transition-colors"
                      title="Delete transaction"
                      [id]="'delete-tx-' + tx.id"
                    >
                      <mat-icon class="text-xs! w-3.5! h-3.5!">delete</mat-icon>
                    </button>
                  </div>

                </div>

              </div>
            }
          }
        </div>

        <!-- Sticky Bottom Floating Action Dock (Matching Clean Rounded Pill in Screenshot) -->
        <div class="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-6 z-30 pointer-events-none">
          <div class="max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-full p-2 border border-slate-200/80 shadow-lg pointer-events-auto grid grid-cols-2 gap-2.5">
            
            <!-- Red Button: MAINE DIYE ₹ -->
            <button
              type="button"
              (click)="openAddTx.emit('gave')"
              class="flex items-center justify-center gap-1.5 py-3 px-3 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
              id="btn-maine-diye"
            >
              <mat-icon class="text-sm! w-4! h-4!">remove_circle_outline</mat-icon>
              <span>MAINE DIYE ₹</span>
            </button>

            <!-- Green Button: MAINE LIYE ₹ -->
            <button
              type="button"
              (click)="openAddTx.emit('received')"
              class="flex items-center justify-center gap-1.5 py-3 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
              id="btn-maine-liye"
            >
              <mat-icon class="text-sm! w-4! h-4!">add_circle_outline</mat-icon>
              <span>MAINE LIYE ₹</span>
            </button>

          </div>
        </div>

      </div>
    }
  `
})
export class CustomerDetail {
  readonly ledger = inject(Ledger);

  readonly backToList = output<void>();
  readonly editCustomer = output<void>();
  readonly openStatement = output<void>();
  readonly openAddTx = output<TransactionType>();
  readonly editTx = output<Transaction>();

  readonly txFilter = signal<'all' | 'gave' | 'received'>('all');

  readonly customer = computed(() => this.ledger.activeCustomer());
  readonly summary = computed(() => this.ledger.activeCustomerSummary());

  readonly filteredTransactions = computed<TransactionWithBalance[]>(() => {
    const list = this.ledger.activeCustomerLedger();
    const filter = this.txFilter();
    if (filter === 'all') return list;
    return list.filter((t) => t.type === filter);
  });

  formatAmount(amount: number): string {
    return Math.abs(amount).toLocaleString('en-IN');
  }

  formatTxDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  deleteTx(id: string): void {
    if (confirm('Kya aap is entry ko delete karna chahte hain?')) {
      this.ledger.deleteTransaction(id);
    }
  }

  confirmDeleteCustomer(): void {
    const cust = this.customer();
    if (!cust) return;
    if (confirm(`Kya aap sach me "${cust.name}" aur unka pura hisab-kitab delete karna chahte hain?`)) {
      this.ledger.deleteCustomer(cust.id);
    }
  }
}
