import { Component, DoCheck, forwardRef, Input, OnInit, Optional, Self } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, FormControl, FormControlStatus, FormGroup, NgControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
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
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneNumberControlComponent),
      multi: true,
    }
  ]
})
export class PhoneNumberControlComponent implements OnInit, ControlValueAccessor, DoCheck, Validator {
  phoneNumberForm = new FormGroup({
    prefix: new FormControl(''),
    number: new FormControl('', {
      validators: [
        Validators.minLength(7),
        Validators.pattern('^\\d+$')
      ],
    })
  });

  @Input() phoneCategory!: PhoneCategory;

  onTouched = () => { };
  onChange = (_: any) => { };

  phoneNumberTypes: PhoneNumberType[] = [];

  numberControlToolTipMessage = 'you have to choose a number prefix first';

  readonly tmpValidator = (_: any) => { return { 'aaa': false } };

  @Input()
  formControlName!: string;

  constructor(
    public phoneNumberService: PhoneNumberService,
    // private inj: Injector,
    public controlContainer: ControlContainer,
    // @Optional() @Self() public ngControl: NgControl
  ) { 
  }

  ngDoCheck(): void {
    this.markAllAsTouchedOnParentMarkAsTouched();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.status == 'VALID') {
      this.phoneNumberForm.get('number')?.removeValidators(this.tmpValidator);
      this.phoneNumberForm.get('number')?.updateValueAndValidity();
    }
    return this.phoneNumberForm.invalid || control.invalid ? { internal: true } : null;
  }


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
      if (this.controlContainer.control?.touched) {
      this.phoneNumberForm.markAllAsTouched();
    }
  }

  setPrefixValidatorRequired() {
    if (this.controlContainer.control?.get(this.formControlName)?.validator?.({} as AbstractControl)?.['required']) {
      this.phoneNumberForm.get('prefix')?.addValidators(Validators.required);
    }
  }

  subscribeToControlStatusChanges() {

    this.controlContainer.control?.get(this.formControlName)?.statusChanges?.subscribe(status => {
      if (status == 'INVALID') {
        this.phoneNumberForm.get('number')?.addValidators(this.tmpValidator);
        this.phoneNumberForm.get('number')?.updateValueAndValidity();
      }
      else {
        this.phoneNumberForm.get('number')?.removeValidators(this.tmpValidator);
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
        else if (this.phoneNumberForm.get('number')?.dirty) {
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
