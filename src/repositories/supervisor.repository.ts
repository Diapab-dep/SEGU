import { prisma } from '../lib/prisma';

export interface AdmissionFilters {
  posId?: string;
  merchandiseTypeId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export const supervisorRepository = {
  async listAdmissions(filters: AdmissionFilters, page: number, limit: number) {
    const where = buildWhere(filters);
    const [data, total] = await Promise.all([
      prisma.merchandise.findMany({
        where,
        include: {
          Client: true,
          MerchandiseTypeCatalog: true,
          PointOfSale: true,
          MerchandiseChecklist: {
            include: { ChecklistTemplate: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.merchandise.count({ where }),
    ]);
    return { data, total, page, limit };
  },

  async getMetrics(filters: AdmissionFilters) {
    const where = buildWhere(filters);
    const [total, pending, requiresDeprisacheck, accepted, rejected] = await Promise.all([
      prisma.merchandise.count({ where }),
      prisma.merchandise.count({ where: { ...where, status: 'pending' } }),
      prisma.merchandise.count({ where: { ...where, status: 'requires_deprisacheck' } }),
      prisma.merchandise.count({ where: { ...where, status: 'accepted' } }),
      prisma.merchandise.count({ where: { ...where, status: 'rejected' } }),
    ]);
    return { total, pending, requiresDeprisacheck, accepted, rejected };
  },

  async findByIdWithDetails(id: string) {
    return prisma.merchandise.findUnique({
      where: { id },
      include: {
        Client: true,
        MerchandiseTypeCatalog: true,
        PointOfSale: true,
        MerchandiseChecklist: {
          include: {
            ChecklistTemplate: {
              include: { ChecklistTemplateItem: { orderBy: { order: 'asc' } } },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  },
};

function buildWhere(filters: AdmissionFilters) {
  const where: Record<string, unknown> = {};
  if (filters.posId) where.pointOfSaleId = filters.posId;
  if (filters.merchandiseTypeId) where.merchandiseTypeId = filters.merchandiseTypeId;
  if (filters.status) where.status = filters.status;
  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to + 'T23:59:59.999Z') } : {}),
    };
  }
  return where;
}
