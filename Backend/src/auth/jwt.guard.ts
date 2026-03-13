import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException('No token provided')
    }

    const [, token] = authHeader.split(' ')

    if (!token) {
      throw new UnauthorizedException('Malformed authorization header')
    }

    try {
      const decoded = this.jwtService.verify(token)
      request.user = decoded
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}