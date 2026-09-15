import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { I18nService, LanguageCode } from '../services/i18n';

export type ProfileTab = 'business' | 'payment' | 'sheet' | 'backup' | 'language' | null;

@Component({
  selector: 'app-profile-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      
      <!-- Top Profile Identity Header (Summary Banner) -->
      <div class="hero-gradient-blue rounded-3xl p-4 sm:p-5 shadow-xs border border-blue-100/60">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-xs text-blue-600 flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 border border-blue-100">
              {{ ledger.businessName().slice(0, 1).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-0.5">
                <span class="inline-block px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-900 text-[10px] font-extrabold uppercase tracking-wider">
                  {{ ledger.businessCategory() }}
                </span>
                <span class="text-[11px] text-slate-500 font-medium">
                  {{ i18n.t().dukaanOwner }} <strong class="text-slate-800">{{ ledger.ownerName() }}</strong>
                </span>
              </div>
              <h2 class="text-lg sm:text-xl font-black text-slate-900 truncate tracking-tight">
                {{ ledger.businessName() }}
              </h2>
            </div>
          </div>

          <!-- Quick Sheet Indicator Pill -->
          <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span
              class="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase inline-flex items-center gap-1.5"
              [class.badge-pill-mint]="ledger.sheetConfig().scriptUrl && ledger.sheetConfig().syncStatus === 'synced'"
              [class.badge-pill-amber]="ledger.sheetConfig().syncStatus === 'syncing'"
              [class.badge-pill-rose]="!ledger.sheetConfig().scriptUrl || ledger.sheetConfig().syncStatus === 'error'"
            >
              <span class="w-1.5 h-1.5 rounded-full"
                [class.bg-emerald-500]="ledger.sheetConfig().scriptUrl && ledger.sheetConfig().syncStatus === 'synced'"
                [class.bg-amber-500]="ledger.sheetConfig().syncStatus === 'syncing'"
                [class.bg-rose-500]="!ledger.sheetConfig().scriptUrl || ledger.sheetConfig().syncStatus === 'error'"
              ></span>
              <span>{{ ledger.sheetConfig().scriptUrl ? i18n.t().sheetConnected : i18n.t().sheetNotConnected }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- COLLAPSIBLE SECTIONS LIST (All collapsed by default)           -->
      <!-- ============================================================== -->

      <div class="space-y-3" id="profile-accordion-container">
        
        <!-- ============================================================ -->
        <!-- SECTION 1: Shop & Merchant Info                              -->
        <!-- ============================================================ -->
        <div class="app-card overflow-hidden transition-all duration-200" id="accordion-business">
          
          <button
            type="button"
            (click)="toggleSection('business')"
            class="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 cursor-pointer transition-colors"
            id="toggle-section-business-btn"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
                [class.bg-blue-600]="activeSection() === 'business'"
                [class.text-white]="activeSection() === 'business'"
                [class.bg-blue-50]="activeSection() !== 'business'"
                [class.text-blue-600]="activeSection() !== 'business'"
              >
                <mat-icon class="text-base! w-5! h-5!">storefront</mat-icon>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-black text-slate-900 tracking-tight truncate">
                    {{ i18n.t().secBusinessTitle }}
                  </h3>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hidden sm:inline-block">
                    {{ i18n.t().secBusinessBadge }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {{ ledger.businessName() }} • {{ ledger.ownerName() }} ({{ ledger.phone() }})
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-[11px] font-bold text-blue-600 hidden sm:inline">
                {{ activeSection() === 'business' ? i18n.t().hideDetails : i18n.t().showDetails }}
              </span>
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200"
                [class.rotate-180]="activeSection() === 'business'"
                [class.bg-blue-50]="activeSection() === 'business'"
                [class.text-blue-600]="activeSection() === 'business'"
                [class.text-slate-400]="activeSection() !== 'business'"
              >
                <mat-icon class="text-base! w-4! h-4!">expand_more</mat-icon>
              </div>
            </div>
          </button>

          @if (activeSection() === 'business') {
            <div class="p-4 sm:p-5 pt-2 border-t border-slate-100 bg-white animate-in fade-in duration-150">
              
              @if (!isBusinessEditMode()) {
                <div class="space-y-3.5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        {{ i18n.t().fieldShopName }}
                      </span>
                      <strong class="text-sm font-black text-slate-900 block truncate">
                        {{ ledger.businessName() }}
                      </strong>
                    </div>

                    <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        {{ i18n.t().fieldOwnerName }}
                      </span>
                      <strong class="text-sm font-black text-slate-900 block truncate">
                        {{ ledger.ownerName() }}
                      </strong>
                    </div>

                    <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        {{ i18n.t().fieldPhone }}
                      </span>
                      <strong class="text-sm font-bold text-slate-800 block truncate font-mono">
                        {{ ledger.phone() }}
                      </strong>
                    </div>

                    <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        {{ i18n.t().fieldCategory }}
                      </span>
                      <span class="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                        {{ ledger.businessCategory() }}
                      </span>
                    </div>

                  </div>

                  @if (ledger.address()) {
                    <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start gap-2">
                      <mat-icon class="text-slate-400 text-sm! w-4! h-4! mt-0.5 shrink-0">location_on</mat-icon>
                      <div>
                        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">{{ i18n.t().fieldAddress }}</span>
                        <p class="text-xs font-semibold text-slate-800">{{ ledger.address() }}</p>
                      </div>
                    </div>
                  }

                  <div class="flex items-center justify-between pt-2">
                    <span class="text-[11px] text-slate-400">{{ i18n.t().billInfoNotice }}</span>
                    <button
                      type="button"
                      (click)="openBusinessEditMode()"
                      class="app-btn-secondary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      id="open-business-edit-mode-btn"
                    >
                      <mat-icon class="text-xs! w-3.5! h-3.5! text-blue-600">edit</mat-icon>
                      <span>{{ i18n.t().editDetailsBtn }}</span>
                    </button>
                  </div>
                </div>
              } @else {
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4 animate-in fade-in duration-150">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span class="text-xs font-bold text-slate-700">{{ i18n.t().editShopHeader }}</span>
                    <button
                      type="button"
                      (click)="isBusinessEditMode.set(false)"
                      class="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                      id="cancel-edit-mode-top-btn"
                    >
                      {{ i18n.t().cancel }}
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label for="prof-shop-name" class="block text-xs font-bold text-slate-700 mb-1">{{ i18n.t().fieldShopName }} *</label>
                      <input
                        id="prof-shop-name"
                        type="text"
                        formControlName="businessName"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                      />
                    </div>

                    <div>
                      <label for="prof-owner-name" class="block text-xs font-bold text-slate-700 mb-1">{{ i18n.t().fieldOwnerName }} *</label>
                      <input
                        id="prof-owner-name"
                        type="text"
                        formControlName="ownerName"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                      />
                    </div>

                    <div>
                      <label for="prof-phone" class="block text-xs font-bold text-slate-700 mb-1">{{ i18n.t().fieldPhone }} *</label>
                      <input
                        id="prof-phone"
                        type="tel"
                        formControlName="phone"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                      />
                    </div>

                    <div>
                      <label for="prof-category" class="block text-xs font-bold text-slate-700 mb-1">{{ i18n.t().fieldCategory }}</label>
                      <select
                        id="prof-category"
                        formControlName="businessCategory"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all cursor-pointer"
                      >
                        <option value="Kirana & General Store">Kirana & General Store</option>
                        <option value="Electronics & Mobile">Electronics & Mobile</option>
                        <option value="Medical & Pharmacy">Medical & Pharmacy</option>
                        <option value="Garments & Clothing">Garments & Clothing</option>
                        <option value="Hardware & Sanitary">Hardware & Sanitary</option>
                        <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                        <option value="Dairy & Bakery">Dairy & Bakery</option>
                        <option value="Jewellery & Ornaments">Jewellery & Ornaments</option>
                        <option value="Other Business">Other Business</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label for="prof-address" class="block text-xs font-bold text-slate-700 mb-1">{{ i18n.t().fieldAddress }}</label>
                    <input
                      id="prof-address"
                      type="text"
                      formControlName="address"
                      class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                    />
                  </div>

                  <div class="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      (click)="isBusinessEditMode.set(false)"
                      class="app-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                      id="cancel-business-edit-btn"
                    >
                      {{ i18n.t().cancel }}
                    </button>

                    <button
                      type="submit"
                      [disabled]="profileForm.invalid"
                      class="app-btn-primary px-5 py-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      id="save-profile-btn"
                    >
                      <mat-icon class="text-sm! w-4! h-4!">check</mat-icon>
                      <span>{{ i18n.t().saveProfileBtn }}</span>
                    </button>
                  </div>
                </form>
              }

            </div>
          }
        </div>

        <!-- ============================================================ -->
        <!-- SECTION 2: Payment QR & Bharat UPI Standee                   -->
        <!-- ============================================================ -->
        <div class="app-card overflow-hidden transition-all duration-200" id="accordion-payment">
          
          <button
            type="button"
            (click)="toggleSection('payment')"
            class="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 cursor-pointer transition-colors"
            id="toggle-section-payment-btn"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
                [class.bg-purple-600]="activeSection() === 'payment'"
                [class.text-white]="activeSection() === 'payment'"
                [class.bg-purple-50]="activeSection() !== 'payment'"
                [class.text-purple-600]="activeSection() !== 'payment'"
              >
                <mat-icon class="text-base! w-5! h-5!">qr_code_2</mat-icon>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-black text-slate-900 tracking-tight truncate">
                    {{ i18n.t().secPaymentTitle }}
                  </h3>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 hidden sm:inline-block">
                    {{ ledger.customQrUrl() ? i18n.t().customQrActiveBadge : i18n.t().secPaymentBadge }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5 font-mono">
                  {{ ledger.customQrUrl() ? 'Custom QR Code Active' : 'UPI ID: ' + ledger.upiId() }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-[11px] font-bold text-purple-600 hidden sm:inline">
                {{ activeSection() === 'payment' ? i18n.t().hideDetails : i18n.t().showDetails }}
              </span>
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200"
                [class.rotate-180]="activeSection() === 'payment'"
                [class.bg-purple-50]="activeSection() === 'payment'"
                [class.text-purple-600]="activeSection() === 'payment'"
                [class.text-slate-400]="activeSection() !== 'payment'"
              >
                <mat-icon class="text-base! w-4! h-4!">expand_more</mat-icon>
              </div>
            </div>
          </button>

          @if (activeSection() === 'payment') {
            <div class="p-4 sm:p-5 pt-2 border-t border-slate-100 bg-white animate-in fade-in duration-150 space-y-5">
              
              <!-- QR Mode Selection: Auto UPI vs Custom Uploaded QR -->
              <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span class="text-xs font-black text-slate-900 block">QR Code Display Type</span>
                    <p class="text-[11px] text-slate-500 font-medium">
                      {{ ledger.customQrUrl() ? 'Custom Uploaded QR Image is currently in use' : 'Auto UPI QR (via UPI ID) is currently in use' }}
                    </p>
                  </div>

                  <div class="flex items-center gap-2">
                    @if (ledger.customQrUrl()) {
                      <button
                        type="button"
                        (click)="removeCustomQr()"
                        class="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200 cursor-pointer transition-colors"
                        id="remove-custom-qr-btn"
                      >
                        <mat-icon class="text-xs! w-3.5! h-3.5!">delete</mat-icon>
                        <span>{{ i18n.t().removeCustomQrBtn }}</span>
                      </button>
                    }
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                
                <!-- Left: UPI ID & QR Upload controls -->
                <div class="sm:col-span-7 space-y-4">
                  
                  <!-- 1. UPI ID Section -->
                  <div class="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/80">
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">{{ i18n.t().upiIdLabel }}</span>
                      @if (!isUpiEditMode()) {
                        <button
                          type="button"
                          (click)="openUpiEditMode()"
                          class="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                          id="edit-upi-toggle-btn"
                        >
                          <mat-icon class="text-xs! w-3! h-3!">edit</mat-icon>
                          <span>{{ i18n.t().changeUpiBtn }}</span>
                        </button>
                      }
                    </div>

                    @if (!isUpiEditMode()) {
                      <div class="flex items-center justify-between gap-2">
                        <strong class="text-sm sm:text-base font-mono font-bold text-slate-900 truncate">
                          {{ ledger.upiId() }}
                        </strong>
                        <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                          {{ i18n.t().upiActiveBadge }}
                        </span>
                      </div>
                    } @else {
                      <div class="space-y-2 pt-1 animate-in fade-in duration-150">
                        <div class="relative">
                          <input
                            id="prof-upi-id"
                            type="text"
                            [value]="upiInput()"
                            (input)="onUpiInput($event)"
                            placeholder="e.g. 9876543210@paytm"
                            class="w-full pl-3 pr-16 py-2 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-200 outline-hidden"
                          />
                          <button
                            type="button"
                            (click)="saveUpiId()"
                            class="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            id="save-upi-btn"
                          >
                            {{ i18n.t().saveUpiBtn }}
                          </button>
                        </div>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            (click)="isUpiEditMode.set(false)"
                            class="text-[11px] text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                          >
                            {{ i18n.t().cancel }}
                          </button>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- 2. Custom QR Upload Box -->
                  <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5">
                        <mat-icon class="text-sm! w-4! h-4! text-purple-600">cloud_upload</mat-icon>
                        <strong class="text-xs font-bold text-slate-800">{{ i18n.t().uploadCustomQrTitle }}</strong>
                      </div>
                      @if (ledger.customQrUrl()) {
                        <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {{ i18n.t().customQrActiveBadge }}
                        </span>
                      }
                    </div>
                    <p class="text-[11px] text-slate-500 font-medium">
                      {{ i18n.t().uploadCustomQrSub }}
                    </p>

                    <!-- Dropzone / File input -->
                    <label
                      class="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center"
                      [class.border-purple-300]="!ledger.customQrUrl()"
                      [class.bg-purple-50/40]="!ledger.customQrUrl()"
                      [class.hover:bg-purple-50]="!ledger.customQrUrl()"
                      [class.border-emerald-300]="ledger.customQrUrl()"
                      [class.bg-emerald-50/30]="ledger.customQrUrl()"
                      id="qr-upload-dropzone"
                    >
                      <mat-icon class="text-xl! w-6! h-6! mb-1" [class.text-purple-600]="!ledger.customQrUrl()" [class.text-emerald-600]="ledger.customQrUrl()">
                        {{ ledger.customQrUrl() ? 'task_alt' : 'add_photo_alternate' }}
                      </mat-icon>
                      <span class="text-xs font-bold text-slate-800">
                        {{ ledger.customQrUrl() ? 'QR Image Uploaded (Click to replace)' : i18n.t().dragDropQrText }}
                      </span>
                      <span class="text-[10px] text-slate-400 font-medium mt-0.5">
                        PNG, JPG, JPEG (Compressed & Auto-Saved to Sheet Settings)
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        (change)="onQrImageSelected($event)"
                        class="hidden"
                        id="custom-qr-file-input"
                      />
                    </label>

                    <p class="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <mat-icon class="text-xs! w-3! h-3! text-purple-600 shrink-0">info</mat-icon>
                      <span>{{ i18n.t().qrUploadNotice }}</span>
                    </p>
                  </div>

                  <!-- Accepted Apps List -->
                  <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                      {{ i18n.t().acceptedAppsLabel }}
                    </span>
                    <div class="flex items-center gap-2 flex-wrap text-[11px] font-bold text-slate-700">
                      <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">Google Pay</span>
                      <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">PhonePe</span>
                      <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">Paytm</span>
                      <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">BHIM UPI</span>
                      <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">Amazon Pay</span>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      (click)="printQrStandee()"
                      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold cursor-pointer transition-colors shadow-sm"
                      id="print-qr-btn"
                    >
                      <mat-icon class="text-sm! w-4! h-4!">print</mat-icon>
                      <span>{{ i18n.t().printStandeeActionBtn }}</span>
                    </button>
                  </div>
                </div>

                <!-- Right: Standee Preview Display -->
                <div class="sm:col-span-5 flex justify-center">
                  <div class="w-56 bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm text-center flex flex-col items-center">
                    <div class="w-full pb-1.5 border-b border-slate-100 mb-1.5">
                      <span class="text-[9px] font-black text-purple-700 uppercase tracking-widest block">{{ i18n.t().bharatUpiQrTitle }}</span>
                      <h4 class="text-xs font-black text-slate-900 truncate">{{ ledger.businessName() }}</h4>
                    </div>

                    <div class="p-2 bg-slate-50 rounded-2xl border border-slate-200/80 my-1 shadow-2xs relative group">
                      <img
                        [src]="effectiveQrUrl()"
                        [alt]="ledger.businessName() + ' Payment QR'"
                        class="w-36 h-36 rounded-lg object-contain mx-auto"
                        referrerpolicy="no-referrer"
                      />
                      @if (ledger.customQrUrl()) {
                        <span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-purple-900/90 text-white text-[8px] font-black uppercase tracking-wider">
                          Custom QR
                        </span>
                      }
                    </div>

                    <span class="text-[10px] font-mono font-bold text-slate-600 truncate max-w-full px-2 mt-1">
                      {{ ledger.upiId() }}
                    </span>
                    <span class="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider mt-0.5">
                      {{ i18n.t().zeroExtraChargeNotice }}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          }
        </div>

        <!-- ============================================================ -->
        <!-- SECTION 3: Google Sheet Cloud Sync Hub                       -->
        <!-- ============================================================ -->
        <div class="app-card overflow-hidden transition-all duration-200" id="accordion-sheet">
          
          <button
            type="button"
            (click)="toggleSection('sheet')"
            class="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 cursor-pointer transition-colors"
            id="toggle-section-sheet-btn"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
                [class.bg-emerald-600]="activeSection() === 'sheet'"
                [class.text-white]="activeSection() === 'sheet'"
                [class.bg-emerald-50]="activeSection() !== 'sheet'"
                [class.text-emerald-600]="activeSection() !== 'sheet'"
              >
                <mat-icon class="text-base! w-5! h-5!">cloud_sync</mat-icon>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-black text-slate-900 tracking-tight truncate">
                    {{ i18n.t().secSheetTitle }}
                  </h3>
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full hidden sm:inline-block"
                    [class.bg-emerald-100]="ledger.sheetConfig().scriptUrl"
                    [class.text-emerald-800]="ledger.sheetConfig().scriptUrl"
                    [class.bg-slate-100]="!ledger.sheetConfig().scriptUrl"
                    [class.text-slate-600]="!ledger.sheetConfig().scriptUrl"
                  >
                    {{ ledger.sheetConfig().scriptUrl ? i18n.t().connected : i18n.t().offline }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {{ ledger.sheetConfig().connectedSheetName || 'Google Drive Cloud Backup' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-[11px] font-bold text-emerald-600 hidden sm:inline">
                {{ activeSection() === 'sheet' ? i18n.t().hideDetails : i18n.t().showDetails }}
              </span>
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200"
                [class.rotate-180]="activeSection() === 'sheet'"
                [class.bg-emerald-50]="activeSection() === 'sheet'"
                [class.text-emerald-600]="activeSection() === 'sheet'"
                [class.text-slate-400]="activeSection() !== 'sheet'"
              >
                <mat-icon class="text-base! w-4! h-4!">expand_more</mat-icon>
              </div>
            </div>
          </button>

          @if (activeSection() === 'sheet') {
            <div class="p-4 sm:p-5 pt-2 border-t border-slate-100 bg-white space-y-4 animate-in fade-in duration-150">
              
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span class="text-slate-500 font-medium block text-xs">{{ i18n.t().connectedGoogleSheet }}</span>
                  <strong class="text-slate-900 font-bold text-sm block truncate max-w-md mt-0.5">
                    {{ ledger.sheetConfig().connectedSheetName || 'Google Apps Script Web App' }}
                  </strong>
                  @if (ledger.sheetConfig().lastSyncedAt) {
                    <span class="text-[11px] text-slate-400 mt-1 block flex items-center gap-1">
                      <mat-icon class="text-xs! w-3.5! h-3.5! text-emerald-500">check_circle</mat-icon>
                      {{ i18n.t().lastSynced }} {{ ledger.sheetConfig().lastSyncedAt }}
                    </span>
                  }
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    (click)="ledger.pullFromGoogleSheet(true)"
                    class="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    id="manual-sync-now-btn"
                  >
                    <mat-icon class="text-xs! w-3.5! h-3.5!">sync</mat-icon>
                    <span>{{ i18n.t().manualSyncBtn }}</span>
                  </button>

                  <button
                    type="button"
                    (click)="openSheetModal.emit()"
                    class="px-3.5 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    id="edit-sheet-setup-btn"
                  >
                    {{ i18n.t().settingsBtn }}
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div class="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <mat-icon class="text-xs! w-3.5! h-3.5! text-emerald-600">security</mat-icon>
                    <span>{{ i18n.t().sheetBullet1Title }}</span>
                  </div>
                  <p class="text-[11px] text-slate-500">{{ i18n.t().sheetBullet1Desc }}</p>
                </div>

                <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div class="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <mat-icon class="text-xs! w-3.5! h-3.5! text-blue-600">devices</mat-icon>
                    <span>{{ i18n.t().sheetBullet2Title }}</span>
                  </div>
                  <p class="text-[11px] text-slate-500">{{ i18n.t().sheetBullet2Desc }}</p>
                </div>

                <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div class="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <mat-icon class="text-xs! w-3.5! h-3.5! text-purple-600">bolt</mat-icon>
                    <span>{{ i18n.t().sheetBullet3Title }}</span>
                  </div>
                  <p class="text-[11px] text-slate-500">{{ i18n.t().sheetBullet3Desc }}</p>
                </div>
              </div>

              <!-- 3-Tabs in Google Sheet Explanation -->
              <div class="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/90 text-xs space-y-1.5">
                <div class="flex items-center gap-1.5 font-bold text-emerald-950">
                  <mat-icon class="text-sm! w-4! h-4! text-emerald-600">view_column</mat-icon>
                  <span>Google Sheet 3-Tabs Architecture (Auto Sync):</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div class="bg-white/80 p-2 rounded-xl border border-emerald-100">
                    <strong class="text-emerald-900 block font-bold">1. Customers Tab</strong>
                    <span class="text-slate-600">Grahakon ke naam, phone, pata aur ID.</span>
                  </div>
                  <div class="bg-white/80 p-2 rounded-xl border border-emerald-100">
                    <strong class="text-emerald-900 block font-bold">2. Transactions Tab</strong>
                    <span class="text-slate-600">Sabhi Udhar aur Jama ke records.</span>
                  </div>
                  <div class="bg-white/80 p-2 rounded-xl border border-emerald-100">
                    <strong class="text-emerald-900 block font-bold">3. Settings Tab</strong>
                    <span class="text-slate-600">Dukaan name, UPI ID, Custom QR data & Language.</span>
                  </div>
                </div>
              </div>

              @if (ledger.sheetConfig().scriptUrl) {
                <div class="pt-1 flex justify-end">
                  <button
                    type="button"
                    (click)="confirmDisconnectSheet()"
                    class="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    id="disconnect-sheet-btn"
                  >
                    <mat-icon class="text-xs! w-3.5! h-3.5!">link_off</mat-icon>
                    <span>{{ i18n.t().disconnectSheetBtn }}</span>
                  </button>
                </div>
              }

            </div>
          }
        </div>

        <!-- ============================================================ -->
        <!-- SECTION 4: Backup & Data Export Tools                        -->
        <!-- ============================================================ -->
        <div class="app-card overflow-hidden transition-all duration-200" id="accordion-backup">
          
          <button
            type="button"
            (click)="toggleSection('backup')"
            class="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 cursor-pointer transition-colors"
            id="toggle-section-backup-btn"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
                [class.bg-teal-600]="activeSection() === 'backup'"
                [class.text-white]="activeSection() === 'backup'"
                [class.bg-teal-50]="activeSection() !== 'backup'"
                [class.text-teal-600]="activeSection() !== 'backup'"
              >
                <mat-icon class="text-base! w-5! h-5!">save_alt</mat-icon>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-black text-slate-900 tracking-tight truncate">
                    {{ i18n.t().secBackupTitle }}
                  </h3>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 hidden sm:inline-block">
                    {{ i18n.t().secBackupBadge }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {{ i18n.t().secBackupSub }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-[11px] font-bold text-teal-600 hidden sm:inline">
                {{ activeSection() === 'backup' ? i18n.t().hideDetails : i18n.t().showDetails }}
              </span>
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200"
                [class.rotate-180]="activeSection() === 'backup'"
                [class.bg-teal-50]="activeSection() === 'backup'"
                [class.text-teal-600]="activeSection() === 'backup'"
                [class.text-slate-400]="activeSection() !== 'backup'"
              >
                <mat-icon class="text-base! w-4! h-4!">expand_more</mat-icon>
              </div>
            </div>
          </button>

          @if (activeSection() === 'backup') {
            <div class="p-4 sm:p-5 pt-2 border-t border-slate-100 bg-white space-y-4 animate-in fade-in duration-150">
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  (click)="ledger.exportLedgerCsv()"
                  class="app-card p-3.5 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer group"
                  id="export-csv-btn"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <mat-icon class="text-base! w-5! h-5!">table_view</mat-icon>
                    </div>
                    <div>
                      <strong class="text-xs sm:text-sm font-extrabold text-slate-900 block">{{ i18n.t().exportCsvBtnTitle }}</strong>
                      <span class="text-[11px] text-slate-400 font-medium">{{ i18n.t().exportCsvBtnSub }}</span>
                    </div>
                  </div>
                  <mat-icon class="text-slate-400 group-hover:text-slate-700 text-sm! w-4! h-4!">download</mat-icon>
                </button>

                <button
                  type="button"
                  (click)="ledger.exportLedgerJson()"
                  class="app-card p-3.5 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer group"
                  id="export-json-btn"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <mat-icon class="text-base! w-5! h-5!">data_object</mat-icon>
                    </div>
                    <div>
                      <strong class="text-xs sm:text-sm font-extrabold text-slate-900 block">{{ i18n.t().downloadJsonBtnTitle }}</strong>
                      <span class="text-[11px] text-slate-400 font-medium">{{ i18n.t().downloadJsonBtnSub }}</span>
                    </div>
                  </div>
                  <mat-icon class="text-slate-400 group-hover:text-slate-700 text-sm! w-4! h-4!">download</mat-icon>
                </button>
              </div>

              <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <strong class="text-slate-800 font-bold block">{{ i18n.t().restoreBackupTitle }}</strong>
                  <span class="text-slate-500 font-medium text-[11px]">{{ i18n.t().restoreBackupSub }}</span>
                </div>
                <label class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer transition-colors shadow-2xs shrink-0">
                  <mat-icon class="text-xs! w-3.5! h-3.5!">upload_file</mat-icon>
                  <span>{{ i18n.t().uploadBackupFileBtn }}</span>
                  <input type="file" accept=".json" (change)="onBackupFileSelected($event)" class="hidden" id="restore-backup-input" />
                </label>
              </div>

            </div>
          }
        </div>

        <!-- ============================================================ -->
        <!-- SECTION 5: LANGUAGE SETTINGS (Simple Toggle Switch)          -->
        <!-- ============================================================ -->
        <div class="app-card overflow-hidden transition-all duration-200 border-2" [class.border-indigo-100]="activeSection() !== 'language'" [class.border-indigo-400]="activeSection() === 'language'" id="accordion-language">
          
          <button
            type="button"
            (click)="toggleSection('language')"
            class="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 cursor-pointer transition-colors"
            id="toggle-section-language-btn"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-2xs"
                [class.bg-indigo-600]="activeSection() === 'language'"
                [class.text-white]="activeSection() === 'language'"
                [class.bg-indigo-50]="activeSection() !== 'language'"
                [class.text-indigo-600]="activeSection() !== 'language'"
              >
                <mat-icon class="text-base! w-5! h-5!">translate</mat-icon>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-black text-slate-900 tracking-tight truncate">
                    {{ i18n.t().secLanguageTitle }}
                  </h3>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 hidden sm:inline-block">
                    {{ i18n.currentLanguage() === 'hi' ? 'हिंदी (Hindi)' : 'English' }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {{ i18n.currentLanguage() === 'hi' ? 'हिंदी सक्रिय है' : 'English is active' }} • {{ i18n.t().secLanguageSub }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-[11px] font-bold text-indigo-600 hidden sm:inline">
                {{ activeSection() === 'language' ? i18n.t().hideDetails : i18n.t().showDetails }}
              </span>
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200"
                [class.rotate-180]="activeSection() === 'language'"
                [class.bg-indigo-50]="activeSection() === 'language'"
                [class.text-indigo-600]="activeSection() === 'language'"
                [class.text-slate-400]="activeSection() !== 'language'"
              >
                <mat-icon class="text-base! w-4! h-4!">expand_more</mat-icon>
              </div>
            </div>
          </button>

          <!-- Simple Toggle Switch Content -->
          @if (activeSection() === 'language') {
            <div class="p-4 sm:p-5 pt-2 border-t border-slate-100 bg-white space-y-4 animate-in fade-in duration-150">
              
              <!-- Clean Simple Switch Toggle Row -->
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <strong class="text-sm font-black text-slate-900 block">
                      {{ i18n.currentLanguage() === 'hi' ? 'हिंदी भाषा सक्रिय है (Hindi)' : 'English Language Active' }}
                    </strong>
                    <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {{ i18n.currentLanguage() === 'hi' ? 'हिं' : 'EN' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 font-medium mt-0.5">
                    {{ i18n.currentLanguage() === 'hi' ? 'अंग्रेजी (English) में बदलने के लिए स्विच दबाएं' : 'Switch to Hindi (हिंदी) by toggling this switch' }}
                  </p>
                </div>

                <!-- Simple Toggle Switch Button -->
                <button
                  type="button"
                  (click)="toggleLanguageSwitch()"
                  class="relative inline-flex h-9 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-indigo-600 p-0.5 select-none shadow-sm active:scale-95"
                  id="profile-language-toggle-switch-btn"
                  title="Switch Language / भाषा बदलें"
                >
                  <span class="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-black text-white pointer-events-none">
                    <span [class.opacity-100]="i18n.currentLanguage() === 'hi'" [class.opacity-40]="i18n.currentLanguage() !== 'hi'">हिं</span>
                    <span [class.opacity-100]="i18n.currentLanguage() === 'en'" [class.opacity-40]="i18n.currentLanguage() !== 'en'">EN</span>
                  </span>
                  <span
                    class="pointer-events-none inline-block h-7.5 w-7.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out flex items-center justify-center text-[10px] font-black text-indigo-700"
                    [class.translate-x-0]="i18n.currentLanguage() === 'hi'"
                    [class.translate-x-10]="i18n.currentLanguage() === 'en'"
                  >
                    {{ i18n.currentLanguage() === 'hi' ? 'हिं' : 'EN' }}
                  </span>
                </button>
              </div>

              <!-- Notice card confirming instant change -->
              <div class="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 flex items-start gap-2.5 text-xs text-indigo-950">
                <mat-icon class="text-indigo-600 text-base! w-4! h-4! mt-0.5 shrink-0">info</mat-icon>
                <p class="font-medium leading-relaxed">
                  {{ i18n.t().langNotice }}
                </p>
              </div>

            </div>
          }
        </div>

      </div>

      <!-- App Version & Security Footnote -->
      <div class="text-center py-2 space-y-0.5">
        <p class="text-xs font-bold text-slate-600 tracking-tight">
          {{ i18n.t().appFootnote1 }}
        </p>
        <p class="text-[10px] text-slate-400 font-medium">
          {{ i18n.t().appFootnote2 }}
        </p>
      </div>

    </div>
  `
})
export class ProfileView {
  readonly ledger = inject(Ledger);
  readonly i18n = inject(I18nService);

  readonly initialTab = input<ProfileTab>(null);
  readonly openSheetModal = output<void>();
  readonly tabChange = output<ProfileTab>();

  readonly activeSection = signal<ProfileTab>(null);
  readonly upiInput = signal(this.ledger.upiId());

  readonly isBusinessEditMode = signal<boolean>(false);
  readonly isUpiEditMode = signal<boolean>(false);

  constructor() {
    effect(() => {
      const tab = this.initialTab();
      if (tab) {
        this.activeSection.set(tab);
      }
    });
  }

  toggleSection(section: ProfileTab): void {
    this.activeSection.update((current) => (current === section ? null : section));
    this.tabChange.emit(this.activeSection());
    this.isBusinessEditMode.set(false);
    this.isUpiEditMode.set(false);
  }

  toggleLanguageSwitch(): void {
    this.i18n.toggleLanguage();
    const currentLang = this.i18n.currentLanguage();
    this.ledger.triggerBackgroundSync();
    this.ledger.showToast(
      currentLang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है।' : 'Language changed to English successfully.',
      'success'
    );
  }

  selectLanguage(lang: LanguageCode): void {
    this.i18n.setLanguage(lang);
    this.ledger.triggerBackgroundSync();
    this.ledger.showToast(
      lang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है।' : 'Language changed to English successfully.',
      'success'
    );
  }

  openBusinessEditMode(): void {
    this.profileForm.reset({
      businessName: this.ledger.businessName(),
      ownerName: this.ledger.ownerName(),
      phone: this.ledger.phone(),
      address: this.ledger.address(),
      businessCategory: this.ledger.businessCategory()
    });
    this.isBusinessEditMode.set(true);
  }

  openUpiEditMode(): void {
    this.upiInput.set(this.ledger.upiId());
    this.isUpiEditMode.set(true);
  }

  readonly profileForm = new FormGroup({
    businessName: new FormControl(this.ledger.businessName(), { nonNullable: true, validators: [Validators.required] }),
    ownerName: new FormControl(this.ledger.ownerName(), { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl(this.ledger.phone(), { nonNullable: true, validators: [Validators.required] }),
    address: new FormControl(this.ledger.address(), { nonNullable: true }),
    businessCategory: new FormControl(this.ledger.businessCategory(), { nonNullable: true })
  });

  readonly qrCodeUrl = computed(() => {
    const upi = this.ledger.upiId();
    const name = encodeURIComponent(this.ledger.businessName());
    const upiData = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${name}&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiData)}`;
  });

  readonly effectiveQrUrl = computed(() => {
    const custom = this.ledger.customQrUrl();
    if (custom && custom.trim().length > 0) {
      return custom;
    }
    return this.qrCodeUrl();
  });

  onQrImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.ledger.showToast('Please select a valid image file (PNG/JPG).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      // Compress/resize image to keep it lightweight for storage & Google Sheet
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.85);
          this.ledger.updateProfile({ customQrUrl: compressedDataUrl });
          this.ledger.showToast('Custom QR Code uploaded & saved successfully! ✅', 'success');
        } else {
          this.ledger.updateProfile({ customQrUrl: rawDataUrl });
          this.ledger.showToast('Custom QR Code uploaded & saved successfully! ✅', 'success');
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeCustomQr(): void {
    this.ledger.updateProfile({ customQrUrl: '' });
    this.ledger.showToast('Custom QR removed. Switched back to Auto UPI QR.', 'info');
  }

  onUpiInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.upiInput.set(input.value);
  }

  saveUpiId(): void {
    const val = this.upiInput().trim();
    if (!val) return;
    this.ledger.updateProfile({ upiId: val });
    this.isUpiEditMode.set(false);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    const val = this.profileForm.getRawValue();
    this.ledger.updateProfile({
      businessName: val.businessName,
      ownerName: val.ownerName,
      phone: val.phone,
      address: val.address,
      businessCategory: val.businessCategory
    });
    this.isBusinessEditMode.set(false);
  }

  printQrStandee(): void {
    window.print();
  }

  confirmDisconnectSheet(): void {
    if (confirm(this.i18n.t().disconnectSheetConfirm)) {
      this.ledger.disconnectSheet();
    }
  }

  onBackupFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        this.ledger.importLedgerJson(text);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
}
