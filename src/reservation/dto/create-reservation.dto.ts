import { IsEnum, IsNotEmpty, IsNumber, IsString, Length, Matches, Max, Min } from "class-validator";
import { PaymentCardType } from "src/payment-card/entities/payment-card.entity";

export class CreateReservationDto {

    @IsEnum(PaymentCardType)
    type: PaymentCardType;

    @IsString()
    @Matches(/^\d+$/, { message: 'cardNumber must contain only digits' })
    @Length(12, 19, { message: 'cardNumber must be between 12 and 19 digits' })
    cardNumber: string;

    @IsNumber()
    @Min(1)
    @Max(12)
    expiryMonth: number;

    @IsNumber()
    // @Min(new Date().getFullYear()) // adjust logic as needed
    @Max(new Date().getFullYear() + 20)
    expiryYear: number;

    @IsString()
    @Matches(/^\d{3,4}$/, { message: 'cvv must be 3 or 4 digits' })
    cvv: string;


    @IsNumber()
    @IsNotEmpty()
    amount: number;
}
