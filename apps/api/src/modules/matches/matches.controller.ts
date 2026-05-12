import { Body, Controller, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('rank')
  rankMatches(@Body() payload: Record<string, unknown>) {
    return this.matchesService.rankMatches(payload);
  }
}

