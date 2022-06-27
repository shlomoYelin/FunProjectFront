import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { ActionStatus } from 'src/app/General/interfaces/action-status';
import { Order } from '../interfaces/order';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  BaseUrl: string = 'https://localhost:7058/api/Order'

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Order[]>(this.BaseUrl);
  }

  getById(id: number) {
    return this.http.get<Order>(`${this.BaseUrl}/${id}`)
  }

  create(order: Order) {
    return this.http.post<ActionStatus>(this.BaseUrl, order);
  }

  update(order: Order) {
    return this.http.put<ActionStatus>(this.BaseUrl, order)
  }

  delete(id: number) {
    return this.http.delete<ActionStatus>(`${this.BaseUrl}/${id}`);
  }

  getAllWithFullName(): Observable<Order[]> {
    return this.getAll()
      .pipe(
        map((data) => {
          data.forEach(o => o.customerFullName = o.firstName + ' ' + o.lastName);
          return data;
        })
      )
  }

  getByIdWithFullName(id: number) {
    return this.getById(id)
      .pipe(
        map(
          (order) => {
            order.customerFullName = order.firstName + ' ' + order.lastName;
            return order;
          }
        )
      )
  }
}
