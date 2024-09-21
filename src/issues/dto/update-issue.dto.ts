import { IsArray, IsEnum, IsPositive, MinLength } from 'class-validator';

const categories = [
  'Инструменты',
  'Оборудование',
  'Лестницы/площадки',
  'Порядок на рабочем месте',
  'Средства индивидуальной защиты',
  'Другое',
];

export default class UpdateIssueDto {
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

  @IsPositive({ message: 'ID подразделения должен быть больше 0' })
  area: number;

  @IsArray({ message: 'Удаленные фото должны быть массивом' })
  removedPhotos: string[];

  @IsArray({ message: 'Добавленные фото должны быть массивом' })
  addedPhotos: string[];

  @IsArray({ message: 'Удаленные ответственные должны быть массивом' })
  removedResponsibles: number[];

  @IsArray({ message: 'Добавленные ответственные должны быть массивом' })
  addedResponsibles: number[];
}
