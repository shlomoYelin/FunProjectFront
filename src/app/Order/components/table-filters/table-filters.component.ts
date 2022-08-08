import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, Observable, pipe, skipWhile, switchMap, tap } from 'rxjs';
import { CustomerType } from 'src/app/Customer/Enums/customer-type';
import { Customer } from 'src/app/Customer/interfaces/customer';
import { CustomersService } from 'src/app/Customer/Services/customers.service';
import { DateRange } from 'src/app/General/Models/date-range';
import { Product } from 'src/app/Product/interfaces/product';
import { ProductsService } from 'src/app/Product/Services/products.service';
import { OrderFiltersValuesModel } from '../../Models/order-filters-values-model';

@Component({
  selector: 'app-table-filters',
  templateUrl: './table-filters.component.html',
  styleUrls: ['./table-filters.component.scss']
})
export class TableFiltersComponent implements OnInit {
  @Output() filter = new EventEmitter<OrderFiltersValuesModel>();
  @Output() getCsv = new EventEmitter<OrderFiltersValuesModel>();

  filtersForm = new FormGroup({
    productNameControl: new FormControl(''),
    customerNameControl: new FormControl(''),
    customerTypeControl: new FormControl(null)
  });

  dateRange = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });
  isProductsLoading = false;
  isCustomersLoading = false;

  btnfilterText: 'Get all orders' | 'Filter' = 'Get all orders';

  customerType!: CustomerType

  filtersValues: OrderFiltersValuesModel = {};

  productsAutoCompleteData!: Product[];
  customersAutoCompleteData!: Customer[];




  constructor(private _customersService: CustomersService, private _productsService: ProductsService) { }

  ngOnInit(): void {
    this.subscribeToControlsChange();
    this.generateAutoComplitsData();
  }

  getTypeValue(type: CustomerType): string {
    return CustomerType[type]
  }

  generateAutoComplitsData() {
    this.generateCustomersAutoComplete();
    this.generateProductsAutoComplete();
  }

  generateProductsAutoComplete() {
    this.filtersForm.controls['productNameControl'].valueChanges
      .pipe(
        tap(() => this.isProductsLoading = true),
        debounceTime(1000),
        distinctUntilChanged(),
        filter(val => {
          if (val == '') {
            this.productsAutoCompleteData = [];
            this.isProductsLoading = false;
            return false;
          }
          return true;
          new Blob
        }),
        // skipWhile(val => {
        //   if (val == '') {
        //     this.productsAutoCompleteData = [];
        //     return true;
        //   }
        //   return false;
        // }),
      )
      .subscribe({
        next: val => {
          this._productsService.getBySearchValue(val)
            .subscribe(
              {
                next: products => {
                  this.productsAutoCompleteData = products;
                  this.isProductsLoading = false;
                }
              }
            );
        }
      });
  }

  generateCustomersAutoComplete() {
    this.filtersForm.controls['customerNameControl'].valueChanges
      .pipe(
        tap(() => this.isCustomersLoading = true),
        debounceTime(1000),
        distinctUntilChanged(),
        filter(val => {
          if (val == '') {
            this.customersAutoCompleteData = [];
            this.isCustomersLoading = false;
            return false;
          }
          return true;
        }),
      )
      .subscribe({
        next: val => {
          this._customersService.getBySearchValue(val)
            .subscribe(
              {
                next:
                  customers => {
                    this.customersAutoCompleteData = customers;
                    this.isCustomersLoading = false;
                  }
              }
            );
        }
      });
  }

  subscribeToControlsChange() {
    this.subscribeToProductNameChange();
    this.subscribeToDateRangeChange();
    this.subscribeToCustomerNameChange();
    this.subscribeTocustomerTypeChange();

    this.filtersForm.valueChanges.subscribe(_ => this.getBtnText());
    this.dateRange.valueChanges.subscribe(_ => this.getBtnText());
  }

  updateFiltersValues() {
    this.filtersValues = {
      customerNameSearchValue: this.filtersForm.controls['customerNameControl'].value,
      productNameSearchValue: this.filtersForm.controls['productNameControl'].value,
      customerType: CustomerType[this.filtersForm.controls['customerTypeControl'].value as keyof typeof CustomerType],
      dateRange: this.dateRange.value
    };
    this.btnfilterText = 'Filter';
  }

  subscribeToProductNameChange() {
    this.filtersForm.controls['productNameControl'].valueChanges
      .subscribe(_ => this.filtersValues.productNameSearchValue = this.filtersForm.controls['productNameControl'].value);
  }

  subscribeToCustomerNameChange() {
    this.filtersForm.controls['customerNameControl'].valueChanges
      .subscribe(_ => this.filtersValues.customerNameSearchValue = this.filtersForm.controls['customerNameControl'].value);
  }

  subscribeTocustomerTypeChange() {
    this.filtersForm.controls['customerTypeControl'].valueChanges
      .subscribe(
        value => {
          if (value == 'all') {
            this.filtersForm.get('customerTypeControl')?.reset();
            return;
          }
          else {
            this.filtersValues.customerType = CustomerType[this.filtersForm.controls['customerTypeControl'].value as keyof typeof CustomerType];
          }
        }
      );
  }

  subscribeToDateRangeChange() {
    this.dateRange.valueChanges
      .subscribe(
        (value: DateRange) => {
          this.filtersValues.dateRange = this.dateRange.value;
        }
      );
  }

  getCustomersTypse() {
    return Object.keys(CustomerType).filter((item) => {
      return isNaN(Number(item));
    });
  }

  getBtnText() {
    this.btnfilterText = Object.values(this.filtersValues)
      .some(v => v !== null && typeof v !== "undefined" && v !== '') ? 'Filter' : 'Get all orders';
  }

  btnFilterClick() {
    this.filter.emit(this.filtersValues);
  }

  btnGetCsvClick() {
    this.getCsv.emit(this.filtersValues);
  }
}