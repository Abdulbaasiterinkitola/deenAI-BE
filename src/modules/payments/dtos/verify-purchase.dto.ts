import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class VerifyGooglePurchaseDto {
  @ApiProperty({
    description: 'The product ID purchased (e.g., premium_monthly)',
    example: 'premium_monthly',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'The purchase token returned by Google Play',
    example: 'fji39f3...',
  })
  @IsString()
  @IsNotEmpty()
  purchaseToken: string;
}

export class VerifyApplePurchaseDto {
  @ApiProperty({
    description: 'The product ID purchased',
    example: 'com.deenai.premium.monthly',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'The base64 encoded receipt data from the App Store',
    example: 'MIIT8...',
  })
  @IsString()
  @IsNotEmpty()
  receiptData: string;

  @ApiProperty({
    description: 'The transaction identifier',
    example: '1000000847...',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}