import { AbstractControl, ValidationErrors } from "@angular/forms";
import { Product } from "../Product/interfaces/product";

export function autoCompleteValidat(products: Product[]) {
    return (control: AbstractControl): ValidationErrors | null => {
        return !(control.value) || (products.some((product: Product) => control.value == product.description))
            ? null
            : { 'not-found': true }
    }
}