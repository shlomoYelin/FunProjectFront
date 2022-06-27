import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductsService } from 'src/app/Product/Services/products.service';
import { Product } from '../../interfaces/product';
import { CreateProductDialogComponent } from '../../Dialogs/create-product-dialog/create-product-dialog.component';
import { ActionStatus } from 'src/app/General/interfaces/action-status';
import { EditProductDialogComponent } from '../../Dialogs/edit-product-dialog/edit-product-dialog.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  displayedColumns: string[] = ['description', 'price', 'actions'];
  dataSource!: MatTableDataSource<Product>
  deleteProductDialogRef!: MatDialogRef<any>;
  selectedProductId!: number;
  DeleteDialogErrorMessage: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deleteProductDialog') deleteProductDialog!: TemplateRef<any>;

  progressBarMode = true;

  TabelErrorMessage!: string

  constructor(
    private ProductsService: ProductsService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.progressBarMode = true;
    this.ProductsService.getAll().
      subscribe(
        {
          next: data => {
            this.generateTable(data);
            this.progressBarMode = false;

          },
          error: error => {
            this.TabelErrorMessage = 'Something went wrong please try reloading your browser';
            this.progressBarMode = false;
          }
        }
      )
  }

  generateTable(data: Product[]) {
    this.dataSource = new MatTableDataSource<Product>(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openCreateProductDialog() {
    this.dialog.open(CreateProductDialogComponent, { width: '500px' }).afterClosed().
      subscribe(
        (created: boolean) => {
          if (created) {
            this.getProducts();//Uptate table
          }
        }
      )
  }

  openEditProductDialog(id: number) {
    this.dialog.open(EditProductDialogComponent, {
      width: '500px',
      data: this.dataSource.data.find(c => c.id == id)
    }).afterClosed().
      subscribe(
        (updated: boolean) => {
          if (updated) {
            this.getProducts()
          }
        }
      );
  }

  openDeleteProductDialog(id: number) {
    this.deleteProductDialogRef = this.dialog.open(this.deleteProductDialog, { width: '500px' });
    this.selectedProductId = id;
  }

  DeleteDialogDeleteClick() {
    this.ProductsService.delete(this.selectedProductId).
      subscribe(
        {
          next: (actionStatus: ActionStatus) => {
            if (actionStatus.success) {
              this.getProducts();//Uptate table
              this.deleteProductDialogRef.close();
              this.openSnackBar('Product deleted successfully');
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
    this.deleteProductDialogRef.close();
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'ok', { duration: 2500, verticalPosition: 'top', horizontalPosition: 'center' });
  }

}
