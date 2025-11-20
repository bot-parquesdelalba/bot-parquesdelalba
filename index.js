require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MessagingResponse } = require('twilio').twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// 1. CONFIGURACIÓN (Pon tu clave aquí)
// Usaremos 'gemini-1.5-flash' que vimos en tu lista y es el más estable para empezar.
// Si este funciona, luego probamos el 2.0.
const genAI = new GoogleGenerativeAI("AIzaSyDzS_G9ESwINJCuLtSXZz6CN4Xdfpo1y6A");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- BASE DE DATOS DEL PROYECTO (Edita esto con tus datos reales) ---
const infoProyecto = `
--- IDENTIDAD DEL PROYECTO ---
NOMBRE: Residencial "Parques del Alba".
UBICACIÓN EXACTA: Km 7.5 Carretera a Chulucanas, Piura.
ESLOGAN: "Un Nuevo Amanecer para tu Familia".
ESTADO: Lanzamiento / Pre-venta.
CANTIDAD DE LOTES: 149 unidades exclusivas.

--- EL "ARGUMENTO GANADOR" (LA CENTRALIDAD) ---
UBICACIÓN ESTRATÉGICA: A solo 20 minutos del centro de Piura.
EL SECRETO DE VALORIZACIÓN: Estamos a solo 3 MINUTOS del futuro proyecto "Centralidad Comercial del GORE" (Terminal Terrestre, Mercado Mayorista y Plaza Cívica). [cite_start]Esto garantiza una plusvalía exponencial.

--- PRODUCTO Y CARACTERÍSTICAS TÉCNICAS ---
[cite_start]TAMAÑOS DE LOTES: Desde 90m² hasta 225m².
SERVICIOS:
1. [cite_start]Agua y red eléctrica (Instalaciones completas garantizadas).
2. [cite_start]Pórtico de ingreso con caseta de seguridad (Característica #1 más valorada).
3. [cite_start]Parques, zonas de juegos y jardines temáticos.
INFRAESTRUCTURA VIAL: Pistas afirmadas de alta compactación.
[cite_start]*Argumento técnico:* Se decidió usar afirmado por ingeniería para garantizar un DRENAJE PLUVIAL SUPERIOR ante lluvias (mejor que el asfalto simple que se inunda) y para mantener el precio de lanzamiento accesible[cite: 608].

--- PRECIOS Y FINANCIAMIENTO ---
[cite_start]PRECIO BASE: Desde S/ 200 por m² (Punto Óptimo de Aceptación)[cite: 2583].
Lote típico (90m²): Aprox. S/ 18,000 (Referencial, confirmar disponibilidad).
PLUS POR UBICACIÓN:
- Coordinar con Asesor Comercial.

FINANCIAMIENTO DIRECTO (CRÉDITO DIRECTO):
- Sin evaluación bancaria compleja (Solo DNI).
- [cite_start]Cuota inicial: Desde 2,000 soles.
- [cite_start]Plazo: Hasta 18 meses, con opciones.
- [cite_start]Descuento Contado: Hasta 1,000 soles.

--- BENEFICIOS LEGALES Y TRIBUTARIOS ---
1. [cite_start]EXONERACIÓN DE ALCABALA: Al ser primera venta, el cliente se ahorra el 3% del impuesto de Alcabala (Ahorro directo).
2. [cite_start]SEGURIDAD JURÍDICA: Cada lote se entrega con plano de ubicación y memoria descriptiva y se eleva a registros públicos por acciones y derechos (Dossier de Transparencia).

--- PERFILES DE CLIENTE (CÓMO VENDERLE A CADA UNO) ---
1. PARA EL INVERSOR (35% del mercado):
   - Enfoque: ROI y Plusvalía.
   - Argumento clave: "Doble motor de valorización": El desarrollo del proyecto + La cercanía a la Centralidad Comercial del GORE. Comprar hoy a precio de lanzamiento asegura ganancia antes de que suban los precios por las obras públicas.

2. PARA EL JOVEN PROFESIONAL (1ra Vivienda - 31% del mercado):
   - Enfoque: Asequibilidad y Futuro.
   - Argumento clave: "Deja de pagar alquiler y construye patrimonio". Financiamiento directo fácil. Seguridad para tu futura familia.

3. PARA EL PROFESIONAL ESTABLECIDO (Retiro/Casa Campo - 34% del mercado):
   - Enfoque: Tranquilidad y Seguridad.
   - Argumento clave: Pórtico de seguridad permanente. Lejos del caos, cerca de todo. Espacios verdes para nietos o descanso.

--- MANEJO DE OBJECIONES (RESPUESTAS DE PODER) ---
OBJECIÓN: "Está lejos".
[cite_start]RESPUESTA: "No compare con la foto de hoy, mire la foto del futuro. Estamos a 3 minutos del Nuevo Terminal Terrestre. No está comprando lejanía, está comprando el futuro centro comercial de Piura a precio de preventa"[cite: 700].

OBJECIÓN: "Son pistas afirmadas, no asfalto".
[cite_start]RESPUESTA: "Es una decisión técnica por las lluvias de Piura. El afirmado compactado tiene mejor drenaje pluvial que el asfalto barato. Además, esto nos permite darle el mejor precio del mercado. ¿Prefiere asfalto que se inunda o un terreno seguro y accesible?"[cite: 701].

OBJECIÓN: "Proyecto nuevo / Desconfianza".
[cite_start]RESPUESTA: "Entiendo su preocupación. Por eso trabajamos con 'Transparencia Radical'. Tenemos todo inscrito en SUNARP y la exoneración de Alcabala prueba que es primera venta legal. ¿Le gustaría ver la partida registral?"[cite: 701].
`;
async function getGeminiResponse(userMessage) {
    console.log("   --> ⏳ Consultando al Closer de Parques del Alba...");
    try {
        const promptSistema = `
        ROL: Eres el "Closer" estrella de "Parques del Alba". No eres un vendedor pasivo que da datos, eres un ESTRATEGA DE PROYECTOS DE VIDA.
        
        TU OBJETIVO: Conseguir una VISITA al proyecto. No vendas el terreno por chat, vende la visita.
        
        TONO Y ESTILO:
        - Profesional pero cercano (Piura).
        - Usa neuroventas: Calma el cerebro reptiliano (seguridad jurídica), enamora al límbico (estilo de vida) y justifica al neocórtex (precios/plusvalía).
        - Usa emojis moderados: 🏡✨🌳👷‍♂️.
        
        REGLAS DE ORO (MÉTODO CLOSER):
        1. ESCUCHA NIVEL 3: Identifica si es Inversor, Joven o busca Casa de Campo según lo que escribe.
        2. VALIDACIÓN EMOCIONAL: Antes de rebatir una objeción, valida: "Entiendo perfectamente su preocupación...".
        3. EL GORE: Menciona siempre la cercanía (3 min) a la futura "Centralidad Comercial del GORE" como acelerador de plusvalía.
        4. CIERRE: Termina siempre con una pregunta de doble alternativa para agendar visita. Ej: "¿Le queda mejor jueves por la tarde o sábado por la mañana?".

        BASE DE CONOCIMIENTO:
        ${infoProyecto}

        INSTRUCCIÓN: Responde al siguiente mensaje del cliente de forma breve (máximo 4 líneas de texto + pregunta de cierre).
        
        CLIENTE DICE: "${userMessage}"
        `;

        const result = await model.generateContent(promptSistema);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error IA:", error);
        return "¡Hola! La señal está un poco baja en obra 🏗️. ¿Podrías repetirme tu consulta? Estoy aquí para asesorarte sobre tu mejor inversión.";
    }
}
app.post('/whatsapp', async (req, res) => {
    const incomingMsg = req.body.Body;
    console.log(`\n📩 NUEVO MENSAJE: ${incomingMsg}`);

    // Obtener respuesta
    const aiResponse = await getGeminiResponse(incomingMsg);

    // Responder a Twilio
    console.log("   --> 📤 4. Empaquetando respuesta para WhatsApp...");
    const twiml = new MessagingResponse();
    twiml.message(aiResponse);

    res.type('text/xml').send(twiml.toString());
    console.log("   --> 🚀 5. ¡ENVIADO!");
});

app.listen(3000, () => {
    console.log('--- EL SERVIDOR "DEBUG" ESTÁ LISTO EN EL PUERTO 3000 ---');
});