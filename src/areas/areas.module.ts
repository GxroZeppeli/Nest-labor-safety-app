import { Module } from '@nestjs/common';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import Areas from './areas.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from 'src/users/users.module';
import { IssuesService } from 'src/issues/issues.service';
import Issues from 'src/issues/issues.model';
import Responsible from 'src/issues/responsible.model';
import Photos from 'src/issues/photos.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Areas, Issues, Responsible, Photos]),
    UsersModule,
    AuthModule,
  ],
  providers: [AreasService, AuthGuard, IssuesService],
  controllers: [AreasController],
  exports: [AreasService],
})
export class AreasModule {}
