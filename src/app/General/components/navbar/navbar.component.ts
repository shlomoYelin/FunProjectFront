import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/Product/interfaces/product';
import { ProductsService } from 'src/app/Product/Services/products.service';
import { SignalrService } from 'src/app/SignalR/signalr.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  navListFlag = false;

  constructor(public _signalrService: SignalrService, private _productsService: ProductsService) { }

  ngOnInit(): void {
    this._signalrService.startConnection()
      .then(() => {
        this._signalrService.addDataListener();
        this.setAllOutOfStockProducts();
      });
  }

  setAllOutOfStockProducts() {
    this._productsService.getAllOutOfStockProducts()
      .subscribe(
        {
          next: (data: Product[]) => this._signalrService.Products = data,
          error: console.log
        }
      )

  }
}
