import { AbstractControl, ValidationErrors } from "@angular/forms";
import { of, switchMap } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { PhoneNumberService } from "../Services/phone-number.service";

export class PhoneValidator {
    public static IsExists(phoneNumberService: PhoneNumberService, prevPhoneNumber?: string) {
        return (control: AbstractControl): Observable<ValidationErrors> => {

            if (control.invalid || !control.value.number || control.value.number?.length < 7 || prevPhoneNumber == (control.value.prefix + control.value.number)) {
                return of(null as unknown as ValidationErrors);
            }

            const phoneNumber = control.value.prefix + control.value.number;

            return phoneNumberService
                .isPhoneNumberExist(phoneNumber)
                .pipe(
                    switchMap((result: boolean) =>
                        of((result ? { phoneNumberAlreadyExists: true } : null) as ValidationErrors)
                    )
                );
        };
    }
}

