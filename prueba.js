const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. PEGA TU CLAVE AQUÍ DENTRO DE LAS COMILLAS
const genAI = new GoogleGenerativeAI("AIzaSyDzS_G9ESwINJCuLtSXZz6CN4Xdfpo1y6A");

async function probarConexion() {
  console.log("---- INICIANDO PRUEBA ----");
  
  // Intentaremos con el modelo más básico y estable
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Hola, ¿estás funcionando?");
    const response = await result.response;
    console.log("¡ÉXITO! Respuesta de Gemini:");
    console.log(response.text());
  } catch (error) {
    console.log("---- ERROR DETALLADO ----");
    console.error(error);
    console.log("-------------------------");
  }
}

probarConexion();