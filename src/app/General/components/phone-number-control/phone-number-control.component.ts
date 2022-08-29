import { AfterViewInit, Component, forwardRef, Injector, Input, OnInit, Optional, Self } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, FormControl, FormControlStatus, FormGroup, NgControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
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
    },
    // {
    //   provide: NG_VALIDATORS,
    //   useExisting: forwardRef(() => PhoneNumberControlComponent),
    //   multi: true,
    // }
  ]
})
export class PhoneNumberControlComponent implements OnInit, ControlValueAccessor//, Validator
{
  phoneNumberForm = new FormGroup({
    prefix: new FormControl('',
    ),
    number: new FormControl('', {
      validators: [
        Validators.minLength(7),
        Validators.pattern('^\\d+$')
      ]
    }),
  });

  @Input() phoneCategory!: PhoneCategory;
  @Input() parentErrorsSubjectInput$!: Subject<string>;

  parentErrorMessage = '';

  parentErrorType = '';

  onTouched = () => { };
  onChange = (_: any) => { };

  phoneNumberTypes: PhoneNumberType[] = [];

  numberControlToolTipMessage = 'you have to choose a number prefix first';

  ngControl!: NgControl

  control!: AbstractControl;

  @Input()
  formControlName!: string;
  
  // constructor(
  //   public phoneNumberService: PhoneNumberService,
  //   @Optional() @Self() public ngControl: NgControl
  // ) { 
  //   // if (this.ngControl) {
  //     // this.ngControl.valueAccessor = this;
  //   // }
  // }

  constructor(
    public phoneNumberService: PhoneNumberService,
    private inj: Injector,
    private controlContainer: ControlContainer
  ) {

  }

  // validate(control: AbstractControl): ValidationErrors | null {
  //   console.log('validate');

  //   return this.phoneNumberForm.invalid ? { internal: true } : null;
  // }


  ngOnInit(): void {
    this.ngControl = this.inj.get(NgControl);
    console.log('ngOnInit',this.ngControl.validator?.({} as AbstractControl));
    
    this.getPhoneNumberTypes();
    this.phoneNumberForm.get('number')?.disable();
    this.enableNumberControlOnPrefixValid();
    this.clearNumberControlToolTipMessageOnPrefixValid();
    this.subscribeToPhoneNumberForm();
    this.subscribeToParentErrorInput();

  }

  // ngAfterViewInit(): void {
  //   console.log(this.ngControl.control?.validator);
  //   // console.log(this.controlContainer?.control?.get(this.formControlName)?.)
  //   // this.control = this.controlContainer?.control?.get(this.formControlName);
  // }

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

  subscribeToParentErrorInput() {
    const tmpValidator = (_: any) => { return { 'aaa': false } };
    this.parentErrorsSubjectInput$.subscribe(errorMessage => {
      if (errorMessage) {
        this.phoneNumberForm.get('number')?.addValidators(tmpValidator);
        this.parentErrorMessage = errorMessage;
        this.phoneNumberForm.get('number')?.updateValueAndValidity();
      }
      else {
        this.phoneNumberForm.get('number')?.removeValidators(tmpValidator);
        this.parentErrorMessage = errorMessage;

      }
    });
  }

  numberControlBlur() {
    const val = this.phoneNumberForm.get('number')?.value;
    if (!val) {
      this.onChange(null);
    }
  }

  subscribeToPhoneNumberForm() {
    this.phoneNumberForm
      .valueChanges
      // .pipe(distinctUntilChanged((prev: PhoneNumber, current: PhoneNumber) => {
      //   return prev.number == current.number;
      // }))
      .subscribe(val => {
        // console.log(this.ngControl.control);
        // console.log(this.controlContainer?.control?.get(this.formControlName))
        if (val.number) {
          this.onChange(val);
        }
        else if (this.phoneNumberForm.get('number')?.dirty) {
          this.onChange(null);
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
