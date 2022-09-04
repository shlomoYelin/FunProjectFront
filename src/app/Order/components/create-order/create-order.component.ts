import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Observable, map, of } from 'rxjs';
import { Customer } from 'src/app/Customer/interfaces/customer';
import { CustomersService } from 'src/app/Customer/Services/customers.service';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { ProductOrder } from 'src/app/Order/interfaces/product-order';
import { OrdersService } from 'src/app/Order/Services/orders.service';
import { Product } from 'src/app/Product/interfaces/product';
import { ProductsService } from 'src/app/Product/Services/products.service';
import { autoCompleteValidat } from 'src/app/Validators/autocomplete-validator';
import { notZero } from 'src/app/Validators/number-validator';


@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent implements OnInit {
  Customers!: Customer[]
  Products!: Product[]
  ProductOrderId = 0;
  minDate = new Date();

  ProductAutoCompleteData: Product[] = [];


  Cart!: MatTableDataSource<ProductOrder>;
  displayedColumns: string[] = ['productDescription', 'quantity', 'PoPrice', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;


  ProductForm: FormGroup = new FormGroup({
    QuantityControl: new FormControl(null, Validators.compose([Validators.required, notZero])),
    ProductNameControl: new FormControl(null, { validators: [Validators.required, autoCompleteValidat(this.ProductAutoCompleteData)] }),
  });

  OrderForm: FormGroup = new FormGroup({
    CustomerControl: new FormControl('', Validators.required),
    DatePickerControl: new FormControl('', { validators: [Validators.required] })
  });

  ProductPrice: number = 0;
  TotalPrice: number = 0;
  SelectedProduct!: Product;

  CreationStatus: ActionStatus = { success: true, message: "" }

  OrderFormErrorMessage!: string
  ProductFormErrorMessage!: string
  isLoading = false;

  tmpflag = false;

  constructor(
    private _productsService: ProductsService,
    private _customerService: CustomersService,
    private _orderService: OrdersService,
    private _snackBar: MatSnackBar,
    private _router: Router) { }

  ngOnInit(): void {
    this.setDefaultsValues();
    this.getCustomers();
    this.getProducts();
    this.subscribeToQuantityControlChanges();
    this.generateItemsTable([]);
  }

  setDefaultsValues() {
    this.OrderForm.get('DatePickerControl')?.setValue(new Date());
  }

  productNameDisplayFn(product: Product): string {
    return product?.description ?? '';
  }

  generateAutoComplitData() {
    this.ProductForm.controls['ProductNameControl']?.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
      )
      .subscribe(
        {
          next: val => {
            this.isLoading = true;
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
    )
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      );
  }

  generateItemsTable(productsOrders: ProductOrder[] = this.Cart.data) {
    this.Cart = new MatTableDataSource<ProductOrder>(JSON.parse(JSON.stringify(productsOrders)))
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

    if (this.findProductOrderInCart(this.SelectedProduct.id)) {
      this.ProductFormErrorMessage = 'Product already exists in this order';
      return;
    }

    this.selectedProductQuantityIsInStock()
      .subscribe(
        {
          next: (res: number) => {
            if (res >= parseInt(this.ProductForm.get('QuantityControl')?.value)) {
              this.addOrderItem2Cart()
              this.updateTotalPrice();
              this.resetProductForm();
            }
            else {
              this.ProductFormErrorMessage = res ? `There are only ${res} units in stock` : 'The product ran out of stock';
            }
          },
          error: err => this.ProductFormErrorMessage = err
        }
      )
  }

  addOrderItem2Cart() {
    this.Cart.data.push({
      quantity: parseInt(this.ProductForm.get('QuantityControl')?.value),
      orderId: 0,
      productId: this.SelectedProduct.id,
      productDescription: this.SelectedProduct.description,
      PoPrice: this.getSelectedProductTotalPrice()
    });
    this.generateItemsTable(this.Cart.data);
  }

  getSelectedProductTotalPrice() {
    return (this.SelectedProduct.price) * (parseInt(this.ProductForm.get('QuantityControl')?.value));
  }

  findProductOrderInCart(productId: number): ProductOrder | undefined {
    return this.Cart.data.find(p => p.productId == this.SelectedProduct.id);
  }

  selectedProductQuantityIsInStock(): Observable<number> {
    return this._productsService.IsInStock(this.SelectedProduct.id, (parseInt(this.ProductForm.get('QuantityControl')?.value)))
  }

  updateTotalPrice() {
    this.TotalPrice = 0;
    let productOrders = this.Cart.data;
    productOrders.forEach(po => this.TotalPrice += po.PoPrice)
  }

  resetProductForm() {
    this.ProductFormErrorMessage = '';
    this.ProductForm.reset();
    this.ProductPrice = 0;
  }

  DeleteOrderItemClick(productId: number) {
    this.Cart.data.forEach((po, index) => {
      if (po.productId == productId) {
        this.TotalPrice -= po.PoPrice
        this.Cart.data.splice(index, 1)//delete item
        this.generateItemsTable(this.Cart.data);
        return;
      }
    });
  }

  QuantityChange(productId: number, newQuantity: string) {
    const errorMessage = this.quantityIsZeroValidator(newQuantity);
    if (errorMessage) {
      this.updateCartItem(productId, 1, errorMessage);
      return;
    }

    const quantity = parseInt(newQuantity);
    this.validateProductOrderQuantityInput(productId, newQuantity)

    this.clearProductOrderErrorMessage(productId);


    this._productsService.IsInStock(productId, quantity)
      .subscribe(
        {
          next: (res: number) => {
            if (res >= quantity) {
              this.updateCartItem(productId, quantity);
            }
            else {
              this.updateCartItem(productId, 1, res ? `There are only ${res} units in stock` : 'The product ran out of stock')
            }
            this.updateTotalPrice();
          }
        }
      )
  }

  validateProductOrderQuantityInput(productId: number, quantityStr: string) {
    const quantity = parseFloat(quantityStr);
    let errorMessage = '';

    if (quantity == NaN) {
      errorMessage = 'Quantity must be a number.';
      this.setProductOrderErrorMessage(productId, errorMessage);
      throw new Error("Quantity must be a number");
    }

    this.setProductOrderErrorMessage(productId, errorMessage);
  }

  clearProductOrderErrorMessage(productId: number) {
    this.setProductOrderErrorMessage(productId, '');
  }

  quantityIsZeroValidator(quantityStr: string) {
    if (quantityStr == '0') {
      return 'Quantity cant be zero.';
    }
    return ''
  }

  setProductOrderErrorMessage(productId: number, errorMessage: string) {
    this.Cart.data.some(productOrder => {
      if (productOrder.productId == productId) {
        productOrder.errorMessage = errorMessage;
        return true;
      }
      return false;
    })
  }

  updateCartItem(productId: number, newQuantity: number, errorMessage: string = '') {
    const productPrice = this.Products.find(p => p.id == productId)?.price;

    this.Cart.data.some(productOrder => {
      if (productOrder.productId == productId) {
        productOrder.PoPrice = newQuantity * (productPrice ?? 0);
        productOrder.quantity = newQuantity;
        productOrder.errorMessage = errorMessage;
        return true;
      }
      return false;
    })

    this.generateItemsTable();
  }

  createOrderClick() {
    if (this.OrderForm.invalid) {
      this.OrderForm.markAllAsTouched();
      return;
    }

    this.createOrder(this.Cart.data);

    this.Cart.data = [];
  }

  createOrder(productOrders: ProductOrder[]) {
    this._orderService.create({
      id: 0,
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