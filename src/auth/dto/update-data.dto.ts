import { IsEnum, Matches, MinLength } from 'class-validator';

export default class UpdateDataDto {
  id: number;

  @MinLength(4, { message: 'Минимальная длина логина 4 символа' })
  login: string;

  @MinLength(8, { message: 'Поле должно быть заполнено' })
  name: string;

  @Matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, {
    message: 'Некорректная почта',
  })
  email: string;

  @IsEnum(['Исполнитель', 'Администратор'], { message: 'Некорректная роль' })
  role: string;

  @MinLength(5, { message: 'Поле должно быть заполнено' })
  occupation: string;
}
