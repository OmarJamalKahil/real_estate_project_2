// // import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
// // import { validate } from 'class-validator';
// // import { plainToClass } from 'class-transformer';
// // import { CreatePropertyDto } from '../../property/dto/create-property.dto';  // Adjust the import based on your DTO location

// // @Injectable()
// // export class CreatePropertyValidationPipe implements PipeTransform {
// //   async transform(value: any, metadata: ArgumentMetadata) {
// //     // Parse the JSON string received in createPropertyDto
// //     const createPropertyDto: CreatePropertyDto = plainToClass(CreatePropertyDto, JSON.parse(value));

// //     // Manually validate the DTO
// //     const errors = await validate(createPropertyDto);
// //     if (errors.length > 0) {
// //       throw new BadRequestException('Validation failed', errors);
// //     }

// //     // Return the validated object
// //     return createPropertyDto;
// //   }
// // }



// import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
// import { validate } from 'class-validator';
// import { plainToClass } from 'class-transformer';
// import { CreatePropertyDto } from '../../property/dto/create-property.dto';  // Adjust the import path if necessary

// @Injectable()
// export class CreatePropertyValidationPipe implements PipeTransform {
//   async transform(value: any, metadata: ArgumentMetadata) {
//     // Parse the JSON string received in createPropertyDto
//     // console.log("value",JSON.parse(value));
//     // console.log("value",JSON.stringify(value));
    
//     const createPropertyDto: CreatePropertyDto = plainToClass(CreatePropertyDto, JSON.parse(value));

//     // Manually validate the DTO
//     const errors = await validate(createPropertyDto);
//     if (errors.length > 0) {
//     const errorMessages = errors
//         .map((error) => {
//           // Check if constraints are defined
//           const constraints = error.constraints ? Object.values(error.constraints).join(', ') : 'No constraints available';
//           return `${error.property}: ${constraints}`;
//         })
//         .join('; ');

//       // Throw the BadRequestException with the formatted error message
//       throw new BadRequestException(`Validation failed: ${errorMessages}`);
//     }

//     // Return the validated object
//     return createPropertyDto;
//   } 
// }




// import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
// import { validate } from 'class-validator';
// import { plainToClass } from 'class-transformer';
// import { CreatePropertyDto } from '../../property/dto/create-property.dto';  // Adjust the import path if necessary

// @Injectable()
// export class CreatePropertyValidationPipe implements PipeTransform {
//   async transform(value: any, metadata: ArgumentMetadata) {
//     // Directly use the value without parsing, as it's already an object
//     const createPropertyDto: CreatePropertyDto = plainToClass(CreatePropertyDto, value);

//     // Manually validate the DTO
//     const errors = await validate(createPropertyDto);
//     if (errors.length > 0) {
//       // Format the errors into a readable string
//       const errorMessages = errors
//         .map((error) => {
//           // Check if constraints are defined
//           const constraints = error.constraints ? Object.values(error.constraints).join(', ') : 'No constraints available';
//           return `${error.property}: ${constraints}`;
//         })
//         .join('; ');

//       // Throw the BadRequestException with the formatted error message
//       throw new BadRequestException(`Validation failed: ${errorMessages}`);
//     }

//     // Return the validated object
//     return createPropertyDto;
//   }
// }









import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreatePropertyDto } from '../../property/dto/create-property.dto';  // Adjust the import path if necessary

@Injectable()
export class CreatePropertyValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Transform plain object to class instance
    const createPropertyDto: CreatePropertyDto = plainToClass(CreatePropertyDto, value);

    // Manually validate the DTO
    const errors = await validate(createPropertyDto);
    if (errors.length > 0) {
      // Format the errors into a readable string
      const errorMessages = errors
        .map((error) => {
          // Check if constraints are defined
          const constraints = error.constraints ? Object.values(error.constraints).join(', ') : 'No constraints available';
          return `${error.property}: ${constraints}`;
        })
        .join('; ');

      // Throw the BadRequestException with the formatted error message
      throw new BadRequestException(`Validation failed: ${errorMessages}`);
    }

    // Return the validated object
    return createPropertyDto;
  }
}
