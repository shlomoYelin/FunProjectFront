import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { ActionStatus } from 'src/app/General/interfaces/action-status';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  baseUrl: string = 'https://localhost:7058/api/Product';

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Product[]>(this.baseUrl);
  }

  create(product: Product) {
    return this.http.post<ActionStatus>(this.baseUrl, product);
  }

  update(product: Product) {
    return this.http.put<ActionStatus>(this.baseUrl, product);
  }

  delete(id: number) {
    return this.http.delete<ActionStatus>(`${this.baseUrl}/${id}`);
  }

  getBySearchValue(searchValue:string) {
    return this.http.get<Product[]>(`${this.baseUrl}/${searchValue}`)
  }


  g() {
    return this.http.get<Product[]>(this.baseUrl)
      .pipe(
        switchMap(
          (order) => {
            // order.customerFullName = order.firstName + ' ' + order.lastName;
            // order.
            return order//this.getAll();
          }
        )
      )
  }
}
