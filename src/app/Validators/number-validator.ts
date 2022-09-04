import { AbstractControl } from "@angular/forms";

export function notZero(control: AbstractControl) {
    return (parseInt(control.value + '') <= 0 && parseInt(control.value + '') != NaN)
        ? { isZero: true }
        : null;
}