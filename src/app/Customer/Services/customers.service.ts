import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActionStatus } from 'src/app/General/interfaces/action-status';
import { Customer } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  BaseUrl: string = 'https://localhost:7058/api/Customer'

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Customer[]>(this.BaseUrl);
  }
  
  create(customer: Customer) {
    return this.http.post<ActionStatus>(this.BaseUrl, customer);
  }

  update(customer: Customer) {
    return this.http.put<ActionStatus>(this.BaseUrl, customer);
  }

  delete(id: number) {
    return this.http.delete<ActionStatus>(`${this.BaseUrl}/${id}`);
  }
}
