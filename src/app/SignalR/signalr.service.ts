import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { ProductMinimalDetails } from '../General/Models/product-minimal-details';
import { Product } from '../Product/interfaces/product';


@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  BaseUrl: string = 'https://localhost:7058';
  // outOfStockProducts1: ProductMinimalDetails[] = [];
  Products: Product[] = [];

  productsChanged$: Subject<Product[]>= new Subject<Product[]>();

  private hubConnection!: signalR.HubConnection;

  constructor() { }

  get outeOfStockProducts(): Product[] {
    return this.Products.filter(product => product.quantity < 1)
  }

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.BaseUrl}/stockHub`
      )
      .build();

    return this.hubConnection
      .start()
      .then(() => console.log('Connection started'))

      .catch(err => console.log('Error while starting connection: ' + err))
  }

  addDataListener = () => {
    this.hubConnection.on('sendupdate', (data:Product[]) => {
      // this.updateOutOfStockProducts(data);
      this.updateProducts(data);
      this.productsChanged$.next(data);
    });

    this.hubConnection.onclose(_ => console.log('Connection closed'));
  }

  sendMessage(message?: string) {
    this.hubConnection.invoke('sendupdate', [])
      .catch(err => console.log('Error while sending message: ' + err))
  }

  // private updateOutOfStockProducts(data: ProductMinimalDetails[]) {
  //   data.forEach(newProduct => {
  //     const index = this.outOfStockProducts1.findIndex(product => product.id === newProduct.id);
  //     if (index == -1) {
  //       this.outOfStockProducts1.push(newProduct);
  //     }
  //     else {
  //       this.outOfStockProducts1[index] = newProduct;
  //     }
  //   })
  // }

  private updateProducts(data: Product[]) {
    data.forEach(newProduct => {
      const index = this.Products.findIndex(product => product.id === newProduct.id);
      if (index == -1) {
        this.Products.push(newProduct);
      }
      else {
        this.Products[index] = newProduct;
      }
    })
  }
}
