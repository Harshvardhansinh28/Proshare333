import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator'
import { UserCategory } from '@prisma/client'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(1)
  username: string

  @IsString()
  @MinLength(3)
  password: string

  @IsEnum(UserCategory)
  category: UserCategory
}

