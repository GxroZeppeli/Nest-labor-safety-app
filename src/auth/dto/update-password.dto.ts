import { IsOptional, MinLength } from 'class-validator';

export default class UpdatePasswordDto {
  @IsOptional()
  user: number;

  @IsOptional()
  old_password: string;

  @MinLength(10, { message: 'Минимальная длина пароля 10 символов' })
  new_password: string;
}
