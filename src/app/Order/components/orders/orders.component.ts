import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerType } from 'src/app/Customer/Enums/customer-type';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { DateRange } from 'src/app/General/Models/date-range';
import { SignalrService } from 'src/app/SignalR/signalr.service';
import { OrderItemsListComponent } from '../../Dialogs/order-items-list/order-items-list.component';
import { Order } from '../../interfaces/order';
import { OrderFiltersValuesModel } from '../../Models/order-filters-values-model';
import { OrdersService } from '../../Services/orders.service';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('deleteOrderDialog') deleteOrderDialog!: TemplateRef<any>;
  deleteOrderDialogRef!: MatDialogRef<any>;
  deleteInfoDialogRef!: MatDialogRef<any>;

  TabledataSource!: MatTableDataSource<Order>
  displayedColumns: string[] = ['customerFullName', 'payment', 'date', 'actions']

  selectedOrderId!: number;

  DeleteDialogErrorMessage!: string

  progressBarMode = false;

  TabelErrorMessage!: string

  filteresValues!: OrderFiltersValuesModel;

  constructor(
    private ordersService: OrdersService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar) { }


  ngOnInit(): void {
  }

  // getOrders() {
  //   this.progressBarMode = true;
  //   debugger
  //   this.ordersService.getAllWithFullName().
  //     subscribe(
  //       {
  //         next: data => {
  //           this.prepareTable(data);
  //           this.progressBarMode = false;
  //         },
  //         error: error => this.TabelErrorMessage = 'Something went wrong please try reloading your browser'
  //       }
  //     )
  // }

  getFilteredOrders(orderFilters: OrderFiltersValuesModel) {
    this.filteresValues = orderFilters;
    this.progressBarMode = true;
    this.ordersService.getByFiltersWithFullName(orderFilters).
      subscribe(
        {
          next: data => {
            this.prepareTable(data);
            this.progressBarMode = false;
          },
          error: error => this.TabelErrorMessage = 'Something went wrong please try reloading your browser'
        }
      )
  }

  getCsv(orderFilters: OrderFiltersValuesModel) {
    this.filteresValues = orderFilters;
    this.progressBarMode = true;
    this.ordersService.getExcelReportByFilter(orderFilters).
      subscribe(
        {
          next: response => {
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(
              new Blob([response.body ?? ''], { type: response.headers.get('content-type') ?? '' })
            );
            link.download = 'orders';
            link.click();

            this.progressBarMode = false;
          },
          error: error => this.TabelErrorMessage = 'Something went wrong please try reloading your browser'
        }
      )
  }

  prepareTable(data: Order[]) {
    this.TabledataSource = new MatTableDataSource<Order>(data);
    this.TabledataSource.paginator = this.paginator;
    this.TabledataSource.sort = this.sort;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'ok', { duration: 2700, verticalPosition: 'top', horizontalPosition: 'center' });
  }

  openDeleteOrderDialog(id: number) {
    this.deleteOrderDialogRef = this.dialog.open(this.deleteOrderDialog, { width: '500px', autoFocus: false })
    this.selectedOrderId = id;
  }

  DeleteDialogDeleteClick() {
    this.ordersService.delete(this.selectedOrderId).
      subscribe(
        {
          next: (data: ActionStatus) => {
            if (data?.success) {
              this.getFilteredOrders(this.filteresValues);
              this.deleteOrderDialogRef.close();
              this.openSnackBar('Order deleted successfully')
            }
            else {
              this.DeleteDialogErrorMessage = data?.message;
            }
          },
          error: err => this.DeleteDialogErrorMessage = 'Action failed , please try again'
        }
      )
  }

  DeleteDialogCancelClick() {
    this.deleteOrderDialogRef.close();
  }

  openInfoDialog(id: number) {
    this.deleteInfoDialogRef = this.dialog.open(OrderItemsListComponent,
      {
        width: '600px',
        data: this.TabledataSource.data.find(o => o.id == id)?.productOrders,
        autoFocus: false
      })
  }
}
