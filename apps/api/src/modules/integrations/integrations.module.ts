import { Module } from '@nestjs/common';
import { GeospatialProvider } from './geospatial/geospatial.provider';
import { NewsProvider } from './news/news.provider';
import { WeatherProvider } from './weather/weather.provider';
import { WhatsappProvider } from './whatsapp/whatsapp.provider';

@Module({
  providers: [GeospatialProvider, NewsProvider, WeatherProvider, WhatsappProvider],
  exports: [GeospatialProvider, NewsProvider, WeatherProvider, WhatsappProvider],
})
export class IntegrationsModule {}
