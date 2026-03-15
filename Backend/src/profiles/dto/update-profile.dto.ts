import { IsArray, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string

  @IsOptional()
  @IsUrl()
  resumeUrl?: string

  @IsOptional()
  @IsUrl()
  githubUrl?: string

  @IsOptional()
  @IsUrl()
  portfolioUrl?: string

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string

  @IsOptional()
  @IsUrl()
  avatarUrl?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[]
}
