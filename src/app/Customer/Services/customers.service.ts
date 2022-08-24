import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { Customer } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  baseUrl: string = 'https://localhost:7058/api/Customer'

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Customer[]>(`${this.baseUrl}/GetAllCustomers`);
  }

  getBySearchValue(searchValue: string) {
    let params = new HttpParams().set('searchValue', searchValue);

    return this.http.get<Customer[]>(`${this.baseUrl}/GetCustomersBySearchValue/`,{params: params})
    // return this.http.get<Customer[]>(`${this.baseUrl}/GetCustomersBySearchValue/${searchValue}`)
  }
  
  create(customer: Customer) {
    return this.http.post<ActionStatus>(`${this.baseUrl}/CreateCustomer`, customer);
  }

  update(customer: Customer) {
    return this.http.put<ActionStatus>(`${this.baseUrl}/UpdateCustomer`, customer);
  }

  delete(id: number) {
    return this.http.delete<ActionStatus>(`${this.baseUrl}/DeleteCustomer/${id}`);
  }
}
