import { Blog } from "src/blog/entities/blog.entity";
import { User } from "src/user/entities/user.entity";

export interface PropertyResponse {
    id: string;
    office: {
        id: string;
        name: string;
        office_phone: string;
        office_photo: {
            id: string;
            url: string;
            public_id: string;
        };
        // blogs?: Blog[]; // You can replace 'any' with a more specific type if known
    };
    propertyNumber: string;
    space: number;
    price: number;
    description: string;
    type: {
        id: string;
        name: string;
    };
    location: {
        id: string;
        governorate: string;
        province: string;
        city: string;
        street: string;
    };
    publishDate: Date; // ISO string
    status: string;
    softDelete: boolean;
    // owner: string

    photos: {
        id: string;
        public_id: string;
        url: string;
    }[];
    // licenseDetails: {
    //     id: string;
    //     license: {
    //         id: string;
    //         name: string;
    //     };
    //     licenseNumber: string;
    //     date: Date; // ISO string
    // };
    propertyAttributes: {
        id: string;
        attribute: {
            id: string;
            name: string;
        };
        value: number | string ;
    }[];
}
