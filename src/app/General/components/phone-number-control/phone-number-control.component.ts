import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlStatus, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { PhoneCategory } from '../../Enums/phone-category';
import { PhoneNumberType } from '../../Models/phone-number-type';
import { PhoneNumberService } from '../../Services/phone-number.service';

@Component({
  selector: 'app-phone-number-control',
  templateUrl: './phone-number-control.component.html',
  styleUrls: ['./phone-number-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneNumberControlComponent),
      multi: true
    }
  ]
})
export class PhoneNumberControlComponent implements OnInit, ControlValueAccessor {
  phoneNumberForm = new FormGroup({
    prefix: new FormControl('', Validators.required),
    number: new FormControl('', {
      validators: [
        Validators.required,
        Validators.pattern('^\\d+$')
      ]
    }),
  });

  @Input() phoneCategory!: PhoneCategory;

  phoneNumberTypes: PhoneNumberType[] = [];

  numberLength = 0;

  numberControlToolTipMessage = 'you have to choose a number prefix first';


  constructor(public phoneNumberService: PhoneNumberService) { }

  writeValue(obj: any): void {
    throw new Error('Method not implemented.');
  }

  registerOnChange(fn: any): void {
    throw new Error('Method not implemented.');
  }

  registerOnTouched(fn: any): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.getPhoneNumberTypes();
    this.phoneNumberForm.get('number')?.disable();
    this.enableNumberControlOnPrefixValid();
    this.clearNumberControlToolTipMessageOnPrefixValid();
    this.updateNumberControlLengthOnPrefixChange();

    // this.phoneNumberForm.get('number')?.statusChanges.subscribe((status: FormControlStatus) => {
    //   if (status == 'INVALID') {
    //     console.log('errors');

    //     console.log(this.phoneNumberForm.get('number')?.errors);

    //   }
    // });
  }

  getPhoneNumberTypes() {
    this.phoneNumberTypes = JSON.parse(
      JSON.stringify(
        this.phoneNumberService.getPhoneNumberTypes(this.phoneCategory)
      ));
  }

  enableNumberControlOnPrefixValid() {
    this.phoneNumberForm.get('prefix')?.statusChanges.subscribe((status: FormControlStatus) => {
      console.log(status);
      if (status === 'VALID') {
        this.phoneNumberForm.get('number')?.enable();
      }
    });
  }

  clearNumberControlToolTipMessageOnPrefixValid() {
    this.phoneNumberForm.get('prefix')?.statusChanges.subscribe((status: FormControlStatus) => {
      console.log(status);
      if (status === 'VALID') {
        this.numberControlToolTipMessage = '';
      }
    });
  }

  updateNumberControlLengthOnPrefixChange() {
    this.phoneNumberForm.get('prefix')?.valueChanges.subscribe(value => {
      this.numberLength = this.phoneNumberTypes.find(t => t.prefix == value)?.length ?? 0;

      this.phoneNumberForm.get('number')
        ?.addValidators([Validators.maxLength(this.numberLength), Validators.minLength(this.numberLength)]);

      this.phoneNumberForm.get('number')?.updateValueAndValidity();

    });
  }


}
