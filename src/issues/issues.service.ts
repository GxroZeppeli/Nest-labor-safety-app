import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import Issues from './issues.model';
import CreateIssueDto from './dto/create-issue.dto';
import UpdateIssueDto from './dto/update-issue.dto';
import Responsible from './responsible.model';
import Photos from './photos.model';
import { UsersService } from 'src/users/users.service';
import { AreasService } from 'src/areas/areas.service';
import { join } from 'path';
import { unlink, writeFile } from 'node:fs/promises';
import { GetTableDto } from './dto/get-table.dto';
import { FindOptions } from 'sequelize';

@Injectable()
export class IssuesService {
  constructor(
    @InjectModel(Issues)
    private readonly issueModel: typeof Issues,
    @InjectModel(Responsible)
    private readonly responsibleModel: typeof Responsible,
    @InjectModel(Photos)
    private readonly photosModel: typeof Photos,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AreasService))
    private readonly areasService: AreasService,
  ) {}

  itemsPerPage = 10;

  async getIssues(page: number, user: { sub: number; role: string }) {
    const offset = (page - 1) * this.itemsPerPage;
    const query = {
      limit: this.itemsPerPage,
      offset,
      order: [['id', 'DESC']],
    };

    if (user.role !== 'Администратор') {
      const issueIds = await this.responsibleModel.findAll({
        where: { user_id: user.sub },
      });
      query['where'] = { id: issueIds.map((issue) => issue.issue) };
    }

    const result = await this.issueModel.findAndCountAll(query as FindOptions);
    const nextPage =
      page < Math.ceil(result.count / this.itemsPerPage) ? page + 1 : null;
    return { issues: result.rows, nextPage };
  }

  async getTable({
    page = 1,
    sortCol = 'id',
    sortOrder = 'DESC',
    filterCol = '',
    filterVal = '',
  }: GetTableDto) {
    const query = {
      limit: this.itemsPerPage,
      offset: (page - 1) * this.itemsPerPage,
      order: [[sortCol, sortOrder]],
    };

    if (filterCol && filterVal) {
      if (['area', 'category', 'risk', 'status'].includes(filterCol)) {
        query['where'] = { [filterCol]: filterVal };
      } else if (filterCol === 'responsible') {
        const issueIds = await this.responsibleModel.findAll({
          where: { user_id: filterVal },
        });
        query['where'] = { id: issueIds.map((issue) => issue.issue) };
      }
    }

    const issues = await this.issueModel.findAndCountAll(query as FindOptions);
    const result = {};
    result['rows'] = await Promise.all(
      issues.rows.map(async (issue) => {
        issue.dataValues['area'] = (
          await this.areasService.getArea(issue.dataValues['area'])
        ).dataValues.name;
        issue.dataValues['responsible'] = await Promise.all(
          (
            await this.responsibleModel.findAll({ where: { issue: issue.id } })
          ).map(
            async (responsible) =>
              (await this.usersService.findOneById(responsible.user_id))
                .dataValues.name,
          ),
        );
        return issue.dataValues;
      }),
    );
    result['amount'] = issues.count;
    return result;
  }

  async getIssue(id: number, user: { sub: number; role: string }) {
    const issue = await this.issueModel.findOne({ where: { id } });
    if (!issue) throw new BadRequestException('Неверный id замечания');
    const result = { ...issue.dataValues };

    result.photos = (
      await this.photosModel.findAll({ where: { issue: id } })
    ).map((entry) => entry.dataValues.path);

    result.area = (await this.areasService.getArea(result.area)).dataValues;

    result.responsible = await Promise.all(
      (await this.responsibleModel.findAll({ where: { issue: id } }))
        .map((entry) => entry.dataValues.user_id)
        .map(async (id) => {
          const user = (await this.usersService.findOneById(id)).dataValues;
          return { id: user.id, name: user.name };
        }),
    );

    result.access_level = user.role === 'Администратор' ? 'admin' : 'user';

    if (user.role !== 'Администратор') {
      if (result.responsible.find((responsible) => responsible.id === user.sub))
        result.access_level = 'responsible';
    }

    return result;
  }

  async destroyIssuesByArea(id: number, user: { role: string }) {
    const issues = await this.issueModel.findAll({ where: { area: id } });
    await Promise.all(issues.map((issue) => this.deleteIssue(issue.id, user)));
  }

  async destroyUsersIssues(id: number, user: { role: string }) {
    const issueIds = await this.responsibleModel.findAll({
      where: { user_id: id },
    });
    await Promise.all(
      issueIds.map((issue) => this.deleteIssue(issue.issue, user)),
    );
  }

  async createIssue(body: CreateIssueDto) {
    try {
      await this.areasService.getArea(body.area);
    } catch (error) {
      throw new BadRequestException('Неверный id подразделения');
    }

    try {
      body.users.forEach(async (user) => {
        await this.usersService.findOneById(user);
      });
    } catch (error) {
      throw new BadRequestException('Неверный id пользователя');
    }

    try {
      body.base64Photos.forEach(async (photo) => {
        const match = photo.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
        if (!match || match.length !== 3) {
          throw new BadRequestException('Неверный формат изображения');
        }
      });
    } catch (error) {
      throw new BadRequestException('Неверный формат изображения');
    }

    const issue = await this.issueModel.create({
      area: body.area,
      coordinates: body.coordinates,
      category: body.category,
      risk: body.risk,
      fix: body.fix,
      status: body.status,
    });

    body.base64Photos.forEach(async (photo) => {
      const match = photo.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
      const imageBuffer = Buffer.from(match[2], 'base64');
      const imageName = `${Date.now()}.${match[1]}`;
      const filePath = join(
        __dirname,
        '..',
        '..',
        'public',
        'images',
        imageName,
      );
      await writeFile(filePath, imageBuffer);

      await this.photosModel.create({
        issue: issue.id,
        path: imageName,
      });
    });

    body.users.forEach(async (user) => {
      await this.responsibleModel.create({
        user_id: user,
        issue: issue.id,
      });
    });
  }

  async updateIssue(
    id: number,
    body: UpdateIssueDto,
    user: { sub: number; role: string },
  ) {
    if (user.role !== 'Администратор') {
      const responsible = await this.responsibleModel.findOne({
        where: { user_id: user.sub, issue: id },
      });
      if (!responsible) throw new ForbiddenException('Недостаточно прав');
    }
    await Promise.all(
      body.addedPhotos.map(async (photo) => {
        return this.addPhoto(id, photo);
      }),
    );
    await Promise.all(
      body.removedPhotos.map(async (photo) => {
        return this.removePhoto(id, photo);
      }),
    );
    await Promise.all(
      body.addedResponsibles.map(async (user) => {
        return this.addResponsible(user, id);
      }),
    );
    await Promise.all(
      body.removedResponsibles.map(async (user) => {
        return this.removeResponsible(user, id);
      }),
    );

    const issueData = {
      area: body.area,
      coordinates: body.coordinates,
      category: body.category,
      risk: body.risk,
      fix: body.fix,
      status: body.status,
      description: body.description,
    };
    try {
      this.areasService.getArea(body.area);
      return await this.issueModel.update(issueData, { where: { id } });
    } catch (error) {
      throw new BadRequestException('Неверный id подразделения');
    }
  }

  async deleteIssue(id: number, user: { role: string }) {
    if (user.role !== 'Администратор')
      throw new ForbiddenException(
        'Только администратор может удалить замечание',
      );
    try {
      this.issueModel.findOne({ where: { id }, rejectOnEmpty: true });
    } catch (error) {
      throw new BadRequestException('Неверный id замечания');
    }

    const photos = await this.photosModel.findAll({
      where: { issue: id },
    });
    photos.forEach((photo) => {
      unlink(join(__dirname, '..', '..', 'public', 'images', photo.path));
    });
    this.photosModel.destroy({ where: { issue: id } });
    this.responsibleModel.destroy({ where: { issue: id } });
    return await this.issueModel.destroy({ where: { id } });
  }

  async removeResponsible(user_id: number, issue_id: number) {
    try {
      this.usersService.findOneById(user_id);
    } catch (error) {
      throw new BadRequestException('Неверный id пользователя');
    }

    try {
      this.issueModel.findOne({ where: { id: issue_id }, rejectOnEmpty: true });
    } catch (error) {
      throw new BadRequestException('Неверный id замечания');
    }

    await this.responsibleModel.destroy({
      where: { user_id, issue: issue_id },
    });
  }

  async addResponsible(user_id: number, issue_id: number) {
    try {
      this.usersService.findOneById(user_id);
    } catch (error) {
      throw new BadRequestException('Неверный id пользователя');
    }

    try {
      this.issueModel.findOne({ where: { id: issue_id }, rejectOnEmpty: true });
    } catch (error) {
      throw new BadRequestException('Неверный id замечания');
    }

    await this.responsibleModel.create({
      user_id,
      issue: issue_id,
    });
  }

  async removePhoto(issue: number, name: string) {
    try {
      await this.photosModel.findOne({
        where: { path: name },
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new BadRequestException('Неверное название фото');
    }

    const photos = await this.photosModel.findAll({
      where: { issue },
    });
    if (photos.length === 1)
      throw new BadRequestException('Нельзя удалить последнее фото');
    await this.photosModel.destroy({ where: { path: name } });
    unlink(join(__dirname, '..', '..', 'public', 'images', name));
  }

  async addPhoto(id: number, image: string) {
    try {
      this.issueModel.findOne({ where: { id } });
    } catch (error) {
      throw new BadRequestException('Неверный id замечания');
    }

    const match = image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
    if (!match || match.length !== 3) {
      throw new BadRequestException('Неверный формат изображения');
    }
    const imageBuffer = Buffer.from(match[2], 'base64');
    const imageName = `${Date.now()}.${match[1]}`;
    const filePath = join(__dirname, '..', '..', 'public', 'images', imageName);
    await writeFile(filePath, imageBuffer);

    return await this.photosModel.create({
      issue: id,
      path: imageName,
    });
  }
}
