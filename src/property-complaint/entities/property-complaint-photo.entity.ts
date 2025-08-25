import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PropertyComplaint } from './property-complaint.entity';

@Entity()
export class PropertyComplaintPhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => PropertyComplaint,
    (propertyComplaint) => propertyComplaint.propertyComplaintPhotos,
    { eager: false ,onDelete: 'CASCADE' }
  )
  propertyComplaint: PropertyComplaint;

  @Column()
  public_id: string;

  @Column()
  url: string;
}
