import { Injectable } from '@angular/core';
import { PhoneCategory } from '../Enums/phone-category';
import { PhoneNumberType } from '../Models/phone-number-type';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberService {
  phoneNumberTypes: PhoneNumberType[] = [
    { prefix: '05', length: 8, phoneCategory: PhoneCategory.Mobile },
    { prefix: '09', length: 7, phoneCategory: PhoneCategory.Landline },
    { prefix: '08', length: 7, phoneCategory: PhoneCategory.Landline },
    { prefix: '04', length: 7, phoneCategory: PhoneCategory.Landline },
    { prefix: '03', length: 7, phoneCategory: PhoneCategory.Landline },
    { prefix: '02', length: 7, phoneCategory: PhoneCategory.Landline },
    { prefix: '07', length: 8, phoneCategory: PhoneCategory.Landline },
    { prefix: '12', length: 2, phoneCategory: PhoneCategory.Emergency },
    { prefix: '11', length: 1, phoneCategory: PhoneCategory.Emergency },
    { prefix: '10', length: 1, phoneCategory: PhoneCategory.Emergency },
  ]

  constructor() { }

  getPhoneNumberTypes(phoneCategory?: PhoneCategory) {
    return !phoneCategory ? this.phoneNumberTypes
      : this.phoneNumberTypes.filter(phoneNumberType => phoneNumberType.phoneCategory === phoneCategory)
  }

  // test(phoneCategory?: PhoneCategory): number[] {
  //   if (phoneCategory === undefined) return [1];
  //   if (phoneCategory === PhoneCategory.Mobile) console.log('mobile');

  //   return Array.from(Array(5).keys());
  // }
}
