import nodemailer from 'nodemailer'
import { env } from './env'

let transporter: nodemailer.Transporter | null = null

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })
}

/**
 * Envía un correo electrónico. Si el SMTP no está configurado,
 * lo registra en la consola.
 */
export async function enviarCorreo(to: string, subject: string, html: string): Promise<void> {
  const from = env.SMTP_FROM || '"Clínica Dr. Lentes" <no-reply@drlentes.com>'

  if (!transporter) {
    console.log('\n--- ✉️ [MOCK EMAIL SENT] ---')
    console.log(`De:     ${from}`)
    console.log(`Para:   ${to}`)
    console.log(`Asunto: ${subject}`)
    console.log(`Cuerpo:`)
    console.log(html)
    console.log('-----------------------------\n')
    return
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })
  } catch (error: any) {
    console.error(`❌ Error al enviar correo a ${to}:`, error.message)
    if (env.NODE_ENV === 'production') {
      throw error
    }
  }
}
