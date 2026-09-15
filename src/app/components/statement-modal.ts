import { ChangeDetectionStrategy, Component, inject, output, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';

@Component({
  selector: 'app-statement-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="ios-sheet-backdrop">
      <div class="ios-sheet-card max-w-2xl p-4 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <!-- Modal Top Bar (Hidden on print) -->
        <div class="no-print pb-3.5 mb-2 border-b border-black/[0.06] flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-[14px] bg-[#007aff]/10 text-[#007aff] flex items-center justify-center">
              <mat-icon class="text-lg! w-5! h-5!">receipt_long</mat-icon>
            </div>
            <div>
              <h3 class="font-bold text-sm sm:text-base text-[#1c1c1e] tracking-tight leading-tight">Grahak Hisab Statement (Bahi Khata)</h3>
              <p class="text-[11px] text-[#8e8e93] font-medium">Print aur digital hisab copy</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="printStatement()"
              class="px-4 py-2 rounded-[14px] bg-[#34c759] hover:bg-[#2eb14e] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              id="print-statement-btn"
            >
              <mat-icon class="text-xs! w-3.5! h-3.5!">print</mat-icon>
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              (click)="closeModal.emit()"
              class="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#8e8e93] hover:text-[#1c1c1e] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
              id="close-statement-btn"
            >
              <mat-icon class="text-xs! w-3.5! h-3.5!">close</mat-icon>
            </button>
          </div>
        </div>

        <!-- Printable Statement Area -->
        <div id="printable-statement" class="p-6 sm:p-8 overflow-y-auto bg-white text-[#1c1c1e] text-xs">
          
          <!-- Statement Header -->
          <div class="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {{ ledger.businessName() }}
              </h1>
              <p class="text-xs text-slate-600 mt-0.5">Official Customer Account Statement</p>
              <p class="text-2xs text-slate-400 mt-1">Generated on: {{ todayDate }}</p>
            </div>
            <div class="text-right">
              <span class="inline-block px-2.5 py-1 rounded bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                BAHI KHATA
              </span>
            </div>
          </div>

          <!-- Customer Info Box -->
          @if (customer(); as cust) {
            <div class="bg-[#f2f2f7] rounded-[16px] p-4 mb-6 border border-black/[0.06] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span class="text-2xs uppercase text-[#8e8e93] font-bold block">Grahak (Customer)</span>
                <span class="text-base font-bold text-[#1c1c1e] block">{{ cust.name }}</span>
                @if (cust.phone) {
                  <span class="text-slate-600">Mobile: +91 {{ cust.phone }}</span>
                }
              </div>
              @if (cust.address) {
                <div>
                  <span class="text-2xs uppercase text-[#8e8e93] font-bold block">Pata (Address)</span>
                  <span class="text-slate-700">{{ cust.address }}</span>
                </div>
              }
              <div class="text-right">
                <span class="text-2xs uppercase font-bold block" [class.text-[#ff3b30]]="summary()?.status === 'due'" [class.text-[#34c759]]="summary()?.status === 'advance'">
                  Net Balance Status
                </span>
                <span
                  class="text-xl font-black"
                  [class.text-[#ff3b30]]="summary()?.status === 'due'"
                  [class.text-[#34c759]]="summary()?.status === 'advance'"
                >
                  ₹{{ formatAmount(summary()?.netBalance || 0) }}
                  <span class="text-xs font-semibold">
                    {{ summary()?.status === 'due' ? '(Lena Hai)' : summary()?.status === 'advance' ? '(Dena Hai)' : '(Settled)' }}
                  </span>
                </span>
              </div>
            </div>

            <!-- Ledger Table -->
            <table class="w-full border-collapse border border-slate-200 mb-6">
              <thead>
                <tr class="bg-slate-100 text-slate-700 text-left font-bold text-2xs uppercase tracking-wider">
                  <th class="p-2.5 border border-slate-200">Date</th>
                  <th class="p-2.5 border border-slate-200">Details / Note</th>
                  <th class="p-2.5 border border-slate-200 text-right">Diye (Udhar)</th>
                  <th class="p-2.5 border border-slate-200 text-right">Liye (Jama)</th>
                  <th class="p-2.5 border border-slate-200 text-right">Balance</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (tx of ledger.activeCustomerLedger(); track tx.id) {
                  <tr class="hover:bg-slate-50">
                    <td class="p-2.5 border border-slate-200 whitespace-nowrap text-slate-600">
                      {{ formatTxDate(tx.date) }}
                    </td>
                    <td class="p-2.5 border border-slate-200 text-[#1c1c1e]">
                      {{ tx.note || '-' }}
                    </td>
                    <td class="p-2.5 border border-slate-200 text-right font-semibold text-[#ff3b30]">
                      {{ tx.type === 'gave' ? '₹' + tx.amount.toLocaleString('en-IN') : '-' }}
                    </td>
                    <td class="p-2.5 border border-slate-200 text-right font-semibold text-[#34c759]">
                      {{ tx.type === 'received' ? '₹' + tx.amount.toLocaleString('en-IN') : '-' }}
                    </td>
                    <td class="p-2.5 border border-slate-200 text-right font-bold text-[#1c1c1e]">
                      ₹{{ formatAmount(tx.runningBalance) }}
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <td colspan="2" class="p-2.5 border border-slate-200 text-right uppercase text-slate-700">
                    Total
                  </td>
                  <td class="p-2.5 border border-slate-200 text-right text-[#ff3b30] font-bold">
                    ₹{{ (summary()?.totalGave || 0).toLocaleString('en-IN') }}
                  </td>
                  <td class="p-2.5 border border-slate-200 text-right text-[#34c759] font-bold">
                    ₹{{ (summary()?.totalReceived || 0).toLocaleString('en-IN') }}
                  </td>
                  <td class="p-2.5 border border-slate-200 text-right font-black text-[#1c1c1e]">
                    ₹{{ formatAmount(summary()?.netBalance || 0) }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Signatures / Notes Footer -->
            <div class="pt-8 border-t border-slate-200 flex justify-between items-end text-2xs text-slate-500">
              <div>
                <p class="font-medium text-slate-700">Niyam v Shartein (Terms):</p>
                <p>1. Kripya hisab check karke samay par payment karein.</p>
                <p>2. Kisi bhi vivaran me antar hone par dukan se turant sampark karein.</p>
              </div>
              <div class="text-center">
                <div class="w-32 border-b border-slate-400 mb-1"></div>
                <span class="font-bold text-slate-700">Dukandar Ke Hastakshar (Sign)</span>
              </div>
            </div>
          }

        </div>

      </div>
    </div>
  `
})
export class StatementModal {
  readonly ledger = inject(Ledger);
  readonly closeModal = output<void>();

  readonly customer = computed(() => this.ledger.activeCustomer());
  readonly summary = computed(() => this.ledger.activeCustomerSummary());

  readonly todayDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
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
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  printStatement(): void {
    window.print();
  }
}
