import { ChangeDetectionStrategy, Component, inject, input, output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { Customer } from '../models/ledger.models';
import { I18nService } from '../services/i18n';

@Component({
  selector: 'app-customer-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="ios-sheet-backdrop">
      <div class="ios-sheet-card p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="pb-3 border-b border-black/[0.06] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-[14px] bg-[#007aff]/10 text-[#007aff] flex items-center justify-center">
              <mat-icon class="text-lg! w-5! h-5!">person_add</mat-icon>
            </div>
            <div>
              <h3 class="font-bold text-base sm:text-lg text-[#1c1c1e] tracking-tight leading-tight">
                {{ editingCustomer() ? i18n.t().editCustomerTitle : i18n.t().addCustomerTitle }}
              </h3>
              <p class="text-[11px] text-[#8e8e93] font-medium">{{ i18n.t().addCustomerSub }}</p>
            </div>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#8e8e93] hover:text-[#1c1c1e] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            id="close-customer-modal-btn"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">close</mat-icon>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="pt-4 space-y-4">
          
          <!-- Name Input -->
          <div>
            <label for="customer-name-input" class="block text-xs font-bold text-[#1c1c1e] mb-1.5">{{ i18n.t().customerNameLabel }} *</label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-3.5 py-2.5 bg-black/[0.04] border border-black/[0.06] rounded-[16px] text-xs sm:text-sm text-[#1c1c1e] outline-hidden focus:bg-white focus:ring-2 focus:ring-[#007aff]/30 transition-all placeholder-[#8e8e93]"
              [placeholder]="i18n.t().customerNamePlaceholder"
              id="customer-name-input"
            />
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="text-xs text-[#ff3b30] mt-1 font-semibold">{{ i18n.t().nameReqError }}</p>
            }
          </div>

          <!-- Phone Number Input -->
          <div>
            <label for="customer-phone-input" class="block text-xs font-bold text-[#1c1c1e] mb-1.5">{{ i18n.t().phoneLabel }} *</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8e8e93]">+91</span>
              <input
                type="tel"
                formControlName="phone"
                maxlength="10"
                class="w-full pl-11 pr-4 py-2.5 bg-black/[0.04] border border-black/[0.06] rounded-[16px] text-xs sm:text-sm text-[#1c1c1e] outline-hidden focus:bg-white focus:ring-2 focus:ring-[#007aff]/30 transition-all placeholder-[#8e8e93]"
                placeholder="10-digit mobile number"
                id="customer-phone-input"
              />
            </div>
            <p class="text-[11px] text-[#8e8e93] mt-1 font-medium">{{ i18n.t().phoneHelpText }}</p>
          </div>

          <!-- Address / Note Input -->
          <div>
            <label for="customer-address-input" class="block text-xs font-bold text-[#1c1c1e] mb-1.5">{{ i18n.t().addressLabel }}</label>
            <textarea
              formControlName="address"
              rows="2"
              class="w-full px-3.5 py-2.5 bg-black/[0.04] border border-black/[0.06] rounded-[16px] text-xs sm:text-sm text-[#1c1c1e] outline-hidden focus:bg-white focus:ring-2 focus:ring-[#007aff]/30 transition-all resize-none placeholder-[#8e8e93]"
              [placeholder]="i18n.t().addressPlaceholder"
              id="customer-address-input"
            ></textarea>
          </div>

          <!-- Modal Action Buttons -->
          <div class="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="ios-btn-secondary px-4 py-2 text-xs sm:text-sm cursor-pointer"
              id="cancel-customer-btn"
            >
              {{ i18n.t().cancel }}
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="ios-btn-primary px-6 py-2.5 text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              id="save-customer-btn"
            >
              {{ editingCustomer() ? i18n.t().updateCustomerBtn : i18n.t().addCustomerModalBtn }}
            </button>
          </div>

        </form>

      </div>
    </div>
  `
})
export class CustomerModal implements OnInit {
  readonly ledger = inject(Ledger);
  readonly i18n = inject(I18nService);

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
      this.ledger.selectCustomer(created.id);
    }

    this.closeModal.emit();
  }
}
