import { Component, DoCheck, ElementRef, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, FormControl, FormControlStatus, FormGroup, NG_VALUE_ACCESSOR, ValidatorFn, Validators } from '@angular/forms';
import { distinctUntilChanged, Subject } from 'rxjs';
import { PhoneCategory } from '../../Enums/phone-category';
import { PhoneNumber } from '../../Models/phone-number';
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
    },
    // {
    //   provide: NG_VALIDATORS,
    //   useExisting: forwardRef(() => PhoneNumberControlComponent),
    //   multi: true,
    // }
  ]
})
export class PhoneNumberControlComponent implements OnInit, ControlValueAccessor, DoCheck //, Validator
{
  phoneNumberForm = new FormGroup({
    prefix: new FormControl('',
    ),
    number: new FormControl('', {
      validators: [
        Validators.minLength(7),
        Validators.pattern('^\\d+$')
      ],
    })
  });

  @Input() phoneCategory!: PhoneCategory;

  parentErrorMessage = '';

  parentErrorType = '';

  onTouched = () => { };
  onChange = (_: any) => { };

  phoneNumberTypes: PhoneNumberType[] = [];

  numberControlToolTipMessage = 'you have to choose a number prefix first';

  // ngControl!: NgControl

  // control!: AbstractControl;

  @Input()
  formControlName!: string;

  // constructor(
  //   public phoneNumberService: PhoneNumberService,
  //   @Optional() @Self() public ngControl: NgControl
  // ) { 
  //   if (this.ngControl) {
  //     this.ngControl.valueAccessor = this;
  //   }
  // }

  constructor(
    public phoneNumberService: PhoneNumberService,
    // private inj: Injector,
    public controlContainer: ControlContainer
  ) {

  }
  ngDoCheck(): void {
    this.markAllAsTouchedOnParentMarkAsTouched();
  }



  // validate(control: AbstractControl): ValidationErrors | null {
  //   console.log('validate');

  //   return this.phoneNumberForm.invalid ? { internal: true } : null;
  // }


  ngOnInit(): void {
    this.getPhoneNumberTypes();
    this.phoneNumberForm.get('number')?.disable();
    this.enableNumberControlOnPrefixValid();
    this.clearNumberControlToolTipMessageOnPrefixValid();
    this.subscribeToPhoneNumberFormValueChange();
    this.setPrefixValidatorRequired();
    this.subscribeToControlStatusChanges();
    this.markNumberAsTouchedOnUpdatePerfix();
  }

  markAllAsTouchedOnParentMarkAsTouched() {
    if (this.controlContainer.control?.get(this.formControlName)?.touched) {
      console.log('none blabla');

      this.phoneNumberForm.markAllAsTouched();
    }
  }

  setPrefixValidatorRequired() {
    if (this.controlContainer.control?.get(this.formControlName)?.validator?.({} as AbstractControl)?.['required']) {
      this.phoneNumberForm.get('prefix')?.addValidators(Validators.required);
    }
  }

  subscribeToControlStatusChanges() {
    const tmpValidator = (_: any) => { return { 'aaa': false } };

    this.controlContainer.control?.get(this.formControlName)?.statusChanges?.subscribe(status => {
      if (status == 'INVALID') {
        // this.phoneNumberForm.get('prefix')?.markAsTouched();
        this.phoneNumberForm.get('number')?.addValidators(tmpValidator);
        this.phoneNumberForm.get('number')?.updateValueAndValidity();
      }
      else {
        this.phoneNumberForm.get('number')?.removeValidators(tmpValidator);
        this.phoneNumberForm.get('number')?.updateValueAndValidity();
      }
    });
  }

  writeValue(obj: any): void {
    this.phoneNumberForm.patchValue(obj);
    this.phoneNumberForm.updateValueAndValidity();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  numberControlBlur() {
    const val = this.phoneNumberForm.get('number')?.value;
    if (!val) {
      this.onChange(null);
    }
  }

  subscribeToPhoneNumberFormValueChange() {
    this.phoneNumberForm
      .valueChanges
      .pipe(distinctUntilChanged((prev: PhoneNumber, current: PhoneNumber) => {
        return JSON.stringify(prev) == JSON.stringify(current);
      }))
      .subscribe(val => {
        if (val.prefix && val.number) {
          this.onChange(val);
        }
        // else if (this.phoneNumberForm.dirty) {
        else if (this.phoneNumberForm.get('number')?.dirty) {
          console.log('this.onChange(null);');

          this.onChange(null);
        }
      });
  }

  markNumberAsTouchedOnUpdatePerfix() {
    this.phoneNumberForm.get('prefix')?.valueChanges.subscribe(_ => {
      if (this.phoneNumberForm.get('number')?.value.length == 7) {
        this.phoneNumberForm.markAllAsTouched();
      }
    });
  }

  getPhoneNumberTypes() {
    this.phoneNumberTypes = JSON.parse(
      JSON.stringify(
        this.phoneNumberService.getPhoneNumberTypes(this.phoneCategory)
      ));
  }

  enableNumberControlOnPrefixValid() {
    this.phoneNumberForm.get('prefix')?.statusChanges.subscribe((status: FormControlStatus) => {
      if (status === 'VALID') {
        this.phoneNumberForm.get('number')?.enable();
      }
    });
  }

  clearNumberControlToolTipMessageOnPrefixValid() {
    this.phoneNumberForm.get('prefix')?.statusChanges.subscribe((status: FormControlStatus) => {
      if (status === 'VALID') {
        this.numberControlToolTipMessage = '';
      }
    });
  }
}
