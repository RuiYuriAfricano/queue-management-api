import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateQueueDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  serviceId: number;

  @IsString()
  @IsNotEmpty()
  status: string; // \"waiting\", \"in_progress\", \"completed\"
}
