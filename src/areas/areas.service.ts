import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Areas from './areas.model';
import CreateAreaDto from './dto/create-area.dto';
import UpdateAreaDto from './dto/update-area.dto';
import { UsersService } from 'src/users/users.service';
import { IssuesService } from 'src/issues/issues.service';

@Injectable()
export class AreasService {
  constructor(
    @InjectModel(Areas)
    private readonly areaModel: typeof Areas,
    @Inject(forwardRef(() => IssuesService))
    private readonly issuesService: IssuesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async getArea(id: number) {
    try {
      return await this.areaModel.findOne({
        where: { id },
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new BadRequestException('Неверный id');
    }
  }

  async getAreas() {
    return await this.areaModel.findAll();
  }

  async createArea(body: CreateAreaDto, user: { role: string }) {
    if (user.role !== 'Администратор')
      throw new ForbiddenException({
        message: 'Только администратор может создать подразделение',
      });
    try {
      await this.usersService.findOneById(body.manager);
    } catch (error) {
      throw new BadRequestException('Неверный id начальника');
    }

    return await this.areaModel.create({ ...body });
  }

  async updateArea(id: number, body: UpdateAreaDto, user: { role: string }) {
    if (user.role !== 'Администратор')
      throw new ForbiddenException({
        message: 'Только администратор может изменить подразделение',
      });
    try {
      await this.usersService.findOneById(body.manager);
    } catch (error) {
      throw new BadRequestException('Неверный id начальника');
    }

    return await this.areaModel.update(body, { where: { id } });
  }

  async deleteArea(id: number, user: { sub: number; role: string }) {
    if (user.role !== 'Администратор')
      throw new ForbiddenException({
        message: 'Только администратор может удалить подразделение',
      });

    try {
      await this.areaModel.findOne({ where: { id }, rejectOnEmpty: true });
    } catch (error) {
      throw new BadRequestException('Неверный id');
    }

    await this.issuesService.destroyIssuesByArea(id, user);

    return await this.areaModel.destroy({ where: { id } });
  }

  async destroyAreasByManager(id: number, user: { sub: number; role: string }) {
    const areas = await this.areaModel.findAll({ where: { manager: id } });
    await Promise.all(areas.map((area) => this.deleteArea(area.id, user)));
  }
}
