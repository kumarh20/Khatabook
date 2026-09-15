import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { Transaction, TransactionType } from '../models/ledger.models';
import { I18nService } from '../services/i18n';

@Component({
  selector: 'app-transaction-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="ios-sheet-backdrop">
      <div class="ios-sheet-card p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Sheet Header -->
        <div class="pb-3 border-b border-black/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span
              class="w-3 h-3 rounded-full"
              [class.bg-[#ff3b30]]="form.get('type')?.value === 'gave'"
              [class.bg-[#34c759]]="form.get('type')?.value === 'received'"
            ></span>
            <h3 class="font-bold text-base sm:text-lg text-[#1c1c1e] tracking-tight">
              @if (editingTx()) {
                {{ i18n.t().editTxTitle }}
              } @else {
                @if (form.get('type')?.value === 'gave') {
                  {{ i18n.t().addGaveTxTitle }}
                } @else {
                  {{ i18n.t().addReceivedTxTitle }}
                }
              }
            </h3>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#8e8e93] hover:text-[#1c1c1e] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            id="close-tx-modal-btn"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">close</mat-icon>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="pt-4 space-y-4">
          
          <!-- Type Toggle (Maine Diye vs Maine Liye) in iOS Segmented Control -->
          <div class="ios-segmented-control grid grid-cols-2">
            <button
              type="button"
              (click)="setType('gave')"
              class="py-2.5 px-3 ios-segmented-btn cursor-pointer flex items-center justify-center gap-1.5"
              [class.ios-segmented-btn-active]="form.get('type')?.value === 'gave'"
              [class.text-rose-600]="form.get('type')?.value === 'gave'"
              [class.text-slate-500]="form.get('type')?.value !== 'gave'"
              id="tx-toggle-gave"
            >
              <mat-icon class="text-sm! w-4! h-4!">remove_circle</mat-icon>
              <span>{{ i18n.t().maineDiyeBtn }} (-)</span>
            </button>

            <button
              type="button"
              (click)="setType('received')"
              class="py-2.5 px-3 ios-segmented-btn cursor-pointer flex items-center justify-center gap-1.5"
              [class.ios-segmented-btn-active]="form.get('type')?.value === 'received'"
              [class.text-emerald-600]="form.get('type')?.value === 'received'"
              [class.text-slate-500]="form.get('type')?.value !== 'received'"
              id="tx-toggle-received"
            >
              <mat-icon class="text-sm! w-4! h-4!">add_circle</mat-icon>
              <span>{{ i18n.t().maineLiyeBtn }} (+)</span>
            </button>
          </div>

          <!-- Amount Input -->
          <div>
            <label for="tx-amount-input" class="block text-xs font-bold text-[#1c1c1e] mb-1.5">{{ i18n.t().amountLabel }} *</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-[#8e8e93]">₹</span>
              <input
                type="number"
                formControlName="amount"
                class="w-full pl-11 pr-4 py-3 bg-black/[0.04] border border-black/[0.06] rounded-[16px] text-2xl font-black text-[#1c1c1e] outline-hidden tracking-tight focus:bg-white focus:ring-2 focus:ring-[#007aff]/30 transition-all"
                placeholder="0"
                min="1"
                step="any"
                id="tx-amount-input"
              />
            </div>

            <!-- Quick Amount Chips -->
            <div class="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                (click)="addQuickAmount(100)"
                class="px-3 py-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-xs font-semibold text-[#1c1c1e] cursor-pointer transition-all active:scale-95"
              >
                +₹100
              </button>
              <button
                type="button"
                (click)="addQuickAmount(500)"
                class="px-3 py-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-xs font-semibold text-[#1c1c1e] cursor-pointer transition-all active:scale-95"
              >
                +₹500
              </button>
              <button
                type="button"
                (click)="addQuickAmount(1000)"
                class="px-3 py-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-xs font-semibold text-[#1c1c1e] cursor-pointer transition-all active:scale-95"
              >
                +₹1,000
              </button>
              <button
                type="button"
                (click)="addQuickAmount(2000)"
                class="px-3 py-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-xs font-semibold text-[#1c1c1e] cursor-pointer transition-all active:scale-95"
              >
                +₹2,000
              </button>
              <button
                type="button"
                (click)="addQuickAmount(5000)"
                class="px-3 py-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-xs font-semibold text-[#1c1c1e] cursor-pointer transition-all active:scale-95"
              >
                +₹5,000
              </button>
            </div>
          </div>

          <!-- Note / Description Input -->
          <div>
            <label for="tx-note-input" class="block text-xs font-bold text-[#1c1c1e] mb-1.5">{{ i18n.t().noteLabel }}</label>
            <input
              type="text"
              formControlName="note"
              class="w-full px-3.5 py-2.5 bg-black/[0.04] border border-black/[0.06] rounded-[16px] text-xs sm:text-sm text-[#1c1c1e] outline-hidden focus:bg-white focus:ring-2 focus:ring-[#007aff]/30 transition-all placeholder-[#8e8e93]"
              [placeholder]="i18n.t().notePlaceholder"
              id="tx-note-input"
            />
          </div>

          <!-- Date Input -->
          <div>
            <label for="tx-date-input" class="block text-xs font-bold text-[#1c1c1e] mb-1.5">{{ i18n.t().dateLabel }}</label>
            <input
              type="date"
              formControlName="date"
              class="w-full px-3.5 py-2.5 bg-black/[0.04] border border-black/[0.06] rounded-[16px] text-xs sm:text-sm text-[#1c1c1e] outline-hidden focus:bg-white focus:ring-2 focus:ring-[#007aff]/30 transition-all"
              id="tx-date-input"
            />
          </div>

          <!-- Form Actions -->
          <div class="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="ios-btn-secondary px-4 py-2 text-xs sm:text-sm cursor-pointer"
              id="cancel-tx-btn"
            >
              {{ i18n.t().cancel }}
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="px-6 py-2.5 rounded-[16px] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
              [class.bg-[#ff3b30]]="form.get('type')?.value === 'gave'"
              [class.hover:bg-[#e0342a]]="form.get('type')?.value === 'gave'"
              [class.bg-[#34c759]]="form.get('type')?.value === 'received'"
              [class.hover:bg-[#2eb14e]]="form.get('type')?.value === 'received'"
              id="save-tx-btn"
            >
              {{ editingTx() ? i18n.t().updateEntryBtn : i18n.t().saveEntryBtn }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `
})
export class TransactionModal implements OnInit {
  readonly ledger = inject(Ledger);
  readonly i18n = inject(I18nService);

  readonly initialType = input<TransactionType>('gave');
  readonly editingTx = input<Transaction | null>(null);
  readonly closeModal = output<void>();

  readonly form = new FormGroup({
    type: new FormControl<TransactionType>('gave', { nonNullable: true }),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    note: new FormControl<string>(''),
    date: new FormControl<string>(new Date().toISOString().split('T')[0], { nonNullable: true })
  });

  ngOnInit(): void {
    const tx = this.editingTx();
    if (tx) {
      this.form.patchValue({
        type: tx.type,
        amount: tx.amount,
        note: tx.note || '',
        date: tx.date ? tx.date.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      this.form.patchValue({
        type: this.initialType(),
        date: new Date().toISOString().split('T')[0]
      });
    }
  }

  setType(type: TransactionType): void {
    this.form.patchValue({ type });
  }

  addQuickAmount(delta: number): void {
    const current = Number(this.form.get('amount')?.value || 0);
    this.form.patchValue({ amount: current + delta });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { type, amount, note, date } = this.form.getRawValue();
    if (!amount || amount <= 0) return;

    const customerId = this.ledger.activeCustomerId();
    if (!customerId) return;

    const cleanNote = note?.trim() || undefined;

    const tx = this.editingTx();
    if (tx) {
      this.ledger.updateTransaction(tx.id, {
        type,
        amount,
        note: cleanNote,
        date: new Date(date).toISOString()
      });
    } else {
      this.ledger.addTransaction(customerId, type, amount, cleanNote, new Date(date).toISOString());
    }

    this.closeModal.emit();
  }
}
