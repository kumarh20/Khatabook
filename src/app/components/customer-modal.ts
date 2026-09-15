import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { Customer } from '../models/ledger.models';

@Component({
  selector: 'app-customer-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div class="bg-white w-full max-w-md rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <mat-icon class="text-lg! w-5! h-5!">person_add</mat-icon>
            </div>
            <div>
              <h3 class="font-black text-base sm:text-lg text-slate-900 tracking-tight leading-tight">
                {{ editingCustomer() ? 'Grahak Ki Jankari Badlein' : 'Naya Grahak Jodein' }}
              </h3>
              <p class="text-[11px] text-slate-500 font-medium">Khata aur len-den record ke liye</p>
            </div>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            id="close-customer-modal-btn"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">close</mat-icon>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="pt-4 space-y-4">
          
          <!-- Name Input -->
          <div>
            <label for="customer-name-input" class="block text-xs font-bold text-slate-700 mb-1.5">Grahak Ka Naam (Customer Name) *</label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-hidden focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"
              placeholder="e.g. Ramesh Kumar, Sunita Devi..."
              id="customer-name-input"
            />
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="text-xs text-rose-600 mt-1 font-semibold">Kripya grahak ka naam dalein.</p>
            }
          </div>

          <!-- Phone Number Input -->
          <div>
            <label for="customer-phone-input" class="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number (Phone) *</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+91</span>
              <input
                type="tel"
                formControlName="phone"
                maxlength="10"
                class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-hidden focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400"
                placeholder="10-digit mobile number"
                id="customer-phone-input"
              />
            </div>
            <p class="text-[11px] text-slate-400 mt-1 font-medium">WhatsApp reminder aur call ke liye zaroori hai</p>
          </div>

          <!-- Address / Note Input -->
          <div>
            <label for="customer-address-input" class="block text-xs font-bold text-slate-700 mb-1.5">Pata ya Dukan (Address / Location / Note)</label>
            <textarea
              formControlName="address"
              rows="2"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 outline-hidden focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none placeholder-slate-400"
              placeholder="e.g. Shop #12 Main Market, Colony, etc."
              id="customer-address-input"
            ></textarea>
          </div>

          <!-- Modal Action Buttons -->
          <div class="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="app-btn-secondary px-4 py-2 text-xs sm:text-sm cursor-pointer"
              id="cancel-customer-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="app-btn-primary px-6 py-2.5 text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              id="save-customer-btn"
            >
              {{ editingCustomer() ? 'Update Karein' : 'Grahak Jodein' }}
            </button>
          </div>

        </form>

      </div>
    </div>
  `
})
export class CustomerModal implements OnInit {
  readonly ledger = inject(Ledger);

  readonly editingCustomer = input<Customer | null>(null);
  readonly closeModal = output<void>();

  readonly form = new FormGroup({
    name: new FormControl<string>('', [Validators.required, Validators.minLength(2)]),
    phone: new FormControl<string>('', [Validators.required, Validators.minLength(10)]),
    address: new FormControl<string>('')
  });

  ngOnInit(): void {
    const cust = this.editingCustomer();
    if (cust) {
      this.form.patchValue({
        name: cust.name,
        phone: cust.phone,
        address: cust.address || ''
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { name, phone, address } = this.form.getRawValue();
    if (!name || !phone) return;

    const cust = this.editingCustomer();
    if (cust) {
      this.ledger.updateCustomer(cust.id, {
        name,
        phone,
        address: address || ''
      });
    } else {
      const created = this.ledger.addCustomer(name, phone, address || '');
      // Automatically open the new customer's ledger view
      this.ledger.selectCustomer(created.id);
    }

    this.closeModal.emit();
  }
}
