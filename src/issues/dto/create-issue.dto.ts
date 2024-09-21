import { ArrayMinSize, IsEnum, IsPositive, MinLength } from 'class-validator';

const categories = [
  'Инструменты',
  'Оборудование',
  'Лестницы/площадки',
  'Порядок на рабочем месте',
  'Средства индивидуальной защиты',
  'Другое',
];

export default class CreateIssueDto {
  @IsPositive()
  area: number;

  @MinLength(6, { message: 'Координаты должны быть больше 6 символов' })
  coordinates: string;

  @IsEnum(categories)
  category: string;

  @IsEnum(['Низкий', 'Средний', 'Высокий'])
  risk: string;

  @MinLength(6, {
    message: 'Описание рекомендуемых действий должно быть больше 6 символов',
  })
  fix: string;

  @MinLength(6, {
    message: 'Краткое описание должно быть больше 6 символов',
  })
  description: string;

  @IsEnum(['На рассмотрении', 'В процессе устранения', 'Устранено'])
  status: string;

  @ArrayMinSize(1, { message: 'Необходимо прикрепить хотя бы одну фотографию' })
  base64Photos: string[];

  @ArrayMinSize(1, { message: 'Необходим как минимум один ответственный' })
  users: number[];
}
