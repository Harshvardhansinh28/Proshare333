import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min, MinLength } from 'class-validator'

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
  @IsUrl()
  repoUrl?: string

  @IsOptional()
  @IsUrl()
  demoUrl?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}

