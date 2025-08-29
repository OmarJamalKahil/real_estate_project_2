// import { Photo } from "src/common/entities/Photo.entity";
// import { PropertyTypeOperation } from "src/property/common/property-type-operation.enum";
// import { PropertyPhotos } from "src/property/entities/property_photos.entity";
// import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// import { PropertyRequestPhoto } from "./property-request-photo.entity";


// export enum EnumPropertyRequestStatus {
//     Pending = 'pending',
//     Accepted = 'accepted',
//     Rejected = 'rejected',
// }


// @Entity()
// export class PropertyRequest {

//     @PrimaryGeneratedColumn('uuid')
//     id: string;

//     @Column({
//         type: 'enum',
//         enum: PropertyTypeOperation,
//         default: PropertyTypeOperation.Selling
//     })
//     typeOperation: PropertyTypeOperation;

//     @Column()
//     propertyNumber: string;

//     @Column({
//         type: 'enum',
//         enum: EnumPropertyRequestStatus,
//         default: EnumPropertyRequestStatus.Pending
//     })
//     status: EnumPropertyRequestStatus;

//     @OneToMany(() => PropertyRequestPhoto, (propertyRequestPhoto) => propertyRequestPhoto.porpertyRequest)
//     photos: PropertyRequestPhoto[];


//     @Column({
//         type: 'date',
//         default: new Date()
//     })
//     createdAt: Date;

// }



import { Photo } from "src/common/entities/Photo.entity";
import { PropertyTypeOperation } from "src/property/common/property-type-operation.enum";
import { PropertyPhotos } from "src/property/entities/property_photos.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PropertyRequestPhoto } from "./property-request-photo.entity";
import { Property } from "src/property/entities/property.entity";
import { Record } from "src/archive/entities/record.entity";


export enum EnumPropertyRequestStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Rejected = 'rejected',
}


@Entity()
export class PropertyRequest {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    // @Column({
    //     type: 'enum',
    //     enum: PropertyTypeOperation,
    //     default: PropertyTypeOperation.Selling
    // })
    // typeOperation: PropertyTypeOperation;

    @OneToOne(() => Property)
    @JoinColumn()
    property: Property;

    @Column({
        type: 'enum',
        enum: EnumPropertyRequestStatus,
        default: EnumPropertyRequestStatus.Pending
    })
    status: EnumPropertyRequestStatus;

    @OneToMany(() => PropertyRequestPhoto, (propertyRequestPhoto) => propertyRequestPhoto.porpertyRequest)
    photos: PropertyRequestPhoto[];


    @Column({
        type: 'date',
        default: new Date()
    })
    createdAt: Date;

    @OneToOne(() => Record, {onDelete: 'CASCADE'})
    @JoinColumn()
    record: Record

}
