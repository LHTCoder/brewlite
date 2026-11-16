import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Request } from 'express';
import { JwtPayload } from './auth.service';
import { UserRole } from '../common/enums';

export const ROLES_KEY = 'roles';
/** Giới hạn endpoint theo vai trò, ví dụ @Roles(UserRole.STAFF, UserRole.MANAGER) */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/** Lấy payload JWT đã xác thực trong controller: @CurrentUser() user: JwtPayload */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
  return req.user;
});

/**
 * NFR-02 Bảo mật: kiểm tra Bearer JWT, đọc lại tài khoản trong DB (bị khóa -> 401,
 * vai trò lấy theo DB để thay đổi có hiệu lực ngay), sau đó kiểm tra vai trò (nếu có @Roles).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu token xác thực');
    }
    try {
      req.user = this.jwt.verify<JwtPayload>(header.slice(7));
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
    const account = await this.users.findOne({
      where: { id: req.user.sub },
      select: { id: true, role: true, isActive: true },
    });
    if (!account) throw new UnauthorizedException('Tài khoản không tồn tại');
    if (!account.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa');
    req.user = { ...req.user, role: account.role };

    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles && roles.length > 0 && !roles.includes(req.user.role)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
}
