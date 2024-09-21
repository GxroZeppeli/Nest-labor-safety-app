import { MinLength } from 'class-validator';

export default class SignInDto {
  @MinLength(4, { message: 'Минимальная длина логина 4 символа' })
  username: string;

  @MinLength(10, { message: 'Минимальная длина пароля 10 символов' })
  password: string;
}
