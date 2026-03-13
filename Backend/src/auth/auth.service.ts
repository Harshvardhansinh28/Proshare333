import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {

  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(data: RegisterDto) {

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    })

    if (existing) {
      throw new ConflictException('User with given email or username exists')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        createdAt: true,
      },
    })

    return {
      message: 'User registered',
      user,
    }
  }

  async login(data: LoginDto) {

    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new BadRequestException('Invalid credentials')
    }

    const valid = await bcrypt.compare(data.password, user.password)

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const token = this.jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
    )

    return {
      message: 'Login successful',
      token,
    }

  }

}