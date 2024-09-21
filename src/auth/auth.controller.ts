import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { AuthGuard } from './jwt-auth.guard';
import SignInDto from './dto/sign-in.dto';
import SignUpDto from './dto/sign-up.dto';
import UpdatePasswordDto from './dto/update-password.dto';
import { UsersService } from 'src/users/users.service';
import UpdateDataDto from './dto/update-data.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  async signIn(
    @Body(new ValidationPipe()) signInDto: SignInDto,
    @Res() res: Response,
  ) {
    res.json(
      await this.authService.signIn(
        signInDto.username,
        signInDto.password,
        res,
      ),
    );
  }

  @UseGuards(AuthGuard)
  @Post('register')
  signUp(@Body(new ValidationPipe()) signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('password')
  updatePassword(
    @Req() req: any,
    @Body(new ValidationPipe()) body: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(req.user, body);
  }

  @UseGuards(AuthGuard)
  @Put('user')
  async updateUser(@Req() req: any, @Body() body: UpdateDataDto) {
    this.authService.updateUserData(req.user, body);
  }

  @Get('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    res.json(await this.authService.refreshToken(req, res));
  }
}
