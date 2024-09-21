import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import Issues from './issues.model';
import Responsible from './responsible.model';
import Photos from './photos.model';
import { UsersModule } from 'src/users/users.module';
import { AreasService } from 'src/areas/areas.service';
import Areas from 'src/areas/areas.model';
import { AreasModule } from 'src/areas/areas.module';

@Module({
  controllers: [IssuesController],
  imports: [
    SequelizeModule.forFeature([Issues, Responsible, Photos, Areas]),
    AuthModule,
    UsersModule,
    AreasModule,
  ],
  providers: [IssuesService, AuthGuard, AreasService],
  exports: [IssuesService],
})
export class IssuesModule {}
