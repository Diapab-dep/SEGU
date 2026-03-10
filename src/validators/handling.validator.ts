import { prisma } from '../lib/prisma';

/**
 * Verifica si el punto de venta tiene permitido el manejo del tipo de mercancía.
 * Tareas 2.3.1, 2.3.2 - Ciudad
 */
export async function isHandlingPermitted(
  pointOfSaleId: string,
  merchandiseTypeId: string
): Promise<boolean> {
  const perm = await prisma.handlingPermission.findFirst({
    where: {
      pointOfSaleId,
      merchandiseTypeId,
    },
  });
  if (perm) return perm.isPermitted;
  return true;
}
