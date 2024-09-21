import { IsPositive, MinLength } from 'class-validator';

export default class CreateAreaDto {
  @MinLength(5, { message: 'Минимальная длина названия 5 символов' })
  name: string;

  @MinLength(3, { message: 'Минимальная длина кода 3 символа' })
  code: string;

  @IsPositive({ message: 'Id менеджера должно быть положительным числом' })
  manager: number;
}
