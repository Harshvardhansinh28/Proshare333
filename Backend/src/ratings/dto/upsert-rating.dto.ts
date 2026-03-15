import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class UpsertRatingDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  aiScore?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  backendScore?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  frontendScore?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  systemDesignScore?: number

  @IsOptional()
  @IsString()
  complexityNote?: string

  @IsOptional()
  @IsString()
  scalabilityNote?: string
}
