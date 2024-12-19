import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AdminsService } from 'src/admins/admins.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AdminRefreshTokensService } from 'src/refresh-tokens/services/admin.refresh-tokens.service';
import { UAPayload } from 'src/refresh-tokens/types/refresh-token-payload.type';
import { AbstractAuthService } from './abstract.auth.service';
import { LoginDto } from './dtos/login.dto';
import { AdminProfileSerializer } from './serializers/admin-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from './types/login.response.type';

@Injectable()
export class AdminAuthService extends AbstractAuthService {
  constructor(
    private readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    private readonly adminService: AdminsService,
    private readonly adminRefreshTokenService: AdminRefreshTokensService,
  ) {
    super(configService);
  }

  async webLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
    response: Response,
  ): Promise<WebLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const admin = await this.adminService.validateLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = admin;
    const jwtPayload = { username, sub: _id, role: UserRole.ADMIN };
    const accessToken = this.jwtService.sign(jwtPayload);
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.adminRefreshTokenService.generateRefreshToken({
        ...uaPayload,
        admin: _id.toHexString(),
        expiresAt: refreshCookieExpiryDateTime,
      });
    this.setAuthCookies({ accessToken, refreshToken }, response);
    const adminData = {
      username,
      email,
      gender,
      profilePic,
      status,
    };
    return {
      data: adminData,
    };
  }

  async mobileLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
  ): Promise<MobileLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const admin = await this.adminService.validateLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = admin;
    const jwtPayload = { username, sub: _id, role: UserRole.ADMIN };
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.adminRefreshTokenService.generateRefreshToken({
        ...uaPayload,
        admin: _id.toHexString(),
        expiresAt: refreshCookieExpiryDateTime,
      });
    const adminData = {
      username,
      email,
      gender,
      profilePic,
      status,
    };
    return {
      refreshToken,
      accessToken: this.jwtService.sign(jwtPayload),
      data: adminData,
    };
  }

  async getProfile(id: string): Promise<AdminProfileSerializer> {
    return this.adminService.getProfile(id);
  }
}
