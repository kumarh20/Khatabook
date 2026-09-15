import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { Transaction, TransactionType } from '../models/ledger.models';

@Component({
  selector: 'app-transaction-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div class="bg-white w-full max-w-md rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Modal Header -->
        <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span
              class="w-3 h-3 rounded-full"
              [class.bg-rose-500]="form.get('type')?.value === 'gave'"
              [class.bg-emerald-500]="form.get('type')?.value === 'received'"
            ></span>
            <h3 class="font-black text-base sm:text-lg text-slate-900 tracking-tight">
              @if (editingTx()) {
                Entry Sudharein
              } @else {
                @if (form.get('type')?.value === 'gave') {
                  Maine Diye (Udhar Diya)
                } @else {
                  Maine Liye (Payment Jama)
                }
              }
            </h3>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            id="close-tx-modal-btn"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">close</mat-icon>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="pt-4 space-y-4">
          
          <!-- Type Toggle (Maine Diye vs Maine Liye) -->
          <div class="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-full">
            <button
              type="button"
              (click)="setType('gave')"
              class="py-2.5 px-3 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              [class.bg-rose-600]="form.get('type')?.value === 'gave'"
              [class.text-white]="form.get('type')?.value === 'gave'"
              [class.shadow-2xs]="form.get('type')?.value === 'gave'"
              [class.text-slate-600]="form.get('type')?.value !== 'gave'"
              id="tx-toggle-gave"
            >
              <mat-icon class="text-sm! w-4! h-4!">remove_circle</mat-icon>
              <span>Maine Diye (-)</span>
            </button>

            <button
              type="button"
              (click)="setType('received')"
              class="py-2.5 px-3 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              [class.bg-emerald-600]="form.get('type')?.value === 'received'"
              [class.text-white]="form.get('type')?.value === 'received'"
              [class.shadow-2xs]="form.get('type')?.value === 'received'"
              [class.text-slate-600]="form.get('type')?.value !== 'received'"
              id="tx-toggle-received"
            >
              <mat-icon class="text-sm! w-4! h-4!">add_circle</mat-icon>
              <span>Maine Liye (+)</span>
            </button>
          </div>

          <!-- Amount Input -->
          <div>
            <label for="tx-amount-input" class="block text-xs font-bold text-slate-700 mb-1.5">Rashi (Amount in ₹) *</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
              <input
                type="number"
                formControlName="amount"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-slate-900 outline-hidden tracking-tight focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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
                class="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
              >
                +₹100
              </button>
              <button
                type="button"
                (click)="addQuickAmount(500)"
                class="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
              >
                +₹500
              </button>
              <button
                type="button"
                (click)="addQuickAmount(1000)"
                class="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
              >
                +₹1,000
              </button>
              <button
                type="button"
                (click)="addQuickAmount(2000)"
                class="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
              >
                +₹2,000
              </button>
              <button
                type="button"
                (click)="addQuickAmount(5000)"
                class="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
              >
                +₹5,000
              </button>
            </div>
          </div>

          <!-- Note / Description Input -->
          <div>
            <label for="tx-note-input" class="block text-xs font-bold text-slate-700 mb-1.5">Vivaran / Bill Number (Optional)</label>
            <input
              type="text"
              formControlName="note"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-hidden focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"
              placeholder="Jaise: 5kg atta, rashan bill #41, cash..."
              id="tx-note-input"
            />
          </div>

          <!-- Date Input -->
          <div>
            <label for="tx-date-input" class="block text-xs font-bold text-slate-700 mb-1.5">Tareekh (Date)</label>
            <input
              type="date"
              formControlName="date"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-hidden focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              id="tx-date-input"
            />
          </div>

          <!-- Form Actions -->
          <div class="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="app-btn-secondary px-4 py-2 text-xs sm:text-sm cursor-pointer"
              id="cancel-tx-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="px-6 py-2.5 rounded-full text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              [class.bg-rose-600]="form.get('type')?.value === 'gave'"
              [class.hover:bg-rose-700]="form.get('type')?.value === 'gave'"
              [class.bg-emerald-600]="form.get('type')?.value === 'received'"
              [class.hover:bg-emerald-700]="form.get('type')?.value === 'received'"
              id="save-tx-btn"
            >
              {{ editingTx() ? 'Update Karein' : 'Save Karein' }}
            </button>
          </div>

        </form>

      </div>
    </div>
  `
})
export class TransactionModal implements OnInit {
  readonly ledger = inject(Ledger);

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
