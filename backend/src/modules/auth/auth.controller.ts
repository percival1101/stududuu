import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Request() req: any) {
    // req.user được gán bởi LocalStrategy
    return this.authService.login(req.user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('send-verification-otp')
  @HttpCode(HttpStatus.OK)
  sendVerificationOtp(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email không được để trống.');
    return this.authService.sendVerificationOtp(email);
  }

  @Post('verify-email-otp')
  @HttpCode(HttpStatus.OK)
  verifyEmailOtp(@Body('email') email: string, @Body('otp') otp: string) {
    if (!email || !otp) throw new BadRequestException('Email và mã OTP không được để trống.');
    return this.authService.verifyEmailOtp(email, otp);
  }

  @Post('send-welcome-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  sendWelcomeEmail(@Request() req: any) {
    const userId = Number(req.user?.sub ?? req.user?.id ?? req.user?.userId);
    return this.authService.sendWelcomeEmailForUser(userId);
  }

  @Post('forgot-password-otp')
  @HttpCode(HttpStatus.OK)
  sendResetPasswordOtp(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email không được để trống.');
    return this.authService.sendResetPasswordOtp(email);
  }

  @Post('reset-password-otp')
  @HttpCode(HttpStatus.OK)
  resetPasswordOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!email || !otp || !newPassword) {
      throw new BadRequestException('Vui lòng điền đầy đủ email, mã OTP và mật khẩu mới.');
    }
    return this.authService.resetPasswordWithOtp(email, otp, newPassword);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googlePostLogin(@Body('idToken') idToken?: string) {
    if (!idToken) {
      throw new BadRequestException('Trường idToken không được để trống.');
    }
    return this.authService.googleLoginToken(idToken);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Kích hoạt redirect của passport-google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Request() req: any, @Res() res: any) {
    const frontendUrl =
      this.config.get<string>('CORS_ORIGIN')?.split(',')[0] ?? 'http://localhost:3000';
    if (!req.user) {
      return res.redirect(`${frontendUrl}/login?error=google_failed`);
    }
    try {
      const loginResult = await this.authService.googleLogin(req.user);
      const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${loginResult.tokens.accessToken}&refreshToken=${loginResult.tokens.refreshToken}`;
      return res.redirect(redirectUrl);
    } catch (err: any) {
      return res.redirect(`${frontendUrl}/login?error=google_failed`);
    }
  }
}
