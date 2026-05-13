import { Controller, Get } from '@nestjs/common';
import { WeatherProvider } from './weather/weather.provider';
import { NewsProvider } from './news/news.provider';
import { GeospatialProvider } from './geospatial/geospatial.provider';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly weather: WeatherProvider,
    private readonly news: NewsProvider,
    private readonly geospatial: GeospatialProvider,
  ) {}

  @Get('health')
  async health() {
    const [weatherStatus, newsStatus, geospatialStatus] = await Promise.all([
      this.weather.health(),
      this.news.health(),
      this.geospatial.health(),
    ]);

    const checks = [weatherStatus, newsStatus, geospatialStatus];
    const allOk = checks.every((c) => c.status === 'ok');

    return {
      status: allOk ? 'ok' : 'degraded',
      checkedAt: new Date().toISOString(),
      providers: checks,
    };
  }
}
