import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { ProductsService } from 'src/app/Product/Services/products.service';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-edit-product-dialog',
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.css']
})
export class EditProductDialogComponent implements OnInit {
  ProductForm: FormGroup = new FormGroup({
    Description: new FormControl('', Validators.required),
    Price: new FormControl('', {
      validators: [
        Validators.required,
      ]
    }),
    Quantity: new FormControl('', Validators.required)
  });

  ServerErrorMessage!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public product: Product,
    private CreateProductDialogRef: MatDialogRef<EditProductDialogComponent>,
    private ProductService: ProductsService,
  ) { }

  ngOnInit(): void {
    this.fillProductData();
  }

  fillProductData(){
    this.ProductForm.patchValue({
      Description:this.product.description,
      Price: this.product.price,
      Quantity: this.product.quantity
    })
  }

  CancelClick() {
    this.CreateProductDialogRef.close();
  }

  updateClick() {
    if (this.ProductForm.invalid) {
      this.ProductForm.markAllAsTouched();
      return;
    }
    this.ServerErrorMessage = '';
    this.ProductService.update({
      id: this.product.id,
      description: this.ProductForm.get('Description')?.value,
      price: this.ProductForm.get('Price')?.value,
      quantity: this.ProductForm.get('Quantity')?.value
    }).
      subscribe(
        {
          next: (actionStatus: ActionStatus) => {
            if (actionStatus.success) {
              this.CreateProductDialogRef.close(true);
            }
            else {
              this.ServerErrorMessage = actionStatus.message;
            }
          },
          error: (error: any) => this.ServerErrorMessage = 'Action failed please try again'
        }
      );
  }
}
