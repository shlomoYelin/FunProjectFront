import { AbstractControl } from "@angular/forms";

export function isObject(control: AbstractControl) {
    return typeof control.value === 'string' ? { incorrect: true } : null;
}