import {
  AutoIncrement,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import User from 'src/users/users.model';
import Issues from './issues.model';

@Table({ tableName: 'responsible', timestamps: false })
export default class Responsible extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  user_id: number;

  @ForeignKey(() => Issues)
  @Column
  issue: number;
}
