import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { of } from 'rxjs';
import { ActionStatus } from 'src/app/General/interfaces/action-status';
import { CreateCustomerDialogComponent } from '../../Dialogs/create-customer-dialog/create-customer-dialog.component';
import { CustomerInfoDialogComponent } from '../../Dialogs/customer-info-dialog/customer-info-dialog.component';
import { EditCustomerDialogComponent } from '../../Dialogs/edit-customer-dialog/edit-customer-dialog.component';
import { CustomerType } from '../../Enums/customer-type';
import { Customer } from '../../interfaces/customer';
import { CustomersService } from '../../Services/customers.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  displayedColumns: string[] = ['firstName', 'lastName', 'type', 'actions'];
  ELEMENT_DATA!: Customer[]
  dataSource!: MatTableDataSource<Customer>
  deleteCustomerDialogRef!: MatDialogRef<any>;
  selectedCustomerId!: number;
  DeleteDialogErrorMessage: string = '';
  TableErrorMessage!: string

  CustomerType!: CustomerType;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deleteCustomerDialog') deleteCustomerDialog!: TemplateRef<any>;

  constructor(
    private CustomersService: CustomersService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getCustomers();
  }

  getCustomers() {
    this.CustomersService.getAll().
      subscribe(
        {
          next: data => {
            this.GenerateTable(data);
          },
          error: error => this.TableErrorMessage = 'Something went wrong please try reloading your browser'
        }
      )
  }

  getTypeValue(type: CustomerType): string {
    return CustomerType[type]
  }

  GenerateTable(data: Customer[]) {
    this.ELEMENT_DATA = data;
    this.dataSource = new MatTableDataSource<Customer>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openCreateCustomerDialog() {
    this.dialog.open(CreateCustomerDialogComponent, { width: '500px' }).afterClosed().
      subscribe(
        (created: boolean) => {
          if (created) {
            this.getCustomers();
          }
        }
      )
  }

  openEditCustomerDialog(id: number) {
    this.dialog.open(EditCustomerDialogComponent, {
      width: '500px',
      data: this.ELEMENT_DATA.find(c => c.id == id)
    }).afterClosed().
      subscribe(
        (updated: boolean) => {
          if (updated) {
            this.getCustomers()
          }
        }
      );
  }

  openInfoDialog(id: number) {
    this.dialog.open(CustomerInfoDialogComponent, {
      width: '500px',
      data: this.ELEMENT_DATA.find(c => c.id == id)
    })
  }

  openDeleteCustomerDialog(id: number) {
    this.deleteCustomerDialogRef = this.dialog.open(this.deleteCustomerDialog, { width: '500px' });
    this.selectedCustomerId = id;
  }

  DeleteDialogDeleteClick() {
    this.CustomersService.delete(this.selectedCustomerId).
      subscribe(
        {
          next: (actionStatus: ActionStatus) => {
            if (actionStatus.success) {
              this.getCustomers();
              this.deleteCustomerDialogRef.close();
              this.openSnackBar('Customer deleted successfully');
            }
            else {
              this.DeleteDialogErrorMessage = actionStatus.message;
            }
          },
          error: (error: any) => this.DeleteDialogErrorMessage = 'Action failed please try again'
        }
      )
  }

  DeleteDialogCancelClick() {
    this.deleteCustomerDialogRef.close();
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'ok', { duration: 2500, verticalPosition: 'top', horizontalPosition: 'center' });
  }
}

