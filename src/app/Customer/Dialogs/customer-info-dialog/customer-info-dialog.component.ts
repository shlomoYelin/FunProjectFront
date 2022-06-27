import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerType } from '../../Enums/customer-type';
import { Customer } from '../../interfaces/customer';


@Component({
  selector: 'app-customer-info-dialog',
  templateUrl: './customer-info-dialog.component.html',
  styleUrls: ['./customer-info-dialog.component.css']
})
export class CustomerInfoDialogComponent implements OnInit {
  ServerErrorMessage:string = ''

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Customer,
    private CustomerInfoDialogRef: MatDialogRef<CustomerInfoDialogComponent>) { }

  ngOnInit(): void {
  }

  Close() {
    this.CustomerInfoDialogRef.close();
  }

  getTypeValue(type: CustomerType): string {
    return CustomerType[type]
  }
}
