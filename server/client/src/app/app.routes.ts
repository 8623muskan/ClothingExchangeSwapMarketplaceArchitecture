import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { MarketplaceComponent } from './components/marketplace/marketplace';
import { ItemDetailComponent } from './components/item-detail/item-detail';
import { SwapRequestComponent } from './components/swap-request/swap-request';
import { ChatComponent } from './components/chat/chat';
import { DashboardComponent } from './components/dashboard/dashboard';
import { AdminComponent } from './components/admin/admin';
import { ListItemComponent } from './components/list-item/list-item';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'marketplace',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'marketplace',
    component: MarketplaceComponent
  },

  {
    path: 'list-item',
    component: ListItemComponent
  },

  {
    path: 'item/:id',
    component: ItemDetailComponent
  },

  {
    path: 'swap/request',
    component: SwapRequestComponent
  },

  {
    path: 'chat/:swapId',
    component: ChatComponent
  },

  {
    path: 'dashboard',
    component: DashboardComponent
  },

  {
    path: 'admin',
    component: AdminComponent
  },

  {
    path: '**',
    redirectTo: 'marketplace'
  }
];