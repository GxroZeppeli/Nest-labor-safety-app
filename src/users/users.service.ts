import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import User from './users.model';
import { IssuesService } from 'src/issues/issues.service';
import UpdateDataDto from 'src/auth/dto/update-data.dto';
import { AreasService } from 'src/areas/areas.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @Inject(forwardRef(() => IssuesService))
    private readonly issuesService: IssuesService,
    @Inject(forwardRef(() => AreasService))
    private readonly areasService: AreasService,
  ) {}

  async findOneByLogin(username: string): Promise<User | undefined> {
    return await this.userModel.findOne({
      where: { login: username },
    });
  }

  async findOneById(id: number): Promise<User | undefined> {
    return await this.userModel.findOne({ where: { id }, rejectOnEmpty: true });
  }

  async getProfile(id: number) {
    return await this.userModel.findOne({
      where: { id },
      attributes: { exclude: ['salt', 'hash'] },
    });
  }

  async findAll() {
    return await this.userModel.findAll({
      attributes: { exclude: ['salt', 'hash'] },
    });
  }

  async create(createUserDto: any) {
    return await this.userModel.create(createUserDto);
  }

  async updatePassword(id: number, salt: string, hash: string) {
    await this.userModel.update({ salt, hash }, { where: { id } });
  }

  async update(id: number, updateDto: UpdateDataDto) {
    return await this.userModel.update(updateDto, { where: { id } });
  }

  async delete(id: number, user: { sub: number; role: string }) {
    if (user.role !== 'Администратор')
      throw new ForbiddenException({
        message: 'Только администратор может удалить пользователя',
      });

    try {
      await this.userModel.findOne({ where: { id }, rejectOnEmpty: true });
    } catch (error) {
      throw new BadRequestException('Неверный id пользователя');
    }

    await this.issuesService.destroyUsersIssues(id, user);
    await this.areasService.destroyAreasByManager(id, user);

    return await this.userModel.destroy({ where: { id } });
  }

  async checkLoginTaken(login: string) {
    const user = await this.userModel.findOne({ where: { login } });
    return user ? true : false;
  }
}
