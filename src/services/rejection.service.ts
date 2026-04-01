/**
 * Servicio de rechazo de admisión
 * Tareas 3.3.1, 3.3.2, 3.3.3
 * Ajustado según flujo PDF: plantilla de correo oficial Deprisa, numerales causales de rechazo
 */
import nodemailer from 'nodemailer';
import { merchandiseRepository } from '../repositories/merchandise.repository';
import { clientRepository } from '../repositories/client.repository';

const emailCfg = {
  host: process.env.SMTP_HOST ?? '',
  port: parseInt(process.env.SMTP_PORT ?? '587', 10),
  user: process.env.SMTP_USER ?? '',
  pass: process.env.SMTP_PASS ?? '',
};

function getTransporter() {
  return nodemailer.createTransport({
    host: emailCfg.host,
    port: emailCfg.port,
    secure: emailCfg.port === 465,
    auth: { user: emailCfg.user, pass: emailCfg.pass },
  });
}

export const rejectionService = {
  async rejectAdmission(
    merchandiseId: string,
    reason: string,
    _options?: { checklistId?: string; clientEmail?: string }
  ) {
    await merchandiseRepository.updateStatus(merchandiseId, 'rejected', reason);
    return { merchandiseId, status: 'rejected' as const };
  },

  async registerClientEmail(clientId: string, email: string) {
    await clientRepository.findById(clientId);
    return { clientId, email };
  },

  /**
   * Envía correo de rechazo al cliente con la lista de comprobación adjunta en PDF.
   * Plantilla oficial validada con el área de experiencia al cliente (ver flujo PDF pág. 7).
   */
  async sendRejectionEmail(params: {
    clientEmail: string;
    checklistId: string;
    rejectedItemNumbers: string[];
    observations?: string;
    pdfBuffer?: Buffer;
  }) {
    const { clientEmail, rejectedItemNumbers, observations, pdfBuffer } = params;

    const itemsList = rejectedItemNumbers.length > 0
      ? `Se rechaza por los numerales: ${rejectedItemNumbers.join(', ')}.`
      : '';

    const lines = [
      'Estimado/a Cliente,',
      '',
      'De acuerdo con lo expuesto por nuestro asesor comercial en el punto de venta, la mercancía presentada ha sido rechazada y no podemos aceptarla para su transporte debido a que no cumple con los requisitos establecidos. Lo anterior luego de llevar a cabo una revisión exhaustiva de su envío de acuerdo con los estándares definidos por la International Air Transport Association (IATA) y los procedimientos establecidos por Deprisa.',
      '',
      'Los puntos específicos que llevaron al rechazo de su mercancía se encuentran en el documento adjunto, el cual es una copia de la lista de comprobación que se utilizó en la evaluación de su mercancía. Esta puede ayudarle a comprender mejor los criterios que se aplicaron en nuestra revisión.',
      '',
      itemsList,
      observations ? `Observaciones: ${observations}` : '',
      '',
      'Agradecemos por su confianza en Deprisa y esperamos poder servirle en el futuro. Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con nuestro equipo de servicio al cliente al número de teléfono 601 3073938 en Bogotá o desde el resto del país a la línea gratuita 01 8000 189840, de lunes a viernes de 7 am a 7 pm y sábados de 8 am a 4 pm. También puedes contactarnos por correo electrónico a servicioalcliente@deprisa.com',
      '',
      'Gracias por su atención.',
      'Equipo Deprisa',
    ];

    const bodyText = lines.filter((l) => l !== undefined).join('\n');

    const mailOptions: nodemailer.SendMailOptions = {
      from: emailCfg.user,
      to: clientEmail,
      subject: 'Rechazo de mercancía',
      text: bodyText,
    };

    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: 'Copia de lista de comprobación.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ];
    }

    try {
      const transporter = getTransporter();
      await transporter.sendMail(mailOptions);
      return { sent: true };
    } catch {
      return { sent: false };
    }
  },

  async sendRejectionChecklist(clientId: string, checklistData: Record<string, unknown>) {
    const client = await clientRepository.findById(clientId);
    if (!client?.email) return { sent: false };

    const rejectedItems = Array.isArray(checklistData.rejectedItemNumbers)
      ? (checklistData.rejectedItemNumbers as string[])
      : [];

    return this.sendRejectionEmail({
      clientEmail: client.email,
      checklistId: String(checklistData.checklistId ?? ''),
      rejectedItemNumbers: rejectedItems,
      observations: checklistData.observations as string | undefined,
    });
  },
};
