import { AbstractControl } from "@angular/forms";

export function isObject(control: AbstractControl,arr?:any) {
    return typeof control.value === 'string' ? { incorrect: true } : null;
}
