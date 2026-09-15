import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Ledger } from './services/ledger';
import { Header } from './components/header';
import { BottomNav } from './components/bottom-nav';
import { DashboardView } from './components/dashboard-view';
import { CustomerList } from './components/customer-list';
import { ProfileTab, ProfileView } from './components/profile-view';
import { CustomerDetail } from './components/customer-detail';
import { CustomerModal } from './components/customer-modal';
import { TransactionModal } from './components/transaction-modal';
import { SheetModal } from './components/sheet-modal';
import { StatementModal } from './components/statement-modal';
import { Customer, Transaction, TransactionType } from './models/ledger.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    MatIconModule,
    Header,
    BottomNav,
    DashboardView,
    CustomerList,
    ProfileView,
    CustomerDetail,
    CustomerModal,
    TransactionModal,
    SheetModal,
    StatementModal
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly ledger = inject(Ledger);

  readonly customerListRef = viewChild<CustomerList>('customerListRef');

  // Main navigation section state: 'dashboard' | 'customers' | 'profile'
  readonly currentView = signal<'dashboard' | 'customers' | 'profile'>('dashboard');

  // Active filter for customer list: 'all' | 'due' | 'advance' | 'settled'
  readonly customerFilter = signal<'all' | 'due' | 'advance' | 'settled'>('all');

  // Active sub-tab inside Profile section: 'business' | 'payment' | 'sheet' | 'backup' | null
  readonly profileTab = signal<ProfileTab>(null);

  // Modals state
  readonly isCustomerModalOpen = signal(false);
  readonly editingCustomer = signal<Customer | null>(null);

  readonly isTxModalOpen = signal(false);
  readonly txModalType = signal<TransactionType>('gave');
  readonly editingTx = signal<Transaction | null>(null);

  readonly isSheetModalOpen = signal(false);
  readonly isStatementModalOpen = signal(false);

  // Navigation handlers
  switchView(view: 'dashboard' | 'customers' | 'profile'): void {
    this.ledger.selectCustomer(null);
    if (view === 'profile') {
      this.profileTab.set(null);
    }
    this.currentView.set(view);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToProfileWithTab(tab: ProfileTab = null): void {
    this.ledger.selectCustomer(null);
    this.profileTab.set(tab);
    this.currentView.set('profile');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToCustomersWithFilter(filter: 'all' | 'due' | 'advance' | 'settled'): void {
    this.ledger.selectCustomer(null);
    this.customerFilter.set(filter);
    this.currentView.set('customers');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onSelectCustomer(id: string): void {
    this.ledger.selectCustomer(id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Modals & CRUD Handlers
  openAddCustomer(): void {
    if (!this.ledger.sheetConfig().scriptUrl) {
      this.ledger.showToast('Kripya pehle Google Sheet connect karein taaki aapka data direct Sheet me save ho sake!', 'info');
      this.isSheetModalOpen.set(true);
      return;
    }
    this.editingCustomer.set(null);
    this.isCustomerModalOpen.set(true);
  }

  openEditCustomer(): void {
    this.editingCustomer.set(this.ledger.activeCustomer());
    this.isCustomerModalOpen.set(true);
  }

  closeCustomerModal(): void {
    this.isCustomerModalOpen.set(false);
    this.editingCustomer.set(null);
  }

  openAddTransaction(type: TransactionType): void {
    this.txModalType.set(type);
    this.editingTx.set(null);
    this.isTxModalOpen.set(true);
  }

  openEditTransaction(tx: Transaction): void {
    this.editingTx.set(tx);
    this.txModalType.set(tx.type);
    this.isTxModalOpen.set(true);
  }

  closeTxModal(): void {
    this.isTxModalOpen.set(false);
    this.editingTx.set(null);
  }
}
