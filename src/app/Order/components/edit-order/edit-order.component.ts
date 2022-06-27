import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, EMPTY, finalize, map, Observable, startWith, switchMap, tap } from 'rxjs';
import { Customer } from 'src/app/Customer/interfaces/customer';
import { CustomersService } from 'src/app/Customer/Services/customers.service';
import { ActionStatus } from 'src/app/General/interfaces/action-status';
import { ProductOrder } from 'src/app/Order/interfaces/product-order';
import { OrdersService } from 'src/app/Order/Services/orders.service';
import { Product } from 'src/app/Product/interfaces/product';
import { ProductsService } from 'src/app/Product/Services/products.service';
import { isObject } from 'src/app/Validators/IsObjectValidator';
import { Order } from '../../interfaces/order';


@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.css']
})
export class EditOrderComponent implements OnInit {
  Customers!: Customer[];
  Products!: Product[];
  ProductAutoCompleteData!: Observable<Product[]>;
  ProductOrderId = 0;
  minDate = new Date();


  Cart!: MatTableDataSource<ProductOrder>;
  displayedColumns: string[] = ['productDescription', 'quantity', 'PoPrice', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  @ViewChild(MatAutocompleteTrigger) autoComplete!: MatAutocompleteTrigger;


  ProductForm: FormGroup = new FormGroup({
    QuantityControl: new FormControl(null, Validators.required),
    ProductSelectControl: new FormControl(null, { validators: [Validators.required, isObject] }),
  });

  OrderForm: FormGroup = new FormGroup({
    CustomerControl: new FormControl('', Validators.required),
    DatePickerControl: new FormControl('', Validators.required)
  });

  ProductPrice: number = 0;
  TotalPrice: number = 0;
  SelectedProduct!: Product;

  CreationStatus: ActionStatus = { success: true, message: "" }

  OrderFormErrorMessage!: string
  ProductFormErrorMessage!: string
  ProductExistsError!: boolean
  isLoading = false;


  constructor(
    private _productsService: ProductsService,
    private _customerService: CustomersService,
    private _orderService: OrdersService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.getCustomers();
    this.getProducts();
    this.subscribeToQuantityControlChanges();
    this.generateItemsTable([]);
    this.generateOrderData();
  }

  autoCompleteOpened() {
    this.autoCompleteInputChanged();
  }

  autoCompleteOptionSelected() {
    this.autoComplete.closePanel();
    this.SelectedProduct = this.Products[this.Products.findIndex(p => p.id == ((this.ProductForm.controls['ProductSelectControl'].value)?.id))];
    this.ProductPrice = (this.SelectedProduct?.price) * (this.ProductForm.controls['QuantityControl'].value);
  }

  autoCompleteInputChanged() {
    const value = this.ProductForm.get('ProductSelectControl')?.value;
    if (value) {
      this.autoComplete.openPanel();
    }
    else {
      this.autoComplete.closePanel();
    }
  }

  productNameDisplayFn(product: Product): string {
    return product?.description ?? '';
  }

  // generateAutoComplitData() {
  //   this.ProductAutoCompleteData = this.ProductForm.controls['ProductSelectControl']?.valueChanges.pipe(
  //     startWith(''),
  //     map(val => this._filter(val || ''))
  //   );
  // }

  generateAutoComplitData() {
    this.ProductAutoCompleteData = this.ProductForm.controls['ProductSelectControl']?.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => {this.isLoading = true; this.ProductAutoCompleteData = EMPTY}),
        switchMap(val => this._productsService.getBySearchValue(val)
          .pipe(finalize(() => this.isLoading = false),)
        )
        // startWith(''),
        // map(val => this._filter(val || ''))
      );
  }

  // _filter(value: string): Product[] {
  //   if (typeof value === 'object') { return []; }
  //   const filterValue = value?.toLowerCase();

  //   return this.Products.filter(product => product.description.toLowerCase().includes(filterValue));
  // }

  generateOrderData() {
    this.getOrder()
      .subscribe({
        next: (order: Order) => {
          this.fillOrderData(order);
        },
        error: (err) => {
          this._router.navigateByUrl('/404');
        }
      })
  }

  fillOrderData(order: Order) {
    order.productOrders.forEach(po => po.PoPrice = this.calculatePoPrice(po));

    this.generateItemsTable(order.productOrders);
    this.TotalPrice = order.payment;
    this.OrderForm.patchValue({
      CustomerControl: order.customerId,
      DatePickerControl: order.date
    });
  }

  calculatePoPrice(po: ProductOrder) {
    const productPrice = this.Products?.find(p => p.id == po.productId)?.price ?? 0
    return po.quantity * productPrice;
  }

  getOrder() {
    return this._orderService.getById(this.getOrderId())
  }

  getOrderId() {
    const orderIdstr = this._activatedRoute.snapshot.paramMap.get('id');
    const orderId = parseInt(orderIdstr ?? '');
    if (!orderId) {
      this._router.navigateByUrl('/404');
    }
    return orderId;
  }

  generateItemsTable(ProducstOrders: ProductOrder[]) {
    this.Cart = new MatTableDataSource<ProductOrder>(ProducstOrders)
    this.Cart.sort = this.sort;
    this.Cart.paginator = this.paginator;
  }

  getCustomers() {
    this._customerService.getAll().
      subscribe({
        next: (data) => { this.Customers = data },
        error: () => this.OrderFormErrorMessage = 'Something went wrong please try reloading your browser'
      });
  }

  getProducts() {
    this._productsService.getAll().
      subscribe(
        {
          next: data => {
            this.Products = data;
            this.generateAutoComplitData();
          },
          error: err => this.ProductFormErrorMessage = 'Something went wrong please try reloading your browser'
        }
      )
  }

  subscribeToQuantityControlChanges() {
    this.ProductForm.controls['QuantityControl'].valueChanges.subscribe(
      data => {
        this.ProductPrice = ((this.SelectedProduct?.price) ?? 0) * parseInt(this.ProductForm.controls['QuantityControl'].value)
      }
    )
  }

  add2cardClick() {
    if (this.ProductForm.invalid) {
      this.ProductForm.markAllAsTouched();
      return;
    }

    if (this.Cart.data.find(p => p.productId === this.SelectedProduct.id)) {
      this.ProductExistsError = true
      return;
    }
    this.ProductExistsError = false;

    this.addOrderItem2Cart()

    this.TotalPrice += (this.SelectedProduct.price) * (parseInt(this.ProductForm.get('QuantityControl')?.value));
    this.ProductForm.reset();
    this.ProductPrice = 0;
  }

  addOrderItem2Cart() {
    this.Cart.data.push({
      quantity: parseInt(this.ProductForm.get('QuantityControl')?.value),
      orderId: this.getOrderId(),
      productId: this.SelectedProduct.id,
      productDescription: this.SelectedProduct.description,
      PoPrice: (this.SelectedProduct.price) * (parseInt(this.ProductForm.get('QuantityControl')?.value))
    });
    this.generateItemsTable(this.Cart.data);
  }

  DeleteOrderItemClick(productId: number) {
    this.Cart.data.forEach((po, index) => {
      if (po.productId == productId) {
        this.Cart.data.splice(index, 1)//delete item
        this.updateTotalPrice();
        this.generateItemsTable(this.Cart.data);
        return;
      }
    });
  }

  QuantityChange(productId: number, newQuantity: string) {
    this.updateCartItem(productId, newQuantity);
    this.updateTotalPrice();
  }

  updateCartItem(productId: number, newQuantity: string) {
    const itemIndex = this.Cart.data.findIndex(i => i.productId == productId);
    const productPrice = this.Products.find(p => p.id == productId)?.price;

    this.Cart.data[itemIndex].PoPrice = parseFloat(newQuantity) * (productPrice ?? 0);
    this.Cart.data[itemIndex].quantity = parseFloat(newQuantity);
  }

  updateTotalPrice() {
    this.TotalPrice = 0;
    let productOrders = this.Cart.data;
    productOrders.forEach(po => this.TotalPrice += po.PoPrice)
  }

  saveOrderClick() {
    if (this.OrderForm.invalid) {
      this.OrderForm.markAllAsTouched();
      return;
    }

    this.updateOrder(this.Cart.data);

    this.Cart.data = [];

  }

  updateOrder(productOrders: ProductOrder[]) {
    this._orderService.update({
      id: this.getOrderId(),
      customerId: this.OrderForm.get('CustomerControl')?.value,
      productOrders: productOrders,
      payment: this.TotalPrice,
      date: this.OrderForm.get('DatePickerControl')?.value
    }).subscribe(
      {
        next: data => {
          if (!data.success) {
            this.CreationStatus = data;
            return;
          }

          this.openSnackBar('Order created successfully');
          this._router.navigateByUrl('/orders');
        },
        error: err => this.CreationStatus = { success: false, message: 'Somthing went wrong please try reloading your browser ' }
      }
    )

  }



  openSnackBar(message: string) {
    this._snackBar.open(message, 'ok', { duration: 2700, verticalPosition: 'top', horizontalPosition: 'center' });
  }

}
