import { CustomerType } from "../Enums/customer-type";

export interface Customer {
    id: number;
    firstName: string,
    lastName: string,
    type: CustomerType,
}
