import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './jwt-auth.guard';

@Module({
  imports: [UsersModule],
  providers: [AuthService, AuthGuard, JwtService],
  exports: [AuthGuard, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
