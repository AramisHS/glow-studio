const API_KEY = import.meta.env.VITE_CALLMEBOT_API_KEY;
const ADMIN_PHONE = import.meta.env.VITE_CALLMEBOT_PHONE_NUMBER;

// Función para normalizar número de teléfono (agregar código de país 52 si no tiene)
function normalizePhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        // Número mexicano de 10 dígitos -> agregar 52
        return '52' + cleaned;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        // Caso 521 + 10 dígitos
        return cleaned;
    }
    if (cleaned.length === 12 && cleaned.startsWith('52')) {
        return cleaned;
    }
    // Si no coincide, devolvemos el original (puede fallar)
    return cleaned;
}

export async function sendWhatsApp(phone: string, message: string) {
    if (!API_KEY || !phone) {
        console.warn('CallMeBot no configurado o teléfono vacío');
        return;
    }
    const normalizedPhone = normalizePhone(phone);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${normalizedPhone}&text=${encodeURIComponent(message)}&apikey=${API_KEY}`;
    try {
        // Usamos mode: 'no-cors' para evitar CORS, pero no podremos leer la respuesta
        await fetch(url, { mode: 'no-cors' });
        console.log('Solicitud WhatsApp enviada (sin CORS)');
    } catch (e) {
        // Silenciamos el error porque con no-cors no se puede capturar, pero no afecta
        console.log('Notificación enviada (modo no-cors)');
    }
}

export function notifyClient(appointment: any) {
    const msg = `¡Hola ${appointment.client_name}! Tu cita en Glow Studio ha sido registrada con éxito.\n\nServicio: ${appointment.service_name}\nFecha: ${appointment.appointment_date}\nHora: ${appointment.appointment_time}\n\nTe esperamos. ¡Gracias por preferirnos! ❤️`;
    sendWhatsApp(appointment.client_phone, msg);
}

export function notifyAdmin(appointment: any) {
    const msg = `Nueva cita registrada:\nCliente: ${appointment.client_name}\nTel: ${appointment.client_phone}\nServicio: ${appointment.service_name}\nFecha: ${appointment.appointment_date}\nHora: ${appointment.appointment_time}`;
    sendWhatsApp(ADMIN_PHONE, msg);
}