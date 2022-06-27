import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './Customer/components/customers/customers.component';
import { NotFoundComponent } from './General/components/not-found/not-found.component';
import { CreateOrderComponent } from './Order/components/create-order/create-order.component';
import { EditOrderComponent } from './Order/components/edit-order/edit-order.component';
import { OrdersComponent } from './Order/components/orders/orders.component';
import { ProductsComponent } from './Product/components/products/products.component';

const routes: Routes = [
  { path: 'customers', component: CustomersComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'create-order', component: CreateOrderComponent },
  { path: 'edit-order/:id', component: EditOrderComponent },
  { path: '404', component: NotFoundComponent },
  {path:'**',redirectTo:'404'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
