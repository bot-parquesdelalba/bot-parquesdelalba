require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MessagingResponse } = require('twilio').twiml;
const twilio = require('twilio');
const fs = require('fs'); // <--- NUEVO: Para guardar archivos de texto

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// --- CONFIGURACIÓN ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// --- NÚMEROS ---
const BOT_NUMBER = 'whatsapp:+51XXXXXXXXX'; // Tu número
const ASESOR_NUMBER = 'whatsapp:+51999999999'; // Gerente Comercial

// --- FUNCIÓN PARA GUARDAR HISTORIAL (LA "CAJA NEGRA") ---
function registrarConversacion(rol, mensaje, telefono) {
    const fecha = new Date().toLocaleString("es-PE", { timeZone: "America/Lima" });
    const lineaLog = `[${fecha}] ${telefono} - ${rol}: ${mensaje}\n`;
    
    // 1. Mostrar en pantalla negra (Terminal)
    console.log(lineaLog.trim()); 
    
    // 2. Guardar en archivo de texto
    try {
        fs.appendFileSync('historial_chat.txt', lineaLog);
    } catch (err) {
        console.error("No se pudo guardar en archivo:", err);
    }
}

// --- BASE DE DATOS DEL PROYECTO ---
const infoProyecto = `
--- 1. IDENTIDAD Y RESPALDO LEGAL (AUTORIDAD) ---
NOMBRE COMERCIAL: Residencial "Parques del Alba".
UBICACIÓN: Km 7.5 Carretera a Chulucanas, Piura. A 20 minutos del centro.
ESTRUCTURA EMPRESARIAL (CONSORCIO):
- PROPIETARIA DEL TERRENO: MADI INGENIERIA DE PROYECTOS S.A.C.S. (Partida Registral N° 11272385).
- GERENCIA DEL PROYECTO: URBINA ASESORIA E INVERSIONES SAC.
- CONSTRUCTORA: NATIVO ARQUITECTURA Y CONSTRUCCIÓN SAC.
ESTADO LEGAL: "Transparencia Radical". Lotes con partida matriz inscrita en SUNARP.

--- 2. EL "ARGUMENTO GANADOR" (LA CENTRALIDAD GORE) ---
CONCEPTO CLAVE: "No vendemos lejanía, vendemos futuro inmediato".
UBICACIÓN ESTRATÉGICA: A solo 2 MINUTOS del futuro proyecto "Centralidad Comercial del GORE" (Nuevo Terminal Terrestre y Mercado Mayorista).
IMPACTO: "Doble motor de valorización" (Nuestro proyecto + Proyecto GORE).

--- 3. PRODUCTO Y CARACTERÍSTICAS ---
CANTIDAD: 149 lotes exclusivos (90m² a 225m²).
SERVICIOS:
1. Pórtico de Ingreso con Caseta de Seguridad (Permanente).
2. Servicios Básicos Completos (Agua y luz garantizadas).
3. Áreas Verdes: 3 parques con parrillas, mirador, cancha y juegos.
4. Cerco vivo y reforestación.
INFRAESTRUCTURA VIAL:
- Veredas de Concreto.
- Pistas Afirmadas Técnicas (Argumento: Mejor drenaje pluvial ante lluvias de Piura y menor costo para el cliente).

--- 4. PRECIOS Y FINANCIAMIENTO ---
RANGO PRECIO: S/ 200 - S/ 230 por m².
PRECIO REFERENCIAL (90m²): S/ 18,000 - S/ 21,000.
FINANCIAMIENTO DIRECTO:
- Solo DNI, sin bancos.
- Inicial desde S/ 2,000.
- Plazo hasta 18 meses.
- Descuento contado: S/ 1,000.
BENEFICIO: Exoneración de Alcabala (Primera venta).

--- 5. PERFILES Y GUIONES ---
PERFIL A: INVERSIONISTA (ROI Rápido). Argumento: Compra tierra barata antes que el GORE dispare el precio.
PERFIL B: FAMILIA JOVEN (1ra Vivienda). Argumento: Deja de alquilar. Seguridad para hijos.
PERFIL C: ESTABLECIDO (Campo/Retiro). Argumento: Paz, seguridad 24/7, áreas verdes.

--- 6. MANEJO DE OBJECIONES ---
- "ESTÁ LEJOS": "Mire la foto de mañana. Estamos a 2 min del futuro eje comercial. Compra barato hoy antes que suba."
- "PISTAS DE TIERRA": "Es un sistema híbrido: Veredas de concreto + Pistas de afirmado técnico para drenaje de lluvias. Evita inundaciones y mantiene el precio bajo."
- "DESCONFIANZA": "Transparencia total. Entregamos Dossier con Partida Registral antes de la compra."
- "ESTÁ CARO": "Por S/200 tiene seguridad 24/7 y plusvalía GORE. Lo barato sale caro si no tiene título o seguridad."
`;

