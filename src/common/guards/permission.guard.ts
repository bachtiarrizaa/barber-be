import { EntityManager } from '@mikro-orm/postgresql';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { Role } from '../../modules/roles/entities/role.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const forkedEm = this.em.fork();

    const role = await forkedEm.findOne(
      Role,
      { name: user.role },
      { populate: ['permissions'] },
    );

    if (!role) throw new ForbiddenException('Role not found or access denied');

    const userActionCode = role.permissions
      .getItems()
      .map((p) => p.actionCode)
      .filter(Boolean);

    const hasPermission = requiredPermissions.every((required) =>
      userActionCode.includes(required),
    );

    if (!hasPermission) {
      throw new ForbiddenException(`Don't have permission to this action`);
    }

    return true;
  }
}
