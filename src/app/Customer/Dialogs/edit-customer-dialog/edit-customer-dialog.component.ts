import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { PhoneNumber } from 'src/app/General/Models/phone-number';
import { PhoneNumberService } from 'src/app/General/Services/phone-number.service';
import { PhoneValidator } from 'src/app/General/Validators/phone-validator';
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
    TypeControl: new FormControl('', Validators.required),
    PhoneNumber: new FormControl({}, Validators.required, PhoneValidator.IsExists(this.PhoneNumberService, this.data.phone))
  });

  CustomerTypes = Object.keys(CustomerType).filter((item) => {
    return isNaN(Number(item));
  });
  CustomerType = CustomerType;


  ServerErrorMessage!: string;

  errorsSubject$ = new Subject<string>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Customer,
    private EditCustomerDialogRef: MatDialogRef<EditCustomerDialogComponent>,
    private CustomerService: CustomersService,
    private PhoneNumberService: PhoneNumberService

  ) { }

  ngOnInit(): void {
    this.fillPrevCustomerDetails();
    this.subscribeToPhoneNumberStatusChanges();
  }

  fillPrevCustomerDetails() {
    this.EditForm.controls['FirstName'].setValue(this.data.firstName);
    this.EditForm.controls['LastName'].setValue(this.data.lastName);
    this.EditForm.controls['TypeControl'].setValue(this.CustomerTypes[this.data.type - 1]);
    this.EditForm.controls['PhoneNumber'].setValue(this.splitPhoneNumber(this.data.phone));
  }

  splitPhoneNumber(phoneStr: string): PhoneNumber {
    const index = phoneStr.length - 7;
    const [prefix, number] = [phoneStr.slice(0, index), phoneStr.slice(index)];
    return { prefix: prefix, number: number }
  }

  subscribeToPhoneNumberStatusChanges() {
    // this.EditForm.get('PhoneNumber')?.statusChanges.subscribe(status => {
    //   if (status == 'INVALID') {
    //     if (this.EditForm.get('PhoneNumber')?.hasError('required')) {
    //       this.errorsSubject$.next('Number is required.');
    //     }

    //     if (this.EditForm.get('PhoneNumber')?.hasError('phoneNumberAlreadyExists')) {
    //       this.errorsSubject$.next('Phone number already exists');
    //     }
    //   }
    //   else {
    //     this.errorsSubject$.next('');
    //   }
    // })
  }

  UpdateClick() {
    if (!this.isFormValid()) {
      return;
    }

    this.ServerErrorMessage = '';
    this.updateCustomer()
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

  updateCustomer() {
    return this.CustomerService.update({
      id: this.data.id,
      firstName: this.EditForm.get('FirstName')?.value,
      lastName: this.EditForm.get('LastName')?.value,
      type: CustomerType[this.getSelectedCustomerType()],
      phone: Object.values((this.EditForm.get('PhoneNumber')?.value)).toString().replace(',', '')
    })
  }

  isFormValid() {
    let toReturn = true;
    if (this.EditForm.invalid) {
      this.EditForm.markAllAsTouched();
      toReturn = false;
    }

    if (this.EditForm.get('PhoneNumber')?.value != null && Object.keys(this.EditForm.get('PhoneNumber')?.value).length == 0) {
      this.errorsSubject$.next('required');
      toReturn = false;
    }

    return toReturn;
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
