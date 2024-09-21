import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(AuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('loginTaken')
  async checkLoginTaken(@Query('login') login: string) {
    return await this.usersService.checkLoginTaken(login);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Req() req: any) {
    return this.usersService.delete(id, req.user);
  }
}
