import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { ProductMinimalDetails } from 'src/app/General/Models/product-minimal-details';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  baseUrl: string = 'https://localhost:7058/api/Product';

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Product[]>(`${this.baseUrl}/GetAllProducts`);
  }

  create(product: Product) {
    return this.http.post<ActionStatus>(`${this.baseUrl}/CreateProduct`, product);
  }

  update(product: Product) {
    return this.http.put<ActionStatus>(`${this.baseUrl}/UpdateProduct`, product);
  }

  delete(id: number) {
    return this.http.delete<ActionStatus>(`${this.baseUrl}/DeleteProduct/${id}`);
  }

  getBySearchValue(searchValue: string) {
    return this.http.get<Product[]>(`${this.baseUrl}/GetProductsBySearchValue/${searchValue}`)
  }

  IsInStock(productId: number, quantity: number) {
    return this.http.get<number>(`${this.baseUrl}/IsInStock/${productId}/${quantity}`)
  }

  getAllOutOfStockProducts() {
    return this.http.get<Product[]>(`${this.baseUrl}/GetOutOfStockProducts`);
      // .pipe(
      //   map(products => products.map<ProductMinimalDetails>(product => {
      //     return {
      //       id: product.id,
      //       productName: product.description,
      //       isInStock: false
      //     }
      //   }))
      // )
  }
}
