import { Module } from '@nestjs/common';
import { GeospatialProvider } from './geospatial/geospatial.provider';
import { NewsProvider } from './news/news.provider';
import { WeatherProvider } from './weather/weather.provider';
import { WhatsappController } from './whatsapp/whatsapp.controller';
import { WhatsappProvider } from './whatsapp/whatsapp.provider';
import { IntegrationsController } from './integrations.controller';

@Module({
  controllers: [WhatsappController, IntegrationsController],
  providers: [GeospatialProvider, NewsProvider, WeatherProvider, WhatsappProvider],
  exports: [GeospatialProvider, NewsProvider, WeatherProvider, WhatsappProvider],
})
export class IntegrationsModule {}
