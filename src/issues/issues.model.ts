import {
  AutoIncrement,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import Areas from 'src/areas/areas.model';

@Table({ tableName: 'issues', timestamps: false })
export default class Issues extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  id: number;

  @ForeignKey(() => Areas)
  @Column
  area: number;

  @Column
  coordinates: string;

  @Column
  category: string;

  @Column
  risk: string;

  @Column
  fix: string;

  @Column
  description: string;

  @Column
  status: string;
}
