import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min, MinLength } from 'class-validator'
import { MonetizationType } from '@prisma/client'

export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string

  @IsOptional()
  @IsInt()
  @Min(0)
  priceInCents?: number

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsEnum(MonetizationType)
  monetizationType?: MonetizationType

  @IsOptional()
  @IsUrl()
  repoUrl?: string

  @IsOptional()
  @IsUrl()
  demoUrl?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean

  @IsOptional()
  @IsBoolean()
  isProduct?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  opportunities?: string[]
}

