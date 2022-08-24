import { AbstractControl, ValidationErrors } from "@angular/forms";
import { of, switchMap } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { PhoneNumberService } from "../Services/phone-number.service";

export class PhoneValidator {
    public static IsExists(phoneNumberService: PhoneNumberService, prevPhoneNumber?: string) {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            console.log(control.value);
            
            if (!control.value.number || control.value.number?.length < 7 || prevPhoneNumber == (control.value.prefix + control.value.number)) {
                console.log('adfsfsdgfs');
                console.log(control.value);
                
                return of(null as unknown as ValidationErrors);                
            }

            const phoneNumber = control.value.prefix + control.value.number;
            console.log(phoneNumber);
            
            return phoneNumberService
                .isPhoneNumberExist(phoneNumber)
                .pipe(
                    switchMap((result: boolean) =>
                        of((result ? { phoneNumberAlreadyExists: true } : null) as ValidationErrors)
                    )
                );
        };
    }

    // static test() {
    //     return (control: AbstractControl) => {
    //         console.log(control.value);
    //         return null;
    //     }
    // }
}

