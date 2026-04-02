import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserEntity } from '../users/entities/user.entity';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { UserStatusEnum } from '../../shared/enums/user-status.enum';
import { RoleEnum } from '../../shared/enums/role.enum';

@Injectable()
export class AuthService {
  private readonly COOKIE_OPTIONS_BASE = {
    httpOnly: true as const,
    sameSite: 'strict' as const,
    path: '/',
  };

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, res: Response): Promise<UserEntity> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      displayName: dto.displayName,
      bio: dto.bio ?? null,
      profilePicture: dto.profilePicture ?? null,
      role: RoleEnum.user,
      status: UserStatusEnum.active,
    });
    const saved = await this.userRepository.save(user);
    await this.issueTokens(saved, res);
    return saved;
  }

  async login(dto: LoginDto, res: Response): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password!');
    }
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password!');
    }
    if (user.status === UserStatusEnum.suspended) {
      throw new UnauthorizedException('Your account has been suspended!');
    }
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
    await this.issueTokens(user, res);
    return user;
  }

  async refresh(refreshToken: string, res: Response): Promise<void> {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      }) as { sub: string };
    } catch {
      throw new UnauthorizedException('Invalid refresh token!');
    }

    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token!');
    }

    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid refresh token!');
    }

    if (user.status === UserStatusEnum.suspended) {
      throw new UnauthorizedException('Your account has been suspended!');
    }

    await this.issueTokens(user, res);
  }

  async logout(userId: string, res: Response): Promise<void> {
    await this.userRepository.update(userId, { refreshTokenHash: null });
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    res.clearCookie('accessToken', { ...this.COOKIE_OPTIONS_BASE, secure: isProduction });
    res.clearCookie('refreshToken', { ...this.COOKIE_OPTIONS_BASE, secure: isProduction });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return;
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepository.update(user.id, {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: expires,
    });

    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token=${resetToken}`;
    console.log(`[BondHub] Password reset URL for ${email}: ${resetUrl}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: tokenHash },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Password reset token is invalid or has expired!');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshTokenHash: null,
    });
  }

  async issueTokens(user: UserEntity, res: Response): Promise<void> {
    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtRefreshSecret,
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, { refreshTokenHash });

    const cookieBase = {
      ...this.COOKIE_OPTIONS_BASE,
      secure: isProduction,
    };

    res.cookie('accessToken', accessToken, {
      ...cookieBase,
      maxAge: 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieBase,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  async validateUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
