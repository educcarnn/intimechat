import { Injectable, UnauthorizedException } from '@nestjs/common';
import prisma from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async getUserId(username: string): Promise<number | null> {
    const user = await prisma.user.findUnique({ where: { username } });
    return user ? user.id : null;
  }

  createToken(payload: { username: string; sub: number }): string {
    return this.jwtService.sign(payload);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await prisma.user.findUnique({ where: { username } });

    if (user && bcrypt.compareSync(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
