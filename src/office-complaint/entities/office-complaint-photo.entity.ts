import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OfficeComplaint } from "./office-complaint.entity";

@Entity()
export class OfficeComplaintPhoto{

     @PrimaryGeneratedColumn('uuid')
      id: string;
    
      @ManyToOne(() => OfficeComplaint, (officeComplaint) => officeComplaint.officeComplaintPhotos,{eager:false, onDelete: 'CASCADE'})
      officeComplaint: OfficeComplaint;
    
      @Column()
      public_id: string;
    
      @Column() 
      url: string;
} 