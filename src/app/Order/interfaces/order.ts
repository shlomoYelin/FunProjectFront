

import { CustomerType } from "src/app/Customer/Enums/customer-type";
import { ProductOrder } from "./product-order";

export interface Order {
    id: number;
    customerId: number;
    productOrders:Array<ProductOrder>;
    payment:number;
    date:Date;
    firstName?:string;
    lastName?:string;
    customerFullName?: string;
    customerType?: CustomerType;
    // public set _customerFullName(val: string) { this.customerFullName = `${this.firstName} ${this.lastName}`;};
}
