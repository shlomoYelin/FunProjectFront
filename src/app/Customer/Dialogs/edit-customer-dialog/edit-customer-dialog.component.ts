import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActionStatus } from 'src/app/General/interfaces/action-status';
import { CustomerType } from '../../Enums/customer-type';
import { Customer } from '../../interfaces/customer';
import { CustomersService } from '../../Services/customers.service'



@Component({
  selector: 'app-edit-customer-dialog',
  templateUrl: './edit-customer-dialog.component.html',
  styleUrls: ['./edit-customer-dialog.component.css']
})
export class EditCustomerDialogComponent implements OnInit {
  EditForm: FormGroup = new FormGroup({
    FirstName: new FormControl('', Validators.required),
    LastName: new FormControl('', Validators.required),
    TypeControl: new FormControl('', Validators.required)

  });
  CustomerTypes = Object.keys(CustomerType).filter((item) => {
    return isNaN(Number(item));
  });
  CustomerType = CustomerType;


  ServerErrorMessage!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Customer,
    private EditCustomerDialogRef: MatDialogRef<EditCustomerDialogComponent>,
    private CustomerService: CustomersService
  ) { }

  ngOnInit(): void {
    this.EditForm.controls['FirstName'].setValue(this.data.firstName);
    this.EditForm.controls['LastName'].setValue(this.data.lastName);
    this.EditForm.controls['TypeControl'].setValue(this.CustomerTypes[this.data.type - 1]);
  }

  UpdateClick() {
    if (this.EditForm.invalid) {
      this.EditForm.markAllAsTouched();
      return;
    }
    this.ServerErrorMessage = '';
    this.CustomerService.update({
      id: this.data.id,
      firstName: this.EditForm.get('FirstName')?.value,
      lastName: this.EditForm.get('LastName')?.value,
      type: CustomerType[this.getSelectedCustomerType()]
    })
      .subscribe(
        {
          next: (actionStatus: ActionStatus) => {
            if (actionStatus.success) {
              this.EditCustomerDialogRef.close(true);
            }
            else {
              this.ServerErrorMessage = actionStatus.message;
            }
          },
          error: (error: any) => this.ServerErrorMessage = 'Action failed please try again'
        }


      )
  }

  CancelClick() {
    this.EditCustomerDialogRef.close()
  }

  getSelectedCustomerType() {
    const value = this.EditForm.get('TypeControl')?.value;
    const index = Object.values(CustomerType).indexOf(value);
    const key = parseInt(Object.keys(CustomerType)[index]);

    return CustomerType[key] as keyof typeof CustomerType
  }
}
