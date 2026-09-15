import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';

export type ProfileTab = 'business' | 'payment' | 'sheet' | 'backup' | null;

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
                  Malik: <strong class="text-slate-800">{{ ledger.ownerName() }}</strong>
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
              <span>{{ ledger.sheetConfig().scriptUrl ? 'Sheet Connected' : 'Sheet Not Connected' }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- COLLAPSIBLE SECTIONS LIST (All collapsed by default)           -->
      <!-- No edit forms or fields are visible by default                 -->
      <!-- ============================================================== -->

      <div class="space-y-3" id="profile-accordion-container">
        
        <!-- ============================================================ -->
        <!-- SECTION 1: Dukan Aur Vyapari Ki Jankari                      -->
        <!-- ============================================================ -->
        <div class="app-card overflow-hidden transition-all duration-200" id="accordion-business">
          
          <!-- Collapsible Header Button -->
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
                    Dukan Aur Vyapari Ki Jankari
                  </h3>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hidden sm:inline-block">
                    Profile
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {{ ledger.businessName() }} • {{ ledger.ownerName() }} ({{ ledger.phone() }})
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-[11px] font-bold text-blue-600 hidden sm:inline">
                {{ activeSection() === 'business' ? 'Chupayein' : 'Dekhein' }}
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

          <!-- Collapsible Content -->
          @if (activeSection() === 'business') {
            <div class="p-4 sm:p-5 pt-2 border-t border-slate-100 bg-white animate-in fade-in duration-150">
              
              <!-- READ-ONLY DETAILS (Default inside section - No inputs) -->
              @if (!isBusinessEditMode()) {
                <div class="space-y-3.5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Dukan / Firm Ka Naam
                      </span>
                      <strong class="text-sm font-black text-slate-900 block truncate">
                        {{ ledger.businessName() }}
                      </strong>
                    </div>

                    <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Vyapari / Malik Ka Naam
                      </span>
                      <strong class="text-sm font-black text-slate-900 block truncate">
                        {{ ledger.ownerName() }}
                      </strong>
                    </div>

                    <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Mobile Number
                      </span>
                      <strong class="text-sm font-bold text-slate-800 block truncate font-mono">
                        {{ ledger.phone() }}
                      </strong>
                    </div>

                    <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                        Vyapar Category
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
                        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Dukan Ka Pata</span>
                        <p class="text-xs font-semibold text-slate-800">{{ ledger.address() }}</p>
                      </div>
                    </div>
                  }

                  <!-- Action Bar to reveal edit mode -->
                  <div class="flex items-center justify-between pt-2">
                    <span class="text-[11px] text-slate-400">Bahi khata bills me yahi jankari aati hai</span>
                    <button
                      type="button"
                      (click)="openBusinessEditMode()"
                      class="app-btn-secondary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      id="open-business-edit-mode-btn"
                    >
                      <mat-icon class="text-xs! w-3.5! h-3.5! text-blue-600">edit</mat-icon>
                      <span>Jankari Badlein (Edit)</span>
                    </button>
                  </div>
                </div>
              } @else {
                <!-- EDIT FORM (Only shown when user explicitly clicked 'Edit') -->
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4 animate-in fade-in duration-150">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span class="text-xs font-bold text-slate-700">Dukan Details Edit Karein</span>
                    <button
                      type="button"
                      (click)="isBusinessEditMode.set(false)"
                      class="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                      id="cancel-edit-mode-top-btn"
                    >
                      Cancel
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <!-- Shop Name -->
                    <div>
                      <label for="prof-shop-name" class="block text-xs font-bold text-slate-700 mb-1">Dukan / Firm Ka Naam *</label>
                      <input
                        id="prof-shop-name"
                        type="text"
                        formControlName="businessName"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                        placeholder="Jaise: Shree Ganesh Traders"
                      />
                    </div>

                    <!-- Owner Name -->
                    <div>
                      <label for="prof-owner-name" class="block text-xs font-bold text-slate-700 mb-1">Vyapari / Malik Ka Naam *</label>
                      <input
                        id="prof-owner-name"
                        type="text"
                        formControlName="ownerName"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                        placeholder="Jaise: Ramesh Kumar"
                      />
                    </div>

                    <!-- Phone Number -->
                    <div>
                      <label for="prof-phone" class="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                      <input
                        id="prof-phone"
                        type="tel"
                        formControlName="phone"
                        class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                        placeholder="10 digit mobile number"
                      />
                    </div>

                    <!-- Category -->
                    <div>
                      <label for="prof-category" class="block text-xs font-bold text-slate-700 mb-1">Vyapar Category</label>
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

                  <!-- Address -->
                  <div>
                    <label for="prof-address" class="block text-xs font-bold text-slate-700 mb-1">Dukan Ka Pata (Address)</label>
                    <input
                      id="prof-address"
                      type="text"
                      formControlName="address"
                      class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                      placeholder="Gali, Bazaar, Shahar..."
                    />
                  </div>

                  <div class="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      (click)="isBusinessEditMode.set(false)"
                      class="app-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
                      id="cancel-business-edit-btn"
                    >
                      Cancel Karein
                    </button>

                    <button
                      type="submit"
                      [disabled]="profileForm.invalid"
                      class="app-btn-primary px-5 py-2.5 text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      id="save-profile-btn"
                    >
                      <mat-icon class="text-sm! w-4! h-4!">check</mat-icon>
                      <span>Save & Update</span>
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
          
          <!-- Collapsible Header Button -->
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
                    Payment QR & Bharat UPI Standee
                  </h3>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 hidden sm:inline-block">
                    UPI
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5 font-mono">
                  UPI ID: {{ ledger.upiId() }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-[11px] font-bold text-purple-600 hidden sm:inline">
                {{ activeSection() === 'payment' ? 'Chupayein' : 'Dekhein' }}
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

          <!-- Collapsible Content -->
          @if (activeSection() === 'payment') {
            <div class="p-4 sm:p-5 pt-2 border-t border-slate-100 bg-white animate-in fade-in duration-150">
              
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                
                <!-- Left: UPI ID details & options -->
                <div class="sm:col-span-7 space-y-4">
                  
                  <!-- Read-only UPI display or Edit form -->
                  <div class="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100/80">
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Vyapari UPI ID</span>
                      @if (!isUpiEditMode()) {
                        <button
                          type="button"
                          (click)="openUpiEditMode()"
                          class="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                          id="edit-upi-toggle-btn"
                        >
                          <mat-icon class="text-xs! w-3! h-3!">edit</mat-icon>
                          <span>Badlein</span>
                        </button>
                      }
                    </div>

                    @if (!isUpiEditMode()) {
                      <div class="flex items-center justify-between gap-2">
                        <strong class="text-sm sm:text-base font-mono font-bold text-slate-900 truncate">
                          {{ ledger.upiId() }}
                        </strong>
                        <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                          Active
                        </span>
                      </div>
                    } @else {
                      <!-- UPI Edit Input (Hidden by default, opens only on edit) -->
                      <div class="space-y-2 pt-1 animate-in fade-in duration-150">
                        <div class="relative">
                          <input
                            id="prof-upi-id"
                            type="text"
                            [value]="upiInput()"
                            (input)="onUpiInput($event)"
                            placeholder="Jaise: 9876543210@paytm"
                            class="w-full pl-3 pr-16 py-2 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-200 outline-hidden"
                          />
                          <button
                            type="button"
                            (click)="saveUpiId()"
                            class="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                            id="save-upi-btn"
                          >
                            Save
                          </button>
                        </div>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            (click)="isUpiEditMode.set(false)"
                            class="text-[11px] text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Accepted payment apps badges -->
                  <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                      Swikrit Bhugtan Apps (Accepted Apps):
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
                      <span>Dukan Ke Liye Standee Print Karein</span>
                    </button>
                  </div>

                </div>

                <!-- Right: Visual Standee Preview Card -->
                <div class="sm:col-span-5 flex justify-center">
                  <div class="w-56 bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm text-center flex flex-col items-center">
                    <div class="w-full pb-1.5 border-b border-slate-100 mb-1.5">
                      <span class="text-[9px] font-black text-purple-700 uppercase tracking-widest block">BHARAT UPI QR</span>
                      <h4 class="text-xs font-black text-slate-900 truncate">{{ ledger.businessName() }}</h4>
                    </div>

                    <div class="p-2 bg-slate-50 rounded-2xl border border-slate-200/80 my-1 shadow-2xs">
                      <img
                        [src]="qrCodeUrl()"
                        [alt]="ledger.businessName() + ' UPI QR'"
                        class="w-32 h-32 rounded-lg object-contain mx-auto"
                        referrerpolicy="no-referrer"
                      />
                    </div>

                    <span class="text-[10px] font-mono font-bold text-slate-600 truncate max-w-full px-2 mt-1">
                      {{ ledger.upiId() }}
                    </span>
                    <span class="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider mt-0.5">
                      Zero Extra Charge • Direct Bank
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
          
          <!-- Collapsible Header Button -->
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
                    Google Sheet Cloud Sync Hub
                  </h3>
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full hidden sm:inline-block"
                    [class.bg-emerald-100]="ledger.sheetConfig().scriptUrl"
                    [class.text-emerald-800]="ledger.sheetConfig().scriptUrl"
                    [class.bg-slate-100]="!ledger.sheetConfig().scriptUrl"
                    [class.text-slate-600]="!ledger.sheetConfig().scriptUrl"
                  >
                    {{ ledger.sheetConfig().scriptUrl ? 'Connected' : 'Offline' }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {{ ledger.sheetConfig().connectedSheetName || 'Google Drive Cloud Backup' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-[11px] font-bold text-emerald-600 hidden sm:inline">
                {{ activeSection() === 'sheet' ? 'Chupayein' : 'Dekhein' }}
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

          <!-- Collapsible Content -->
          @if (activeSection() === 'sheet') {
            <div class="p-4 sm:p-5 pt-2 border-t border-slate-100 bg-white space-y-4 animate-in fade-in duration-150">
              
              <!-- Status Box -->
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span class="text-slate-500 font-medium block text-xs">Connected Google Sheet:</span>
                  <strong class="text-slate-900 font-bold text-sm block truncate max-w-md mt-0.5">
                    {{ ledger.sheetConfig().connectedSheetName || 'Google Apps Script Web App' }}
                  </strong>
                  @if (ledger.sheetConfig().lastSyncedAt) {
                    <span class="text-[11px] text-slate-400 mt-1 block flex items-center gap-1">
                      <mat-icon class="text-xs! w-3.5! h-3.5! text-emerald-500">check_circle</mat-icon>
                      Last Synced: {{ ledger.sheetConfig().lastSyncedAt }}
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
                    <span>Sync Abhi Karein</span>
                  </button>

                  <button
                    type="button"
                    (click)="openSheetModal.emit()"
                    class="px-3.5 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    id="edit-sheet-setup-btn"
                  >
                    Settings
                  </button>
                </div>
              </div>

              <!-- Sheet feature bullets -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div class="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <mat-icon class="text-xs! w-3.5! h-3.5! text-emerald-600">security</mat-icon>
                    <span>100% Data Suraksha</span>
                  </div>
                  <p class="text-[11px] text-slate-500">Aapka bahi khata Google Drive me save rehta hai.</p>
                </div>

                <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div class="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <mat-icon class="text-xs! w-3.5! h-3.5! text-blue-600">devices</mat-icon>
                    <span>Multi-Device Access</span>
                  </div>
                  <p class="text-[11px] text-slate-500">Computer ya doosre mobile se sheet dekhein.</p>
                </div>

                <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div class="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <mat-icon class="text-xs! w-3.5! h-3.5! text-purple-600">bolt</mat-icon>
                    <span>Automatic Backup</span>
                  </div>
                  <p class="text-[11px] text-slate-500">Har naye len-den par sheet auto-sync hoti hai.</p>
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
                    <span>Google Sheet Disconnect Karein</span>
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
          
          <!-- Collapsible Header Button -->
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
                    Data Backup Aur Excel Export
                  </h3>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 hidden sm:inline-block">
                    Export
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  Excel CSV download • Offline JSON backup restore
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-[11px] font-bold text-teal-600 hidden sm:inline">
                {{ activeSection() === 'backup' ? 'Chupayein' : 'Dekhein' }}
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

          <!-- Collapsible Content -->
          @if (activeSection() === 'backup') {
            <div class="p-4 sm:p-5 pt-2 border-t border-slate-100 bg-white space-y-4 animate-in fade-in duration-150">
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <!-- CSV Export Button -->
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
                      <strong class="text-xs sm:text-sm font-extrabold text-slate-900 block">Export to Excel / CSV</strong>
                      <span class="text-[11px] text-slate-400 font-medium">Spreadsheet me ledger download karein</span>
                    </div>
                  </div>
                  <mat-icon class="text-slate-400 group-hover:text-slate-700 text-sm! w-4! h-4!">download</mat-icon>
                </button>

                <!-- JSON Backup Button -->
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
                      <strong class="text-xs sm:text-sm font-extrabold text-slate-900 block">Download Full JSON Backup</strong>
                      <span class="text-[11px] text-slate-400 font-medium">Complete offline backup file</span>
                    </div>
                  </div>
                  <mat-icon class="text-slate-400 group-hover:text-slate-700 text-sm! w-4! h-4!">download</mat-icon>
                </button>

              </div>

              <!-- Restore JSON Backup Uploader -->
              <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <strong class="text-slate-800 font-bold block">Restore Backup:</strong>
                  <span class="text-slate-500 font-medium text-[11px]">Pehle se download ki gayi backup file se hisab wapas layein.</span>
                </div>
                <label class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer transition-colors shadow-2xs shrink-0">
                  <mat-icon class="text-xs! w-3.5! h-3.5!">upload_file</mat-icon>
                  <span>Backup File Upload Karein</span>
                  <input type="file" accept=".json" (change)="onBackupFileSelected($event)" class="hidden" id="restore-backup-input" />
                </label>
              </div>

            </div>
          }
        </div>

      </div>

      <!-- App Version & Security Footnote -->
      <div class="text-center py-2 space-y-0.5">
        <p class="text-xs font-bold text-slate-600 tracking-tight">
          OkCredit Digital Udhar Bahi Khata • Cloud Edition
        </p>
        <p class="text-[10px] text-slate-400 font-medium">
          100% Free, Safe & Secure Ledger • Direct Google Sheet Sync
        </p>
      </div>

    </div>
  `
})
export class ProfileView {
  readonly ledger = inject(Ledger);
  readonly initialTab = input<ProfileTab>(null);
  readonly openSheetModal = output<void>();
  readonly tabChange = output<ProfileTab>();

  // By default, no section is open, so no edit inputs are shown on screen
  readonly activeSection = signal<ProfileTab>(null);
  readonly upiInput = signal(this.ledger.upiId());

  // Edit sub-states: strictly false by default!
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
    // Reset any open sub-edit mode when switching
    this.isBusinessEditMode.set(false);
    this.isUpiEditMode.set(false);
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
    if (confirm('Kya aap sach me Google Sheet disconnect karna chahte hain?')) {
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
