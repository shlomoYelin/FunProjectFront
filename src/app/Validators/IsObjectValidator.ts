import { AbstractControl, ValidationErrors } from "@angular/forms";

export function isObject(control: AbstractControl,arr?:any) {
    return typeof control.value === 'string' ? { incorrect: true } : null;
}

// export function autoCompleteValidat(arr?: any) {
//     return (control: AbstractControl): ValidationErrors | null => {

//         let v: number = +control.value;

//         if (isNaN(v)) {
//             return { 'gte': true, 'requiredValue': val }
//         }

//         if (v <= +val) {
//             return { 'gte': true, 'requiredValue': val }
//         }

        

//         return null;

//     }
// }