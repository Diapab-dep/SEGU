import { userRepository } from '../repositories/user.repository';

/**
 * Verifica si hay usuarios habilitados para DeprisaCheck en el punto de venta.
 * Tareas 2.4.1, 2.4.2
 */
export async function hasDeprisaCheckEnabledUsers(pointOfSaleId: string): Promise<boolean> {
  const count = await userRepository.countDeprisaCheckEnabledByPointOfSale(pointOfSaleId);
  return count > 0;
}

/**
 * Verifica si un usuario específico está habilitado para DeprisaCheck.
 * Tarea 2.4.3
 */
export async function isUserDeprisaCheckEnabled(userId: string): Promise<boolean> {
  const user = await userRepository.findById(userId);
  return user?.isDeprisacheckEnabled ?? false;
}
