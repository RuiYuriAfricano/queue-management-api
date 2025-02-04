import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateQueueDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  serviceId: number;

  @IsString()
  status: string; // \"waiting\", \"abandoned\", \"completed\"
}
