require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MessagingResponse } = require('twilio').twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// 1. Configuración de Gemini
// Pega tu clave larga dentro de las comillas
const genAI = new GoogleGenerativeAI("AIzaSyDzS_G9ESwINJCuLtSXZz6CN4Xdfpo1y6A");

// 2. Función para obtener respuesta de Gemini
async function getGeminiResponse(message) {
    try {
        // Usamos el modelo gemini-pro (o 2.0-flash que es rápido)
	// Usamos el modelo exacto que apareció en tu lista de diagnóstico
	const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error en Gemini:", error);
        return "Lo siento, tuve un error pensando mi respuesta.";
    }
}

// 3. Ruta que recibe el mensaje de WhatsApp
app.post('/whatsapp', async (req, res) => {
    const incomingMsg = req.body.Body; // El mensaje del usuario
    console.log(`Mensaje recibido: ${incomingMsg}`);

    // Obtenemos la respuesta de la IA
    const aiResponse = await getGeminiResponse(incomingMsg);

    // Preparamos la respuesta para Twilio (TwiML)
    const twiml = new MessagingResponse();
    twiml.message(aiResponse);

    res.type('text/xml').send(twiml.toString());
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('El servidor está corriendo en el puerto 3000');
});