import { CustomerType } from "src/app/Customer/Enums/customer-type";
import { DateRange } from "src/app/General/Models/date-range";

export interface OrderFiltersValuesModel{
    customerType?: CustomerType;
    customerNameSearchValue?: string;
    productNameSearchValue?: string;
    dateRange?: DateRange;
}