import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from '../services/ledger';
import { I18nService } from '../services/i18n';

@Component({
  selector: 'app-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-200/80 px-6 pt-2 pb-5 shadow-[0_-6px_25px_rgba(100,125,160,0.08)]">
      <div class="max-w-md mx-auto flex items-center justify-around">
        
        <!-- Tab 1: Dashboard -->
        <button
          type="button"
          (click)="viewChange.emit('dashboard')"
          class="flex flex-col items-center justify-center min-w-[72px] cursor-pointer active:scale-90 transition-all"
          [class.text-[#007aff]]="currentView() === 'dashboard'"
          [class.text-slate-400]="currentView() !== 'dashboard'"
          id="bottom-tab-dashboard"
        >
          <div
            class="w-10 h-7 rounded-full flex items-center justify-center transition-colors"
            [class.bg-[#eff6ff]]="currentView() === 'dashboard'"
          >
            <mat-icon class="text-xl! w-5! h-5! transition-colors">grid_view</mat-icon>
          </div>
          <span class="text-[10px] font-bold tracking-tight mt-0.5" [class.text-[#007aff]]="currentView() === 'dashboard'">
            {{ i18n.t().dashboard }}
          </span>
        </button>

        <!-- Tab 2: Grahak List -->
        <button
          type="button"
          (click)="viewChange.emit('customers')"
          class="flex flex-col items-center justify-center min-w-[72px] cursor-pointer active:scale-90 transition-all relative"
          [class.text-[#007aff]]="currentView() === 'customers'"
          [class.text-slate-400]="currentView() !== 'customers'"
          id="bottom-tab-customers"
        >
          <div
            class="w-10 h-7 rounded-full flex items-center justify-center transition-colors relative"
            [class.bg-[#eff6ff]]="currentView() === 'customers'"
          >
            <mat-icon class="text-xl! w-5! h-5! transition-colors">people</mat-icon>
            
            @if (ledger.overview().dueCustomerCount > 0) {
              <span class="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#ff3b30] text-white text-[9px] font-black leading-tight border-2 border-white shadow-xs">
                {{ ledger.overview().dueCustomerCount }}
              </span>
            }
          </div>
          <span class="text-[10px] font-bold tracking-tight mt-0.5" [class.text-[#007aff]]="currentView() === 'customers'">
            {{ i18n.t().customers }}
          </span>
        </button>

        <!-- Tab 3: Profile & Settings -->
        <button
          type="button"
          (click)="viewChange.emit('profile')"
          class="flex flex-col items-center justify-center min-w-[72px] cursor-pointer active:scale-90 transition-all"
          [class.text-[#007aff]]="currentView() === 'profile'"
          [class.text-slate-400]="currentView() !== 'profile'"
          id="bottom-tab-profile"
        >
          <div
            class="w-10 h-7 rounded-full flex items-center justify-center transition-colors"
            [class.bg-[#eff6ff]]="currentView() === 'profile'"
          >
            <mat-icon class="text-xl! w-5! h-5! transition-colors">storefront</mat-icon>
          </div>
          <span class="text-[10px] font-bold tracking-tight mt-0.5" [class.text-[#007aff]]="currentView() === 'profile'">
            {{ i18n.t().dukaan }}
          </span>
        </button>

      </div>
    </nav>
  `
})
export class BottomNav {
  readonly ledger = inject(Ledger);
  readonly i18n = inject(I18nService);
  readonly currentView = input<'dashboard' | 'customers' | 'profile'>('dashboard');
  readonly viewChange = output<'dashboard' | 'customers' | 'profile'>();
}
