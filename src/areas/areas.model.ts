import {
  AutoIncrement,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import User from 'src/users/users.model';

@Table({ tableName: 'areas', timestamps: false })
export default class Areas extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  name: string;

  @Column
  code: string;

  @ForeignKey(() => User)
  @Column
  manager: number;
}
