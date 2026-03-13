import { IsString } from 'class-validator'

export class UploadAssetDto {
  @IsString()
  fileName: string

  @IsString()
  contentType: string
}

