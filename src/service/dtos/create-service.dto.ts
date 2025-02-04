import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  companyId: number;

  @IsInt()
  averageServiceTime: number;

  @IsString()
  status: string;  // Novo campo para status do serviço ("open" ou "closed")

  @IsString()
  location: string;
}
