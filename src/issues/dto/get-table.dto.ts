import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

const sortCols = ['id', 'area', 'coordinates', 'category', 'risk', 'fix', 'status'];
const filterCols = ['responsible', 'area', 'category', 'risk', 'status'];

export class GetTableDto {
  @Min(1)
  @IsInt()
  page: number;

  @IsEnum(sortCols)
  @IsOptional()
  sortCol: string;

  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder: string;

  @IsEnum(filterCols)
  @IsOptional()
  filterCol: string;

  @IsOptional()
  filterVal: string;
}
