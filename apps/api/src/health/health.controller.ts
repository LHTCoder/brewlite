import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

/**
 * NFR-05 Khả năng triển khai: endpoint health cho Docker healthcheck,
 * nền tảng deploy (Render/Railway) và smoke test sau triển khai.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Health check: trạng thái API + kết nối database' })
  async check() {
    let database = 'up';
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = 'down';
    }
    const body = {
      status: database === 'up' ? 'ok' : 'degraded',
      version: process.env.APP_VERSION ?? process.env.npm_package_version ?? 'dev',
      uptimeSeconds: Math.round((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      checks: { database },
    };
    if (database !== 'up') throw new ServiceUnavailableException(body);
    return body;
  }
}
