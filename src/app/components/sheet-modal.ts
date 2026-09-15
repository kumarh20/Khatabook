import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/sheet-script.template';

@Component({
  selector: 'app-sheet-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="ios-sheet-backdrop">
      <div class="ios-sheet-card max-w-xl p-5 sm:p-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Modal Header -->
        <div class="pb-3 border-b border-black/[0.06] flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-[14px] bg-[#34c759]/10 text-[#34c759] flex items-center justify-center font-bold">
              <mat-icon class="text-lg! w-5! h-5!">grid_on</mat-icon>
            </div>
            <div>
              <h3 class="font-bold text-base sm:text-lg text-[#1c1c1e] tracking-tight leading-tight">Google Sheets (Excel) Sync</h3>
              <p class="text-[11px] text-[#8e8e93] font-medium">Aapka pura data direct user ke Google Drive me save rahega</p>
            </div>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-[#8e8e93] hover:text-[#1c1c1e] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            id="close-sheet-modal-btn"
          >
            <mat-icon class="text-xs! w-3.5! h-3.5!">close</mat-icon>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="pt-4 overflow-y-auto space-y-4 sm:space-y-5 pr-1">
          
          <!-- Current Status Banner -->
          <div
            class="p-3.5 rounded-[16px] bg-black/[0.03] border border-black/[0.06] flex items-center justify-between gap-3 text-xs"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0"
                [class.bg-[#34c759]]="ledger.sheetConfig().scriptUrl && ledger.sheetConfig().syncStatus === 'synced'"
                [class.bg-amber-500]="ledger.sheetConfig().syncStatus === 'syncing'"
                [class.bg-[#ff3b30]]="ledger.sheetConfig().syncStatus === 'error'"
                [class.bg-[#8e8e93]]="!ledger.sheetConfig().scriptUrl"
              ></span>
              <div class="truncate">
                @if (ledger.sheetConfig().scriptUrl) {
                  <span class="font-bold text-[#1c1c1e]">
                    {{ ledger.sheetConfig().connectedSheetName || 'Google Sheet Connected' }}
                  </span>
                  @if (ledger.sheetConfig().lastSyncedAt) {
                    <span class="text-[#8e8e93] text-[11px] ml-1">({{ ledger.sheetConfig().lastSyncedAt }})</span>
                  }
                } @else {
                  <span class="font-semibold text-[#1c1c1e]">Abhi Google Sheet link nahi hai</span>
                  <span class="text-[#8e8e93] text-[11px] ml-1">- Data direct cloud sync ke liye link karein</span>
                }
              </div>
            </div>

            @if (ledger.sheetConfig().scriptUrl) {
              <button
                type="button"
                (click)="ledger.disconnectSheet()"
                class="text-xs font-bold text-[#ff3b30] hover:underline cursor-pointer shrink-0"
                id="disconnect-sheet-btn"
              >
                Disconnect
              </button>
            }
          </div>

          <!-- 3-Tabs Feature Highlight Badge -->
          <div class="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-[16px] text-xs space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-emerald-950">
              <mat-icon class="text-xs! w-3.5! h-3.5! text-emerald-600">auto_awesome</mat-icon>
              <span>3-Tab Automatic Cloud Architecture:</span>
            </div>
            <p class="text-[11px] text-emerald-900 leading-relaxed">
              Google Sheet me 3 tabs banti hain: <strong>Customers</strong> (Grahak data), <strong>Transactions</strong> (Udhar/Jama records), aur <strong>Settings</strong> (Dukaan details, UPI ID, Custom QR Code, aur Language).
            </p>
          </div>

          <!-- Step 1 & 2: Quick Script Copy & Link Input -->
          <div class="ios-card p-4 space-y-3">
            
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#1c1c1e] tracking-tight">
                1. Google Apps Script Code
              </span>
              <button
                type="button"
                (click)="copyScriptCode()"
                class="px-3 py-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-xs font-bold text-[#1c1c1e] flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                id="copy-script-code-btn"
              >
                <mat-icon class="text-xs! w-3.5! h-3.5!">
                  {{ copied() ? 'check' : 'content_copy' }}
                </mat-icon>
                <span>{{ copied() ? 'Code Copied! ✅' : 'Copy Code' }}</span>
              </button>
            </div>

            <p class="text-xs text-[#8e8e93] leading-relaxed font-medium">
              Google Sheet me jayein: <strong>Extensions &rarr; Apps Script</strong> &rarr; Yeh code paste karein aur <strong>Deploy as Web App</strong> karein.
            </p>

            <!-- URL Input Field -->
            <div class="pt-2">
              <label for="sheet-url-input" class="block text-xs font-bold text-[#1c1c1e] mb-1.5">
                2. Deployed Web App URL Yahan Paste Karein
              </label>
              <div class="flex gap-2">
                <input
                  type="url"
                  [formControl]="urlControl"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  class="w-full px-3.5 py-2.5 bg-black/[0.04] border border-black/[0.06] rounded-[16px] text-xs font-mono text-[#1c1c1e] outline-hidden focus:bg-white focus:ring-2 focus:ring-[#007aff]/30 transition-all placeholder-[#8e8e93]"
                  id="sheet-url-input"
                />
                <button
                  type="button"
                  (click)="testAndSave()"
                  [disabled]="isTesting() || urlControl.invalid"
                  class="ios-btn-primary px-4 py-2.5 text-xs shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  id="connect-sheet-btn"
                >
                  @if (isTesting()) {
                    <mat-icon class="text-xs! w-3.5! h-3.5! animate-spin">sync</mat-icon>
                    <span>Testing...</span>
                  } @else {
                    <mat-icon class="text-xs! w-3.5! h-3.5!">link</mat-icon>
                    <span>Connect</span>
                  }
                </button>
              </div>

              @if (testMessage()) {
                <div
                  class="mt-2.5 p-3 rounded-[14px] text-xs font-semibold flex items-start gap-2 border"
                  [class.bg-emerald-50]="testSuccess()"
                  [class.border-emerald-200]="testSuccess()"
                  [class.text-emerald-800]="testSuccess()"
                  [class.bg-rose-50]="!testSuccess()"
                  [class.border-rose-200]="!testSuccess()"
                  [class.text-rose-800]="!testSuccess()"
                >
                  <mat-icon class="text-sm! w-4! h-4! shrink-0 mt-0.5">
                    {{ testSuccess() ? 'check_circle' : 'error' }}
                  </mat-icon>
                  <span>{{ testMessage() }}</span>
                </div>
              }

              @if (isPermissionError()) {
                <div class="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-[16px] text-xs text-amber-900 space-y-2">
                  <div class="flex items-center gap-1.5 font-bold text-amber-950">
                    <mat-icon class="text-sm! w-4! h-4! text-amber-600">lock_reset</mat-icon>
                    <span>Yeh Samasya Kaise Theek Karein (1-Minute Fix):</span>
                  </div>
                  <ol class="list-decimal list-inside space-y-1 text-slate-700 font-medium pl-1 text-[11px]">
                    <li>Google Sheet me jayein &rarr; <strong>Extensions</strong> &rarr; <strong>Apps Script</strong> kholein.</li>
                    <li>Upar daayein (Top-Right) me <strong>Deploy</strong> dabayein aur <strong>Manage deployments</strong> chunein.</li>
                    <li>Pencil icon (<strong>Edit</strong>) par click karein.</li>
                    <li><strong>"Who has access"</strong> dropdown me <strong>"Anyone"</strong> chunein.</li>
                    <li><strong>Version</strong> me <strong>"New version"</strong> select karein.</li>
                    <li>Neeche <strong>Deploy</strong> dabayein aur yahan dobara <strong>Connect</strong> karein!</li>
                  </ol>
                </div>
              }
            </div>

          </div>

          <!-- Actions if already configured -->
          @if (ledger.sheetConfig().scriptUrl) {
            <div class="pt-1 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                (click)="syncNow()"
                class="px-4 py-2 rounded-full bg-[#e8f8ed] hover:bg-[#d4f2dc] text-[#1b873f] text-xs font-bold flex items-center gap-1.5 border border-[#34c759]/30 transition-all cursor-pointer shadow-2xs active:scale-95"
                id="sync-now-btn"
              >
                <mat-icon class="text-xs! w-3.5! h-3.5! text-[#34c759]">cloud_upload</mat-icon>
                <span>Sheet Me Sync Karein (Push)</span>
              </button>

              <button
                type="button"
                (click)="pullFromSheet()"
                class="ios-btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                id="pull-from-sheet-btn"
              >
                <mat-icon class="text-xs! w-3.5! h-3.5!">cloud_download</mat-icon>
                <span>Sheet Se Import Karein (Pull)</span>
              </button>
            </div>
          }

          <!-- Simple Accordion Guide -->
          <div class="rounded-[18px] border border-black/[0.06] overflow-hidden">
            <button
              type="button"
              (click)="showGuide.set(!showGuide())"
              class="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-[#1c1c1e] bg-black/[0.02] hover:bg-black/[0.04] cursor-pointer transition-colors"
              id="toggle-guide-btn"
            >
              <div class="flex items-center gap-1.5">
                <mat-icon class="text-xs! w-3.5! h-3.5! text-[#34c759]">help_outline</mat-icon>
                <span>Detailed Setup Steps (2-Minute Guide)</span>
              </div>
              <mat-icon class="text-xs! w-3.5! h-3.5! text-[#8e8e93]">
                {{ showGuide() ? 'expand_less' : 'expand_more' }}
              </mat-icon>
            </button>

            @if (showGuide()) {
              <div class="p-4 bg-white text-xs text-[#8e8e93] space-y-2.5 border-t border-black/[0.06]">
                <div class="flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-black/[0.05] text-[#1c1c1e] font-bold flex items-center justify-center shrink-0 text-2xs">1</span>
                  <p>
                    Apne Google Drive me naya Google Sheet banayein (ya <a href="https://sheets.new" target="_blank" class="text-[#007aff] underline font-semibold">sheets.new</a> kholein).
                  </p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-black/[0.05] text-[#1c1c1e] font-bold flex items-center justify-center shrink-0 text-2xs">2</span>
                  <p>
                    Sheet ke top menu me <strong>Extensions</strong> &rarr; <strong>Apps Script</strong> par click karein.
                  </p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-black/[0.05] text-[#1c1c1e] font-bold flex items-center justify-center shrink-0 text-2xs">3</span>
                  <p>
                    Upar diye gaye <strong>"Copy Apps Script"</strong> button se code copy karke wahan paste kar dein.
                  </p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-black/[0.05] text-[#1c1c1e] font-bold flex items-center justify-center shrink-0 text-2xs">4</span>
                  <p>
                    Top-right me <strong>Deploy &rarr; New deployment &rarr; Web app</strong> chunein.<br>
                    <strong>Who has access: Anyone</strong> rakhein aur Deploy karein.
                  </p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-black/[0.05] text-[#1c1c1e] font-bold flex items-center justify-center shrink-0 text-2xs">5</span>
                  <p>
                    Mile hue Web App URL ko yahan paste karke <strong>Connect</strong> dabayein!
                  </p>
                </div>
              </div>
            }
          </div>

        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-black/[0.06] flex items-center justify-end shrink-0">
          <button
            type="button"
            (click)="closeModal.emit()"
            class="ios-btn-secondary px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer"
            id="done-sheet-modal-btn"
          >
            Theek Hai (Done)
          </button>
        </div>

      </div>
    </div>
  `
})
export class SheetModal {
  readonly ledger = inject(Ledger);
  readonly closeModal = output<void>();

  readonly urlControl = new FormControl<string>(this.ledger.sheetConfig().scriptUrl || '', [Validators.required]);
  readonly copied = signal(false);
  readonly isTesting = signal(false);
  readonly testMessage = signal<string | null>(null);
  readonly testSuccess = signal(false);
  readonly isPermissionError = signal(false);
  readonly showGuide = signal(false);

  copyScriptCode(): void {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 3000);
  }

  async testAndSave(): Promise<void> {
    const url = this.urlControl.value?.trim() || '';
    if (!url) return;

    this.isTesting.set(true);
    this.testMessage.set(null);
    this.isPermissionError.set(false);

    const res = await this.ledger.testConnection(url);
    this.isTesting.set(false);
    this.testSuccess.set(res.success);
    this.testMessage.set(res.message);
    this.isPermissionError.set(!!res.isPermissionError);

    if (res.success) {
      this.ledger.saveSheetConfig(url, true, res.sheetName || 'Google Sheet');
      this.ledger.showToast('Google Sheet jud gayi! Ab sabhi records direct sheet me automatically sync honge.', 'success');
    }
  }

  async syncNow(): Promise<void> {
    await this.ledger.syncWithGoogleSheet(true);
  }

  async pullFromSheet(): Promise<void> {
    await this.ledger.pullFromGoogleSheet(true);
  }
}
