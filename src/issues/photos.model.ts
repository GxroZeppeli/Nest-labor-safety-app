import {
  AutoIncrement,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import Issues from './issues.model';

@Table({ tableName: 'photos', timestamps: false })
export default class Photos extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @ForeignKey(() => Issues)
  @Column
  issue: number;

  @Column
  path: string;
}
