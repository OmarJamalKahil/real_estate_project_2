import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PropertyRequest } from "./property-request.entity";







@Entity()
export class PropertyRequestPhoto {


    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string;

    @Column()
    public_id: string;


    @ManyToOne(() => PropertyRequest, (propertyRequest) => propertyRequest.photos)
    porpertyRequest: PropertyRequest;
}