async function notificarAsesor(resumenLead, telefonoCliente) {
    try {
        const mensaje = `
🚨 *ALERTA DE LEAD CALIENTE* 🚨
--------------------------------
👤 *Cliente:* ${telefonoCliente}
📝 *Interés:* ${resumenLead}
🔗 *Click para atender:* https://wa.me/${telefonoCliente.replace("whatsapp:+", "")}
--------------------------------
*El bot ya filtró. Cierra la venta.* 🚀
`;
        await client.messages.create({ body: mensaje, from: BOT_NUMBER, to: ASESOR_NUMBER });
        console.log("✅ Alerta enviada al asesor.");
    } catch (error) {
        console.error("❌ Error notificando asesor:", error);
    }
}

async function getGeminiResponse(userMessage) {
    try {
        const promptSistema = `
ROL: Eres el "Closer Experto" de "Parques del Alba". ESTRATEGA DE PROYECTOS DE VIDA.
OBJETIVO: Filtrar y CONSEGUIR LA VISITA.

BASE DE CONOCIMIENTO:
${infoProyecto}

REGLAS DE ORO:
1. REGLA DEL BUMERÁN: JAMÁS termines con una afirmación. SIEMPRE termina con una pregunta estratégica.
2. TÉCNICA 4P: Si piden precio -> Di Precio Base + Promoción + Presión (Escasez) + Pregunta de Cierre.
3. PERFILAMIENTO: Detecta si es Inversor, Joven o Retiro.
4. OBJECIONES: Valida -> Re-encuadra (GORE/Drenaje) -> Cierra.
5. DERIVACIÓN: Si hay intención de compra clara, escribe en una línea nueva al final: "ALERTAR_ASESOR: [Resumen]".

INSTRUCCIÓN:
Respuesta breve (máx 4 líneas), empática y TERMINA CON PREGUNTA.

CLIENTE DICE: "${userMessage}"
`;
        const result = await model.generateContent(promptSistema);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error IA:", error);
        return "La señal está baja en obra. ¿Me repites por favor? 🏗️";
    }
}

// --- RUTA PRINCIPAL ---
app.post('/whatsapp', async (req, res) => {
    const incomingMsg = req.body.Body;
    const senderNum = req.body.From;

    // 1. REGISTRAR LO QUE DIJO EL CLIENTE
    registrarConversacion("CLIENTE", incomingMsg, senderNum);

    // 2. OBTENER RESPUESTA IA
    let aiResponse = await getGeminiResponse(incomingMsg);
    let respuestaLimpia = aiResponse;

    // 3. VERIFICAR ALERTA
    if (aiResponse.includes("ALERTAR_ASESOR:")) {
        const partes = aiResponse.split("ALERTAR_ASESOR:");
        respuestaLimpia = partes[0].trim();
        const resumenLead = partes[1].trim();
        
        notificarAsesor(resumenLead, senderNum);
        registrarConversacion("SISTEMA", "⚠️ ALERTA ENVIADA AL GERENTE", senderNum);
    }

    // 4. REGISTRAR LO QUE VA A DECIR EL BOT
    registrarConversacion("BOT", respuestaLimpia, senderNum);

    // 5. ENVIAR A WHATSAPP
    const twiml = new MessagingResponse();
    twiml.message(respuestaLimpia);
    res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
    console.log('--- SERVIDOR CON REGISTRO HISTÓRICO LISTO ---');
});