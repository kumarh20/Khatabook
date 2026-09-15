import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { Transaction, TransactionWithBalance, TransactionType } from '../models/ledger.models';
import { I18nService } from '../services/i18n';

@Component({
  selector: 'app-customer-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (customer(); as cust) {
      <div class="space-y-3 sm:space-y-4 pb-28 animate-in fade-in duration-200">
        
        <!-- Top Customer Name Card (Clean, spacious, full name visible) -->
        <div class="ios-card p-3.5 sm:p-4 flex items-start gap-3">
          <button
            type="button"
            (click)="backToList.emit()"
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 cursor-pointer transition-colors active:scale-95 mt-0.5"
            [title]="i18n.t().backToList"
            id="detail-back-btn"
          >
            <mat-icon class="text-sm! w-4! h-4!">arrow_back_ios_new</mat-icon>
          </button>

          <div class="min-w-0 flex-1">
            <h2 class="text-base sm:text-lg font-bold text-slate-800 leading-snug tracking-tight break-words">
              {{ cust.name }}
            </h2>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1 font-medium">
              @if (cust.phone) {
                <span class="font-semibold text-slate-700">+91 {{ cust.phone }}</span>
              }
              @if (cust.phone && cust.address) {
                <span class="text-slate-300">•</span>
              }
              @if (cust.address) {
                <span class="text-slate-600">{{ cust.address }}</span>
              }
            </div>
          </div>
        </div>

        <!-- Action Icons Row (Outside Name Card, Icons Only) -->
        <div class="flex items-center justify-end gap-2.5 px-1 relative">
          
          <!-- 1. Dedicated Call Icon Button -->
          @if (cust.phone) {
            <a
              [href]="'tel:' + cust.phone"
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
              [title]="i18n.currentLanguage() === 'hi' ? 'कॉल करें' : 'Call Customer'"
              id="detail-call-btn"
            >
              <mat-icon class="text-lg! w-5! h-5! text-emerald-600">call</mat-icon>
            </a>
          }

          <!-- 2. WhatsApp Reminder Icon Button -->
          @if (cust.phone) {
            <a
              [href]="ledger.getWhatsAppShareUrl(cust, summary()?.netBalance || 0)"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#eafaf1] hover:bg-[#dcfce7] text-[#15803d] border border-[#86efac]/70 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
              [title]="i18n.t().sendWaReminderBtn"
              id="detail-wa-reminder-btn"
            >
              <mat-icon class="text-lg! w-5! h-5! text-[#10b981]">chat</mat-icon>
            </a>
          }

          <!-- 3. PDF Statement Report Icon Button -->
          <button
            type="button"
            (click)="onMenuStatement()"
            class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
            [title]="i18n.t().pdfReport"
            id="detail-statement-btn"
          >
            <mat-icon class="text-lg! w-5! h-5! text-sky-600">receipt_long</mat-icon>
          </button>

          <!-- 4. Vertical 3-Dot More Menu Icon Button -->
          <div class="relative shrink-0">
            <button
              type="button"
              (click)="isMenuOpen.set(!isMenuOpen())"
              class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 border border-slate-200/80 shadow-2xs"
              [class.bg-slate-200]="isMenuOpen()"
              title="More options"
              id="detail-more-menu-btn"
            >
              <mat-icon class="text-xl! w-5.5! h-5.5!">more_vert</mat-icon>
            </button>

            <!-- Dropdown Menu Popup -->
            @if (isMenuOpen()) {
              <!-- Backdrop to dismiss -->
              <button
                type="button"
                aria-label="Close menu"
                (click)="isMenuOpen.set(false)"
                class="fixed inset-0 z-40 bg-transparent w-full h-full border-0 p-0 m-0 cursor-default"
              ></button>

              <div
                class="absolute right-0 top-12 z-50 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top-right overflow-hidden"
                id="detail-dropdown-menu"
              >
                <!-- Option 1: Edit Customer Details -->
                <button
                  type="button"
                  (click)="onMenuEdit()"
                  class="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                  id="menu-opt-edit"
                >
                  <mat-icon class="text-base! w-4.5! h-4.5! text-slate-500">edit</mat-icon>
                  <span>{{ i18n.currentLanguage() === 'hi' ? 'ग्राहक जानकारी बदलें' : 'Edit Customer Info' }}</span>
                </button>

                <div class="my-1 border-t border-slate-100"></div>

                <!-- Option 2: Delete Customer Account -->
                <button
                  type="button"
                  (click)="onMenuDelete()"
                  class="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                  id="menu-opt-delete"
                >
                  <mat-icon class="text-base! w-4.5! h-4.5! text-rose-500">delete_outline</mat-icon>
                  <span>{{ i18n.currentLanguage() === 'hi' ? 'ग्राहक खाता हटाएं' : 'Delete Customer' }}</span>
                </button>
              </div>
            }
          </div>

        </div>

        <!-- Net Balance Hero Banner (Eye-safe Crimson & Soft Emerald palette) -->
        <div
          class="rounded-2xl p-5 sm:p-6 transition-all border shadow-2xs"
          [class.bg-linear-to-br]="true"
          [class.from-rose-50/50]="summary()?.status === 'due'"
          [class.via-white]="true"
          [class.to-rose-50/30]="summary()?.status === 'due'"
          [class.border-rose-200/70]="summary()?.status === 'due'"
          [class.from-emerald-50/50]="summary()?.status === 'advance'"
          [class.to-emerald-50/30]="summary()?.status === 'advance'"
          [class.border-emerald-200/70]="summary()?.status === 'advance'"
          [class.from-slate-50]="summary()?.status === 'settled'"
          [class.to-slate-100]="summary()?.status === 'settled'"
          [class.border-slate-200]="summary()?.status === 'settled'"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div>
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-2xs border"
                [class.bg-rose-50]="summary()?.status === 'due'"
                [class.text-rose-700]="summary()?.status === 'due'"
                [class.border-rose-200/70]="summary()?.status === 'due'"
                [class.bg-emerald-50]="summary()?.status === 'advance'"
                [class.text-emerald-700]="summary()?.status === 'advance'"
                [class.border-emerald-200/70]="summary()?.status === 'advance'"
                [class.bg-slate-100]="summary()?.status === 'settled'"
                [class.text-slate-700]="summary()?.status === 'settled'"
                [class.border-slate-200]="summary()?.status === 'settled'"
              >
                @if (summary()?.status === 'due') {
                  <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>{{ i18n.t().youWillGet }}</span>
                } @else if (summary()?.status === 'advance') {
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{{ i18n.t().youWillGive }}</span>
                } @else {
                  <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span>{{ i18n.t().filterSettled }}</span>
                }
              </span>

              <div
                class="text-3xl sm:text-4xl font-black tracking-tight"
                [class.text-rose-600]="summary()?.status === 'due'"
                [class.text-emerald-600]="summary()?.status === 'advance'"
                [class.text-slate-800]="summary()?.status === 'settled'"
              >
                ₹{{ formatAmount(summary()?.netBalance || 0) }}
              </div>
            </div>

            <!-- Breakdown totals in clean elevated card -->
            <div class="flex items-center gap-4 sm:gap-6 bg-slate-50/90 rounded-xl px-4 py-2.5 border border-slate-200/80 shadow-2xs self-start sm:self-auto">
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">{{ i18n.t().totalGaveAllTimeLabel }}</span>
                <span class="font-black text-rose-600 text-xs sm:text-sm">
                  ₹{{ (summary()?.totalGave || 0).toLocaleString('en-IN') }}
                </span>
              </div>
              <div class="w-px h-6 bg-slate-200"></div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">{{ i18n.t().totalReceivedAllTimeLabel }}</span>
                <span class="font-black text-emerald-600 text-xs sm:text-sm">
                  ₹{{ (summary()?.totalReceived || 0).toLocaleString('en-IN') }}
                </span>
              </div>
            </div>

          </div>
        </div>

        <!-- Filter Sub-tabs for Transactions -->
        <div class="flex items-center justify-between gap-2 pt-1">
          <div class="ios-segmented-control flex items-center">
            <button
              type="button"
              (click)="txFilter.set('all')"
              class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer whitespace-nowrap"
              [class.ios-segmented-btn-active]="txFilter() === 'all'"
              [class.text-slate-500]="txFilter() !== 'all'"
              id="tx-filter-all"
            >
              {{ i18n.t().filterAll }} ({{ ledger.activeCustomerLedger().length }})
            </button>
            <button
              type="button"
              (click)="txFilter.set('gave')"
              class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              [class.ios-segmented-btn-active]="txFilter() === 'gave'"
              [class.text-rose-600]="txFilter() !== 'gave'"
              id="tx-filter-gave"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>{{ i18n.t().iGaveFilter }}</span>
            </button>
            <button
              type="button"
              (click)="txFilter.set('received')"
              class="px-3.5 py-1.5 ios-segmented-btn cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              [class.ios-segmented-btn-active]="txFilter() === 'received'"
              [class.text-emerald-600]="txFilter() !== 'received'"
              id="tx-filter-received"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{{ i18n.t().iGotFilter }}</span>
            </button>
          </div>

          <span class="text-[11px] text-[#8e8e93] font-bold tracking-wider uppercase hidden sm:inline">
            {{ i18n.t().lenDenHistory }}
          </span>
        </div>

        <!-- Ledger Entries Table / List -->
        <div class="space-y-2">
          @if (filteredTransactions().length === 0) {
            <div class="p-8 text-center ios-card">
              <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 text-[#8e8e93] flex items-center justify-center mb-2">
                <mat-icon class="text-xl! w-5! h-5!">receipt</mat-icon>
              </div>
              <h4 class="text-xs sm:text-sm font-bold text-[#1c1c1e]">{{ i18n.t().noTransactionsYet }}</h4>
              <p class="text-[11px] text-[#8e8e93] mt-1 max-w-xs mx-auto">
                {{ i18n.t().noTransactionsPrompt }}
              </p>
            </div>
          } @else {
            @for (tx of filteredTransactions(); track tx.id) {
              <div class="ios-card p-3 sm:p-3.5 flex items-center justify-between gap-3 group" [id]="'tx-row-' + tx.id">
                
                <!-- Left: Date, Type Tag & Note -->
                <div class="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                    [class.bg-rose-50]="tx.type === 'gave'"
                    [class.text-rose-600]="tx.type === 'gave'"
                    [class.border]="true"
                    [class.border-rose-100]="tx.type === 'gave'"
                    [class.bg-emerald-50]="tx.type === 'received'"
                    [class.text-emerald-600]="tx.type === 'received'"
                    [class.border-emerald-100]="tx.type === 'received'"
                  >
                    <mat-icon class="text-base! w-4! h-4!">
                      {{ tx.type === 'gave' ? 'arrow_upward' : 'arrow_downward' }}
                    </mat-icon>
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <span class="text-xs text-[#8e8e93] font-medium">
                        {{ formatTxDate(tx.date) }}
                      </span>
                    </div>

                    @if (tx.note) {
                      <p class="text-xs sm:text-sm text-[#1c1c1e] font-bold truncate">
                        {{ tx.note }}
                      </p>
                    } @else {
                      <p class="text-xs text-[#8e8e93] italic">
                        {{ tx.type === 'gave' ? i18n.t().udharDiya : i18n.t().jamaHua }}
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
                    <div class="text-[10px] text-[#8e8e93] font-semibold">
                      {{ i18n.t().balanceLabel }}: ₹{{ formatAmount(tx.runningBalance) }}
                    </div>
                  </div>

                  <!-- Action Buttons on Transaction -->
                  <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      (click)="editTx.emit(tx)"
                      class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#8e8e93] hover:text-[#1c1c1e] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                      title="Edit transaction"
                      [id]="'edit-tx-' + tx.id"
                    >
                      <mat-icon class="text-xs! w-3.5! h-3.5!">edit</mat-icon>
                    </button>
                    <button
                      type="button"
                      (click)="deleteTx(tx.id)"
                      class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
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

        <!-- Sticky Bottom Floating Action Dock -->
        <div class="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-6 z-30 pointer-events-none">
          <div class="max-w-md mx-auto bg-white/90 backdrop-blur-xl rounded-2xl p-2 border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] pointer-events-auto grid grid-cols-2 gap-2.5">
            
            <!-- Red Button: MAINE DIYE ₹ -->
            <button
              type="button"
              (click)="openAddTx.emit('gave')"
              class="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-rose-600/25"
              id="btn-maine-diye"
            >
              <mat-icon class="text-sm! w-4! h-4!">remove_circle_outline</mat-icon>
              <span>{{ i18n.t().maineDiyeBtn }}</span>
            </button>

            <!-- Green Button: MAINE LIYE ₹ -->
            <button
              type="button"
              (click)="openAddTx.emit('received')"
              class="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-emerald-600/25"
              id="btn-maine-liye"
            >
              <mat-icon class="text-sm! w-4! h-4!">add_circle_outline</mat-icon>
              <span>{{ i18n.t().maineLiyeBtn }}</span>
            </button>

          </div>
        </div>

      </div>
    }
  `
})
export class CustomerDetail {
  readonly ledger = inject(Ledger);
  readonly i18n = inject(I18nService);

  readonly backToList = output<void>();
  readonly editCustomer = output<void>();
  readonly openStatement = output<void>();
  readonly openAddTx = output<TransactionType>();
  readonly editTx = output<Transaction>();

  readonly txFilter = signal<'all' | 'gave' | 'received'>('all');
  readonly isMenuOpen = signal<boolean>(false);

  readonly customer = computed(() => this.ledger.activeCustomer());
  readonly summary = computed(() => this.ledger.activeCustomerSummary());

  readonly filteredTransactions = computed<TransactionWithBalance[]>(() => {
    const list = this.ledger.activeCustomerLedger();
    const filter = this.txFilter();
    if (filter === 'all') return list;
    return list.filter((t) => t.type === filter);
  });

  onMenuStatement(): void {
    this.isMenuOpen.set(false);
    this.openStatement.emit();
  }

  onMenuEdit(): void {
    this.isMenuOpen.set(false);
    this.editCustomer.emit();
  }

  onMenuDelete(): void {
    this.isMenuOpen.set(false);
    this.confirmDeleteCustomer();
  }

  formatAmount(amount: number): string {
    return Math.abs(amount).toLocaleString('en-IN');
  }

  formatTxDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const locale = this.i18n.currentLanguage() === 'hi' ? 'hi-IN' : 'en-IN';
      return d.toLocaleDateString(locale, {
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
    if (confirm(this.i18n.t().deleteTxConfirm)) {
      this.ledger.deleteTransaction(id);
    }
  }

  confirmDeleteCustomer(): void {
    const cust = this.customer();
    if (!cust) return;
    const msg = this.i18n.currentLanguage() === 'hi'
      ? `क्या आप सच में "${cust.name}" और उनका पूरा हिसाब-किताब डिलीट करना चाहते हैं?`
      : `Are you sure you want to delete customer "${cust.name}" and their entire transaction history?`;
    if (confirm(msg)) {
      this.ledger.deleteCustomer(cust.id);
    }
  }
}
