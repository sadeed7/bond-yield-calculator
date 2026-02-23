import { Module } from '@nestjs/common';
import { BondsModule } from './bonds/bonds.module';

@Module({
  imports: [BondsModule],
})
export class AppModule {}
