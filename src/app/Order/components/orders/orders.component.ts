import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActionStatus } from 'src/app/General/interfaces/action-status';
import { OrderItemsListComponent } from '../../Dialogs/order-items-list/order-items-list.component';
import { Order } from '../../interfaces/order';
import { OrdersService } from '../../Services/orders.service';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
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

  progressBarMode = true;

  TabelErrorMessage!: string

  constructor(
    private ordersService: OrdersService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders() {
    this.progressBarMode = true;
    this.ordersService.getAllWithFullName().
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
              this.getOrders();
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
