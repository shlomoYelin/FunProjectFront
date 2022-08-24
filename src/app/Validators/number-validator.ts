import { AbstractControl } from "@angular/forms";

export function notZero(control: AbstractControl) {
    console.log(control.value);
    
    return (parseInt(control.value + '') <= 0 && parseInt(control.value + '') != NaN)
        ? { isZero: true }
        : null;
}