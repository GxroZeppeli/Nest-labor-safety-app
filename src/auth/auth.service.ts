import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import SignUpDto from './dto/sign-up.dto';
import UpdatePasswordDto from './dto/update-password.dto';
import UpdateDataDto from './dto/update-data.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signIn(
    username: string,
    pass: string,
    res: Response,
  ): Promise<{ access_token: string }> {
    const user = (await this.usersService.findOneByLogin(username))?.dataValues;

    if (!user) {
      throw new NotFoundException({
        message: 'Неверный логин',
        statusCode: 404,
      });
    }

    if ((await bcrypt.hash(pass, user.salt)) !== user.hash) {
      throw new UnauthorizedException({
        message: 'Неверный пароль',
        statusCode: 401,
      });
    }

    const payload = { sub: user.id, username: user.login, role: user.role };

    res.cookie(
      'refresh_token',
      await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.SECRET_KEY,
      }),
      {
        httpOnly: true,
        sameSite: 'strict',
      },
    );

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY,
      }),
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<any> {
    if (await this.usersService.checkLoginTaken(signUpDto.login))
      throw new BadRequestException({
        message: 'Логин уже занят',
      });

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const { password, ...user }: any = signUpDto;
    user.salt = salt;
    user.hash = await bcrypt.hash(password, salt);

    return this.usersService.create(user);
  }

  async updatePassword(
    userToken: { sub: number; role: string },
    body: UpdatePasswordDto,
  ) {
    if (userToken.role === 'Администратор') {
      if (!body.user)
        throw new BadRequestException({ message: 'Необходим id пользователя' });
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(body.new_password, salt);
      this.usersService.updatePassword(body.user, salt, hash);
      return { message: 'Пароль успешно изменен', statusCode: 200 };
    }

    if (!body.new_password || !body.old_password)
      throw new BadRequestException({
        message: 'Пароль не может быть пустым',
        statusCode: 400,
      });

    if (body.new_password === body.old_password)
      throw new BadRequestException({
        message: 'Новый пароль не может быть такой же как старый',
        statusCode: 400,
      });

    const user = await this.usersService.findOneById(userToken.sub);

    if ((await bcrypt.hash(body.old_password, user.salt)) === user.hash) {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(body.new_password, salt);
      this.usersService.updatePassword(userToken.sub, salt, hash);
      return { message: 'Пароль успешно изменен', statusCode: 200 };
    } else {
      throw new UnauthorizedException({
        message: 'Неверный пароль',
        statusCode: 401,
      });
    }
  }

  async updateUserData(user: { role: string }, updateDto: UpdateDataDto) {
    if (user.role !== 'Администратор')
      throw new ForbiddenException({
        message: 'Только администратор может редактировать пользователя',
      });

    if (await this.usersService.checkLoginTaken(updateDto.login)) {
      const user = await this.usersService.findOneByLogin(updateDto.login);
      if (user.id !== updateDto.id)
        throw new BadRequestException({
          message: 'Логин уже занят',
        });
    }

    return await this.usersService.update(updateDto.id, updateDto);
  }

  async getProfile(user: { sub: number }) {
    return await this.usersService.getProfile(user.sub);
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'Токен обновления не найден',
        statusCode: 401,
      });
    }

    let payload: { exp: number };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.SECRET_KEY,
      });
    } catch {
      throw new UnauthorizedException();
    }

    res.cookie(
      'refresh_token',
      await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.SECRET_KEY,
      }),
      {
        httpOnly: true,
        sameSite: 'strict',
      },
    );

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.SECRET_KEY,
      }),
    };
  }
}
