import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, map, Observable, of, tap } from 'rxjs';
import { Customer } from 'src/app/Customer/interfaces/customer';
import { CustomersService } from 'src/app/Customer/Services/customers.service';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { DateWithoutTime } from 'src/app/General/Models/date-without-time';
import { ProductOrder } from 'src/app/Order/interfaces/product-order';
import { OrdersService } from 'src/app/Order/Services/orders.service';
import { Product } from 'src/app/Product/interfaces/product';
import { ProductsService } from 'src/app/Product/Services/products.service';
import { autoCompleteValidat } from 'src/app/Validators/autocomplete-validator';
import { notZero } from 'src/app/Validators/number-validator';
import { Order } from '../../interfaces/order';


@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.scss']
})
export class EditOrderComponent implements OnInit {
  Customers!: Customer[];
  Products!: Product[];
  ProductAutoCompleteData: Product[] = [];
  ProductOrderId = 0;
  minDate = new Date();

  prevOrder!: Order;
  Cart!: MatTableDataSource<ProductOrder>;
  displayedColumns: string[] = ['productDescription', 'quantity', 'PoPrice', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  ProductForm: FormGroup = new FormGroup({
    QuantityControl: new FormControl(null, { validators: [Validators.required, notZero]}),
    ProductNameControl: new FormControl(null, { validators: [Validators.required, autoCompleteValidat(this.ProductAutoCompleteData)] }),
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

  tmpflag = false;

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

  datePickerFilter = (date: DateWithoutTime | null): boolean => { return true; }

  productNameDisplayFn(product: Product): string {
    return product?.description ?? '';
  }

  generateAutoComplitData() {
    this.ProductForm.controls['ProductNameControl']?.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap(() => this.isLoading = true),
        debounceTime(1000),
        distinctUntilChanged(),
      )
      .subscribe(
        {
          next: val => {
            console.log('Product Name Change', val);
            this.removeProductNameValidators();
            this.fillAutoComplete(val);
          }
        }
      );
  }

  fillAutoComplete(val: string) {
    this.getProductsBySearchValue(val)
      .subscribe(
        {
          next: products => {
            this.ProductAutoCompleteData = products;
            this.addProductNameValidators();
            if (this.ProductForm.controls['ProductNameControl'].valid) {
              this.setSelectedProductByInputValue();
            }
          }
        }
      )
  }

  removeProductNameValidators() {
    this.ProductForm.controls['ProductNameControl'].clearValidators()
    this.ProductForm.controls['ProductNameControl'].updateValueAndValidity();
  }

  addProductNameValidators() {
    this.ProductForm.controls['ProductNameControl'].addValidators([autoCompleteValidat(this.ProductAutoCompleteData), Validators.required])
    this.ProductForm.controls['ProductNameControl'].updateValueAndValidity();
  }

  setSelectedProductByInputValue() {
    const index = this.Products.findIndex(product => product.description == this.ProductForm.controls['ProductNameControl'].value);
    if (index == -1) {
      this.ProductFormErrorMessage = 'Product not-found';
      this.ProductForm.reset();
      return;
    }
    this.SelectedProduct = this.Products[index];
  }

  getProductsBySearchValue(val: string) {
    return (
      val ?
        this._productsService.getBySearchValue(val).pipe(map(data => {
          return data;
        }))
        : of([])
    ).pipe(finalize(() => {
      this.isLoading = false;
    }));
  }

  generateOrderData() {
    this.getOrder()
      .subscribe({
        next: (order: Order) => {
          this.prevOrder = JSON.parse(JSON.stringify(order));
          this.setDatePickerFilter();
          this.fillOrderData(order);
        },
        error: (err) => {
          this._router.navigateByUrl('/404');
        }
      })
  }

  setDatePickerFilter() {
    console.log('setDatePickerFilter');

    this.datePickerFilter = (date: Date | null): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date?.setHours(0, 0, 0, 0);
      return (date ?? today) >= today || date?.toLocaleDateString() == new Date(this.prevOrder?.date).toLocaleDateString();
    };
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

  generateItemsTable(productsOrders: ProductOrder[] = this.Cart.data) {
    this.Cart = new MatTableDataSource<ProductOrder>(JSON.parse(JSON.stringify(productsOrders)));
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

    this.selectedProductQuantityIsInStock()
      .subscribe(
        (res: number) => {
          if (res >= parseInt(this.ProductForm.get('QuantityControl')?.value)) {
            this.addOrderItem2Cart()
            this.TotalPrice += (this.SelectedProduct.price) * (parseInt(this.ProductForm.get('QuantityControl')?.value));
            this.ProductForm.reset();
            this.ProductPrice = 0;
            this.ProductFormErrorMessage = '';
          }
          else {
            this.ProductFormErrorMessage = res ? `There are only ${res} units in stock` : 'The product ran out of stock';
          }
        }
      )
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

  selectedProductQuantityIsInStock(): Observable<number> {
    return this._productsService.IsInStock(this.SelectedProduct.id, (parseInt(this.ProductForm.get('QuantityControl')?.value)))
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

  cartItemQuantityChange(productId: number, quantity: string) {
    const errorMessage = this.quantityIsZeroValidator( quantity);
    if (errorMessage) {
      this.updateCartItem(productId, '1', errorMessage);
      return;
    }

    const prevQuantity = this.prevOrder?.productOrders.find(p => p.productId == productId)?.quantity ?? 0;

    const difference = parseInt(quantity) - prevQuantity;

    this.clearProductOrderErrorMessage(productId);

    this.validateQuantityInput(productId, quantity);
    if (difference == NaN) {
      throw new Error("Quantity must be a number");
    }

    const newQuantity = difference > 0 ? difference : 0

    this._productsService.IsInStock(productId, newQuantity)
      .subscribe(
        {
          next: (res: number) => {
            if (res >= difference) {
              this.updateCartItem(productId, quantity);
            }
            else {
              this.updateCartItem(productId, '1', res ? `There are only ${res} units in stock` : 'The product ran out of stock');
            }
            this.updateTotalPrice();
          },
          error: err => console.log(err)
        }
      )
  }

  parseQuantityValidator(productId: number, quantityStr: string) {
    const quantity = parseFloat(quantityStr);
    let errorMessage = '';

    if (quantity == NaN) {
      errorMessage = 'Quantity must be a number.';
    }
    return errorMessage;
  }

  quantityIsZeroValidator(quantityStr: string) {
    if (quantityStr == '0') {
      return 'Quantity cant be zero.';
    }
    return ''
  }

  validateQuantityInput(productId: number, quantityStr: string) {
    let errorMessage = '';
    errorMessage = this.quantityIsZeroValidator( quantityStr);
    errorMessage = errorMessage ?? this.parseQuantityValidator(productId, quantityStr);

    console.log('errorMessage: ', errorMessage);

    if(errorMessage) this.setProductOrderErrorMessage(productId, errorMessage);
  }

  clearProductOrderErrorMessage(productId: number) {
    this.Cart.data.some(productOrder => {
      if (productOrder.productId == productId) {
        productOrder.errorMessage = "";
        return true;
      }
      return false;
    })
  }

  setProductOrderErrorMessage(productId: number, errorMessage: string) {
    this.Cart.data.some(productOrder => {
      if (productOrder.productId == productId) {
        productOrder.errorMessage = errorMessage;
        return true;
      }
      return false;
    })
    throw new Error(errorMessage);
  }

  updateCartItem(productId: number, newQuantity: string, errorMessage: string = '') {
    const productPrice = this.Products.find(p => p.id == productId)?.price;

    this.Cart.data.some(productOrder => {
      if (productOrder.productId == productId) {
        productOrder.PoPrice = parseFloat(newQuantity) * (productPrice ?? 0);
        productOrder.quantity = parseFloat(newQuantity);
        productOrder.errorMessage = errorMessage;
        return true;
      }
      return false;
    })
    this.generateItemsTable();
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

          this.openSnackBar('Order updated successfully');
          this._router.navigateByUrl('/orders');
        },
        error: err => this.CreationStatus = { success: false, message: 'Somthing went wrong please try reloading your browser ' }
      }
    )
  }

  openSnackBar(message: string, _duration: number = 2700) {
    this._snackBar.open(message, 'ok', { duration: _duration, verticalPosition: 'top', horizontalPosition: 'center' });
  }

}
