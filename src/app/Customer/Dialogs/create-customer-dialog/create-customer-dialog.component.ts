import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { CustomerType } from '../../Enums/customer-type';
import { CustomersService } from '../../Services/customers.service'

@Component({
  selector: 'app-create-customer-dialog',
  templateUrl: './create-customer-dialog.component.html',
  styleUrls: ['./create-customer-dialog.component.css']
})
export class CreateCustomerDialogComponent implements OnInit {
  CustomerForm: FormGroup = new FormGroup({
    FirstName: new FormControl('', { validators: Validators.required, updateOn: 'change' }),
    LastName: new FormControl('', { validators: Validators.required, updateOn: 'change' }),
    TypeControl: new FormControl('', { validators: Validators.required, updateOn: 'change' }),
    PhoneNumber: new FormControl({}, Validators.required)
  });

  CustomerTypes = Object.keys(CustomerType).filter((item) => {
    return isNaN(Number(item));
  });

  ServerErrorMessage!: string;

  constructor(
    private CreateCustomerDialogRef: MatDialogRef<CreateCustomerDialogComponent>,
    private CustomerService: CustomersService,
  ) { }

  ngOnInit(): void {
  }

  CancelClick() {
    this.CreateCustomerDialogRef.close();
  }

  CreateCustomerClick() {
    if (this.CustomerForm.invalid) {
      this.CustomerForm.markAllAsTouched();
      return;
    }
    this.ServerErrorMessage = '';

    this.CustomerService.create({
      id: 0,
      firstName: this.CustomerForm.get('FirstName')?.value,
      lastName: this.CustomerForm.get('LastName')?.value,
      type: CustomerType[this.getSelectedCustomerType()],
      phone: Object.values((this.CustomerForm.get('PhoneNumber')?.value)).toString().replace(',', '')
    }).
      subscribe(
        {
          next: (actionStatus: ActionStatus) => {
            if (actionStatus.success) {
              this.CreateCustomerDialogRef.close(true);
            }
            else {
              this.ServerErrorMessage = actionStatus.message;
            }
          },
          error: (error: any) => this.ServerErrorMessage = 'Action failed please try again'
        }
      );
  }

  getSelectedCustomerType() {
    const value = this.CustomerForm.get('TypeControl')?.value;
    const index = Object.values(CustomerType).indexOf(value);
    const key = parseInt(Object.keys(CustomerType)[index]);

    return CustomerType[key] as keyof typeof CustomerType
  }

}



