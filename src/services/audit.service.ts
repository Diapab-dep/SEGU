import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'ADMISSION_CREATE'
  | 'ADMISSION_ACCEPT'
  | 'ADMISSION_REJECT'
  | 'CHECKLIST_CREATE'
  | 'CHECKLIST_SUBMIT'
  | 'CHECKLIST_APPROVE'
  | 'CHECKLIST_REJECT'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE';

export const auditService = {
  async log(params: {
    userId?: string;
    username?: string;
    action: AuditAction;
    entityType?: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          id: uuidv4(),
          userId: params.userId,
          username: params.username,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          details: params.details ? JSON.stringify(params.details) : undefined,
          ipAddress: params.ipAddress,
        },
      });
    } catch {
      // Auditoría no debe bloquear la operación principal
    }
  },

  async query(filters: {
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    from?: Date;
    to?: Date;
    limit?: number;
  }) {
    return prisma.auditLog.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.entityId && { entityId: filters.entityId }),
        ...(filters.from || filters.to
          ? { createdAt: { ...(filters.from && { gte: filters.from }), ...(filters.to && { lte: filters.to }) } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 100,
    });
  },
};
