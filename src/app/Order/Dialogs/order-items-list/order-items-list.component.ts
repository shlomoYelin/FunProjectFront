import { Component, Inject, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ProductOrder } from 'src/app/Order/interfaces/product-order';

@Component({
  selector: 'app-order-items-list',
  templateUrl: './order-items-list.component.html',
  styleUrls: ['./order-items-list.component.css']
})
export class OrderItemsListComponent implements OnInit {
  TabledataSource!: MatTableDataSource<ProductOrder>;
  displayedColumns: string[] = ['productDescription', 'quantity'];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public productsOrders: Array<ProductOrder>,
    private OrderItemsListDialogRef: MatDialogRef<OrderItemsListComponent>
  ) { }

  ngOnInit(): void {
    this.generateItemsTable();
  }

  Close() {
    this.OrderItemsListDialogRef.close();
  }

  generateItemsTable() {
    this.TabledataSource = new MatTableDataSource<ProductOrder>(this.productsOrders)
    this.TabledataSource.sort = this.sort;
    this.TabledataSource.paginator = this.paginator;
  }

}
