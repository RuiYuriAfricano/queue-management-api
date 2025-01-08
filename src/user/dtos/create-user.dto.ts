import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('AO')
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  role: string; // "consumer" or "producer"
}
