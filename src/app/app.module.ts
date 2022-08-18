import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from './app-material/app-material.module';
import { NavbarComponent } from './General/components/navbar/navbar.component';
import { CustomersComponent } from './Customer/components/customers/customers.component';
import { HttpClientModule } from '@angular/common/http';
import { CreateCustomerDialogComponent } from './Customer/Dialogs/create-customer-dialog/create-customer-dialog.component';
import { EditCustomerDialogComponent } from './Customer/Dialogs/edit-customer-dialog/edit-customer-dialog.component';
import { CustomerInfoDialogComponent } from './Customer/Dialogs/customer-info-dialog/customer-info-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductsComponent } from './Product/components/products/products.component';
import { OrdersComponent } from './Order/components/orders/orders.component';
import { CreateProductDialogComponent } from './Product/Dialogs/create-product-dialog/create-product-dialog.component';
import { CreateOrderComponent } from './Order/components/create-order/create-order.component';
import { OrderItemsListComponent } from './Order/Dialogs/order-items-list/order-items-list.component';
import { EditOrderComponent } from './Order/components/edit-order/edit-order.component';
import { NotFoundComponent } from './General/components/not-found/not-found.component';
import { EditProductDialogComponent } from './Product/Dialogs/edit-product-dialog/edit-product-dialog.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { TableFiltersComponent } from './Order/components/table-filters/table-filters.component';
import { SignalrService } from './SignalR/signalr.service';
import { PhoneNumberControlComponent } from './General/components/phone-number-control/phone-number-control.component';
import { OnlyNumberDirective } from './General/Directives/only-number.directive';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CustomersComponent,
    CreateCustomerDialogComponent,
    EditCustomerDialogComponent,
    CustomerInfoDialogComponent,
    ProductsComponent,
    OrdersComponent,
    CreateProductDialogComponent,
    CreateOrderComponent,
    OrderItemsListComponent,
    EditOrderComponent,
    NotFoundComponent,
    EditProductDialogComponent,
    TableFiltersComponent,
    PhoneNumberControlComponent,
    OnlyNumberDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [
    // { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
    // SignalrService,
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: (signalrService: SignalrService) => () => signalrService.startConnection(),
    //   deps: [SignalrService],
    //   multi: true,
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
