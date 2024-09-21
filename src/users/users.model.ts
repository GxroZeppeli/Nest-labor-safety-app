import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: false,
})
export default class User extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @Column
  login: string;

  @Column
  name: string;

  @Column
  email: string;

  @Column
  hash: string;

  @Column
  salt: string;

  @Column
  role: string;

  @Column
  occupation: string;
}
