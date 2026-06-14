"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarCorreo = enviarCorreo;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
let transporter = null;
if (env_1.env.SMTP_HOST && env_1.env.SMTP_USER && env_1.env.SMTP_PASS) {
    transporter = nodemailer_1.default.createTransport({
        host: env_1.env.SMTP_HOST,
        port: env_1.env.SMTP_PORT || 587,
        secure: env_1.env.SMTP_PORT === 465,
        auth: {
            user: env_1.env.SMTP_USER,
            pass: env_1.env.SMTP_PASS,
        },
    });
}
/**
 * Envía un correo electrónico. Si el SMTP no está configurado,
 * lo registra en la consola.
 */
async function enviarCorreo(to, subject, html) {
    const from = env_1.env.SMTP_FROM || '"Clínica Dr. Lentes" <no-reply@drlentes.com>';
    if (!transporter) {
        console.log('\n--- ✉️ [MOCK EMAIL SENT] ---');
        console.log(`De:     ${from}`);
        console.log(`Para:   ${to}`);
        console.log(`Asunto: ${subject}`);
        console.log(`Cuerpo:`);
        console.log(html);
        console.log('-----------------------------\n');
        return;
    }
    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error(`❌ Error al enviar correo a ${to}:`, error.message);
        if (env_1.env.NODE_ENV === 'production') {
            throw error;
        }
    }
}
//# sourceMappingURL=email.js.map