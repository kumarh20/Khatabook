import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';

@Component({
  selector: 'app-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-4 py-2 shadow-lg">
      <div class="max-w-md mx-auto flex items-center justify-around">
        
        <!-- Tab 1: Dashboard -->
        <button
          type="button"
          (click)="viewChange.emit('dashboard')"
          class="flex flex-col items-center justify-center min-w-[72px] min-h-[44px] rounded-2xl transition-all cursor-pointer relative"
          [class.text-blue-600]="currentView() === 'dashboard'"
          [class.text-slate-500]="currentView() !== 'dashboard'"
          id="bottom-tab-dashboard"
        >
          <div
            class="w-10 h-7 rounded-full flex items-center justify-center transition-colors"
            [class.bg-blue-50]="currentView() === 'dashboard'"
          >
            <mat-icon class="text-base! w-5! h-5!">dashboard</mat-icon>
          </div>
          <span class="text-[11px] font-extrabold mt-0.5" [class.text-blue-600]="currentView() === 'dashboard'">
            Dashboard
          </span>
        </button>

        <!-- Tab 2: Grahak List -->
        <button
          type="button"
          (click)="viewChange.emit('customers')"
          class="flex flex-col items-center justify-center min-w-[72px] min-h-[44px] rounded-2xl transition-all cursor-pointer relative"
          [class.text-blue-600]="currentView() === 'customers'"
          [class.text-slate-500]="currentView() !== 'customers'"
          id="bottom-tab-customers"
        >
          <div
            class="w-10 h-7 rounded-full flex items-center justify-center transition-colors relative"
            [class.bg-blue-50]="currentView() === 'customers'"
          >
            <mat-icon class="text-base! w-5! h-5!">people</mat-icon>
            
            @if (ledger.overview().dueCustomerCount > 0) {
              <span class="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black leading-tight border border-white shadow-2xs">
                {{ ledger.overview().dueCustomerCount }}
              </span>
            }
          </div>
          <span class="text-[11px] font-extrabold mt-0.5" [class.text-blue-600]="currentView() === 'customers'">
            Grahak List
          </span>
        </button>

        <!-- Tab 3: Profile & Dukan -->
        <button
          type="button"
          (click)="viewChange.emit('profile')"
          class="flex flex-col items-center justify-center min-w-[72px] min-h-[44px] rounded-2xl transition-all cursor-pointer relative"
          [class.text-blue-600]="currentView() === 'profile'"
          [class.text-slate-500]="currentView() !== 'profile'"
          id="bottom-tab-profile"
        >
          <div
            class="w-10 h-7 rounded-full flex items-center justify-center transition-colors"
            [class.bg-blue-50]="currentView() === 'profile'"
          >
            <mat-icon class="text-base! w-5! h-5!">storefront</mat-icon>
          </div>
          <span class="text-[11px] font-extrabold mt-0.5" [class.text-blue-600]="currentView() === 'profile'">
            Profile
          </span>
        </button>

      </div>
    </nav>
  `
})
export class BottomNav {
  readonly ledger = inject(Ledger);
  readonly currentView = input<'dashboard' | 'customers' | 'profile'>('dashboard');
  readonly viewChange = output<'dashboard' | 'customers' | 'profile'>();
}
