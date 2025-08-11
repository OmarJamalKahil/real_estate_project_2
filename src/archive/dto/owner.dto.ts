import { PropertyTypeOperation } from "src/property/common/property-type-operation.enum";


export class OwnerDto{

    owner_personal_Identity_Number: number;

    owner_name: string;

    price: number;

    date: Date;

    type: PropertyTypeOperation;

    sell_Date: Date | null;

    rental_Start_Date: Date | null;

    rental_End_Date: Date | null;
}