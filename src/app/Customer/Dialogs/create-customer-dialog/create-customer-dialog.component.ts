import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { PhoneNumberService } from 'src/app/General/Services/phone-number.service';
import { PhoneValidator } from 'src/app/General/Validators/phone-validator';
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
    PhoneNumber: new FormControl({}, [Validators.required], PhoneValidator.IsExists(this.PhoneNumberService))
  });

  CustomerTypes = Object.keys(CustomerType).filter((item) => {
    return isNaN(Number(item));
  });

  ServerErrorMessage!: string;

  errorsSubject$ = new Subject<string>();

  constructor(
    private CreateCustomerDialogRef: MatDialogRef<CreateCustomerDialogComponent>,
    private CustomerService: CustomersService,
    private PhoneNumberService: PhoneNumberService
  ) { }

  ngOnInit(): void {
    this.subscribeToPhoneNumberStatusChanges();
  }

  subscribeToPhoneNumberStatusChanges() {
    // this.CustomerForm.get('PhoneNumber')?.statusChanges.subscribe(status => {
    //   if (status == 'INVALID') {
    //     if (this.CustomerForm.get('PhoneNumber')?.hasError('required')) {
    //       this.errorsSubject$.next('Number is required.');
    //     }

    //     if (this.CustomerForm.get('PhoneNumber')?.hasError('phoneNumberAlreadyExists')) {
    //       this.errorsSubject$.next('Phone number already exists');
    //     }
    //   }
    //   else {
    //     this.errorsSubject$.next('');
    //   }
    // });

  }

  CancelClick() {
    this.CreateCustomerDialogRef.close();
  }

  CreateCustomerClick() {
    if (!this.isFormValid()) {
      return;
    }

    this.ServerErrorMessage = '';

    this.createCustomer()
      .subscribe(
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

  createCustomer() {
    return this.CustomerService.create({
      id: 0,
      firstName: this.CustomerForm.get('FirstName')?.value,
      lastName: this.CustomerForm.get('LastName')?.value,
      type: CustomerType[this.getSelectedCustomerType()],
      phone: Object.values((this.CustomerForm.get('PhoneNumber')?.value)).toString().replace(',', '')
    });
  }

  isFormValid() {
    let toReturn = true;
    if (this.CustomerForm.invalid) {
      this.CustomerForm.markAllAsTouched();
      toReturn = false;
    }
    
    if (this.CustomerForm.get('PhoneNumber')?.value != null && Object.keys(this.CustomerForm.get('PhoneNumber')?.value).length == 0) {
      this.errorsSubject$.next('required');
      toReturn = false;
    }

    return toReturn;
  }

  getSelectedCustomerType() {
    const value = this.CustomerForm.get('TypeControl')?.value;
    const index = Object.values(CustomerType).indexOf(value);
    const key = parseInt(Object.keys(CustomerType)[index]);

    return CustomerType[key] as keyof typeof CustomerType
  }

}



