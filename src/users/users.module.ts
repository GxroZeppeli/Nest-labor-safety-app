import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import 'dotenv/config';
import User from './users.model';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from './users.controller';
import { IssuesService } from 'src/issues/issues.service';
import Issues from 'src/issues/issues.model';
import Photos from 'src/issues/photos.model';
import Responsible from 'src/issues/responsible.model';
import Areas from 'src/areas/areas.model';
import { AreasService } from 'src/areas/areas.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Issues, Responsible, Photos, Areas]),
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService, IssuesService, AreasService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
