import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatGateway } from './chat/chat.gateway';
import { AuthService } from './auth/auth.service';
import prisma from '../prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req): Promise<{ access_token: string }> {
    const userId = await this.authService.getUserId(req.user.username);

    if (userId !== null) {
      const payload = { username: req.user.username, sub: userId };
      return {
        access_token: this.authService.createToken(payload),
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  @Post('chat/send-message')
  async sendMessage(
    @Body() body: { userId: number; text: string },
  ): Promise<void> {
    const userId = body.userId;
    const text = body.text;

    const message = await prisma.message.create({
      data: {
        text: text,
        user: { connect: { id: userId } },
      },
      include: { user: true },
    });

    this.chatGateway.handleMessage({
      text: message.text,
      userId: message.user.id,
    });
  }

  @Get('chat/messages')
  async getMessages(): Promise<any> {
    const messages = await prisma.message.findMany({
      include: { user: true },
    });

    return messages;
  }
}
