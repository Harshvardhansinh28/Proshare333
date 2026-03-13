import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import AWS from 'aws-sdk'

@Injectable()
export class StorageService {
  private readonly s3: AWS.S3
  private readonly bucket: string
  private readonly region: string

  constructor(private readonly config: ConfigService) {
    this.region = this.config.get<string>('AWS_REGION') || 'us-east-1'
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') || ''

    AWS.config.update({
      region: this.region,
      accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
    })

    this.s3 = new AWS.S3()
  }

  async uploadObject(params: {
    key: string
    body: Buffer
    contentType: string
  }): Promise<string> {
    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET is not configured')
    }

    await this.s3
      .putObject({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        ACL: 'public-read',
      })
      .promise()

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${params.key}`
  }
}

