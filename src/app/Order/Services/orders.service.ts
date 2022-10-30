import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { Order } from '../interfaces/order';
import { OrderFiltersValuesModel } from '../Models/order-filters-values-model';
import { TotalMonthlyOrders } from '../Models/total-monthly-orders';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  BaseUrl: string = 'https://localhost:7058/api/Order'

  constructor(private http: HttpClient) { }

  getById(id: number) {
    return this.http.get<Order>(`${this.BaseUrl}/GetOrder/${id}`);
  }

  create(order: Order) {
    return this.http.post<ActionStatus>(`${this.BaseUrl}/CreateOrder`, order);
  }

  update(order: Order) {
    return this.http.put<ActionStatus>(`${this.BaseUrl}/UpdateOrder`, order)
  }

  delete(id: number) {
    return this.http.delete<ActionStatus>(`${this.BaseUrl}/DeleteOrder/${id}`);
  }

  getExcelReportByFilter(orderFilters: OrderFiltersValuesModel) {
    return this.http.post(`${this.BaseUrl}/ExportToExcel`, orderFilters,
      {
        // headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' },
        responseType: 'blob',
        observe: 'response'
      });
  }

  getByFilter(orderFilters: OrderFiltersValuesModel) {
    return this.http.post<Order[]>(`${this.BaseUrl}/GetOrdersByFilters`, orderFilters);
  }

  getByFiltersWithFullName(orderFilters: OrderFiltersValuesModel): Observable<Order[]> {
    return this.getByFilter(orderFilters)
      .pipe(
        map((data) => {
          data.forEach(o => o.customerFullName = o.firstName + ' ' + o.lastName);
          return data;
        }),
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

  getTotalMonthlyOrdersByYear(year: number) {
    return this.http.get<TotalMonthlyOrders[]>(`${this.BaseUrl}/GetTotalMonthlyOrdersByYear/${year}`)
      .pipe(
        map(data => {
          data.forEach(item => item.date = new Date(item.date));
          return data;
        }));
  }
}
