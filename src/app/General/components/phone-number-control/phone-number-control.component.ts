import { AfterViewInit, Component, ContentChild, DoCheck, ElementRef, forwardRef, Injector, Input, OnInit, Optional, Self, ViewChild } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, FormControl, FormControlStatus, FormGroup, NgControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { distinctUntilChanged, retry, Subject, timeout } from 'rxjs';
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
  @Input() parentErrorsSubjectInput$!: Subject<string>;

  @ViewChild('ngContentMatError') ngContentMatError!: ElementRef;
  // @ContentChild('contentParagraph', { static: true }) ngContentMatError!: ElementRef;

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
    private controlContainer: ControlContainer
  ) {

  }
  ngDoCheck(): void {
    if (this.controlContainer.control?.get(this.formControlName)?.touched) {
      this.phoneNumberForm.markAllAsTouched();
    }
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
    this.subscribeToPhoneNumberForm();
    // this.subscribeToParentErrorInput();
    this.setPrefixValidatorRequired();
    this.subscribeToControlStatusChanges();
  }

  setPrefixValidatorRequired() {
    if (this.controlContainer.control?.get(this.formControlName)?.validator?.({} as AbstractControl)?.['required']) {
      this.phoneNumberForm.get('prefix')?.addValidators(Validators.required);
    }
  }

  subscribeToControlStatusChanges() {
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

    const tmpValidator = (_: any) => { return { 'aaa': false } };

    this.controlContainer.control?.get(this.formControlName)?.statusChanges?.subscribe(status => {
      // console.log(status, this.ngContentMatError?.nativeElement?.children?.length);
      // if (status == 'INVALID' && this.ngContentMatError.nativeElement.children.length == 0) {
      //   this.controlContainer.control?.get(this.formControlName)?
      // }
      // console.log(this.controlContainer.control?.get(this.formControlName));
      // setTimeout(() => {
      // this.ngContentMatError.nativeElement.
        // console.log(status, this.ngContentMatError.nativeElement);

        // if (status == 'INVALID' && this.ngContentMatError.nativeElement.children.length > 0) {
          if (status == 'INVALID' ) {
          console.log(status);

          this.phoneNumberForm.get('prefix')?.markAsTouched();
          // if ((!this.phoneNumberForm.get('number')?.disabled) && this.phoneNumberForm.get('number')?.valid) {
          this.phoneNumberForm.get('number')?.addValidators(tmpValidator);
          // this.parentErrorMessage = errorMessage;
          // this.phoneNumberForm.get('number')?.markAllAsTouched();??????
          this.phoneNumberForm.get('number')?.updateValueAndValidity();
          // }
        }
        else {
          this.phoneNumberForm.get('number')?.removeValidators(tmpValidator);
        }
      // }, 1);
     
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

  // subscribeToParentErrorInput() {
  //   const tmpValidator = (_: any) => { return { 'aaa': false } };
  //   this.parentErrorsSubjectInput$.subscribe(errorMessage => {

  //     if (errorMessage) {
  //       this.phoneNumberForm.get('prefix')?.markAsTouched();
  //       if ((!this.phoneNumberForm.get('number')?.disabled) && this.phoneNumberForm.get('number')?.valid) {
  //         this.phoneNumberForm.get('number')?.addValidators(tmpValidator);
  //         this.parentErrorMessage = errorMessage;
  //         this.phoneNumberForm.get('number')?.markAllAsTouched();
  //         this.phoneNumberForm.get('number')?.updateValueAndValidity();
  //       }
  //     }
  //     else {
  //       this.phoneNumberForm.get('number')?.removeValidators(tmpValidator);
  //       this.parentErrorMessage = errorMessage;
  //     }
  //   });
  // }

  numberControlBlur() {
    const val = this.phoneNumberForm.get('number')?.value;
    if (!val) {
      this.onChange(null);
    }
  }

  subscribeToPhoneNumberForm() {
    this.phoneNumberForm
      .valueChanges
      .pipe(distinctUntilChanged((prev: PhoneNumber, current: PhoneNumber) => {
        return JSON.stringify(prev) == JSON.stringify(current);
      }))
      .subscribe(val => {
        if (val.prefix && val.number) {
          this.onChange(val);
        }
        else if (this.phoneNumberForm.dirty) {
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
