import { Body, Controller, Post } from '@nestjs/common';
import { BondsService } from './bonds.service';
import { CalculateBondRequestDto } from './dto/calculate-bond-request.dto';
import { BondCalculationResultDto } from './dto/bond-calculation-result.dto';

@Controller('bonds')
export class BondsController {
  constructor(private readonly bondsService: BondsService) {}

  @Post('calculate')
  calculate(@Body() dto: CalculateBondRequestDto): BondCalculationResultDto {
    return this.bondsService.calculate(dto);
  }
}
