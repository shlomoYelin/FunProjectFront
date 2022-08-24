import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from 'src/app/Product/interfaces/product';
import { PhoneCategory } from '../Enums/phone-category';
import { PhoneNumberType } from '../Models/phone-number-type';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberService {
  baseUrl = 'https://localhost:7058/api/Customer';

  phoneNumberTypes: PhoneNumberType[] = [
    { prefix: '050', phoneCategory: PhoneCategory.Mobile },
    { prefix: '051', phoneCategory: PhoneCategory.Mobile },
    { prefix: '052', phoneCategory: PhoneCategory.Mobile },
    { prefix: '053', phoneCategory: PhoneCategory.Mobile },
    { prefix: '054', phoneCategory: PhoneCategory.Mobile },
    { prefix: '055', phoneCategory: PhoneCategory.Mobile },
    { prefix: '09', phoneCategory: PhoneCategory.Landline },
    { prefix: '08', phoneCategory: PhoneCategory.Landline },
    { prefix: '04', phoneCategory: PhoneCategory.Landline },
    { prefix: '03', phoneCategory: PhoneCategory.Landline },
    { prefix: '02', phoneCategory: PhoneCategory.Landline },
    { prefix: '07', phoneCategory: PhoneCategory.Landline },
    // { prefix: '12', length: 2, phoneCategory: PhoneCategory.Emergency },
    // { prefix: '11', length: 1, phoneCategory: PhoneCategory.Emergency },
    // { prefix: '10', length: 1, phoneCategory: PhoneCategory.Emergency },
  ]

  constructor(private http: HttpClient) { }

  getPhoneNumberTypes(phoneCategory?: PhoneCategory) {
    return !phoneCategory ? this.phoneNumberTypes
      : this.phoneNumberTypes.filter(phoneNumberType => phoneNumberType.phoneCategory === phoneCategory)
  }

  isPhoneNumberExist(phoneNumber:string) {
    return this.http.get<boolean>(`${this.baseUrl}/ISCustomerPhoneNumberExists/${phoneNumber}`);
  }
}
