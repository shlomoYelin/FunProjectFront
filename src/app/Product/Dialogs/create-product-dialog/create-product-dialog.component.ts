import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActionStatus } from 'src/app/General/Models/action-status';
import { ProductsService } from 'src/app/Product/Services/products.service';

@Component({
  selector: 'app-create-product-dialog',
  templateUrl: './create-product-dialog.component.html',
  styleUrls: ['./create-product-dialog.component.css']
})
export class CreateProductDialogComponent implements OnInit {

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
    private CreateProductDialogRef: MatDialogRef<CreateProductDialogComponent>,
    private ProductService: ProductsService,
  ) { }

  ngOnInit(): void {
  }

  CancelClick() {
    this.CreateProductDialogRef.close();
  }

  CreateClick() {
    if (this.ProductForm.invalid) {
      this.ProductForm.markAllAsTouched();
      return;
    }
    this.ServerErrorMessage = '';
    this.ProductService.create({
      id: 0,
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
