import { PhoneCategory } from "../Enums/phone-category";

export interface PhoneNumberType {
    prefix: string;
    // length: number;
    phoneCategory: PhoneCategory
}
