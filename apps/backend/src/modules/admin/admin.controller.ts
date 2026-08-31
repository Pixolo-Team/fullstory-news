// TYPES //
import type { AdminStatsData } from '@/modules/admin/admin.types.js';

// SERVICES //
import { AdminService } from '@/modules/admin/admin.service.js';

// LIBRARIES //
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Dashboard endpoints.
 *
 * Unauthenticated: access to the admin is gated by the admin app, which
 * validates the session before rendering any dashboard route.
 */
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Returns dashboard summary counts.
   * @returns Dashboard summary payload
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getStats(): Promise<AdminStatsData> {
    return this.adminService.getStatsService();
  }
}
