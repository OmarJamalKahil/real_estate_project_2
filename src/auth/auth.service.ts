import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService
  ) {} 

  generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_SECRET_KEY'),
      expiresIn: parseInt(this.configService.get<string>('ACCESS_EXPIRE_IN')!),
    });

    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_SECRET_KEY'),
      expiresIn: parseInt(this.configService.get<string>('REFRESH_EXPIRE_IN')!)
    });

    return { accessToken, refreshToken };
  }
}
