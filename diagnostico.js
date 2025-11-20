const apiKey = "AIzaSyDzS_G9ESwINJCuLtSXZz6CN4Xdfpo1y6A"; // <--- PEGA TU CLAVE AQUÍ

console.log("🔍 Consultando a Google qué modelos tienes disponibles...");

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error("❌ ERROR EN LA CUENTA:", data.error.message);
    } else if (data.models) {
      console.log("✅ ¡CONEXIÓN EXITOSA! Tu clave permite usar estos modelos:");
      console.log("------------------------------------------------");
      data.models.forEach(m => {
        // Solo mostramos los que sirven para generar texto
        if(m.supportedGenerationMethods.includes("generateContent")) {
            console.log(`Nombre exacto: ${m.name.replace("models/", "")}`);
        }
      });
      console.log("------------------------------------------------");
      console.log("👉 Copia uno de esos nombres exactos para tu index.js");
    } else {
      console.log("⚠️ Tu cuenta conecta, pero NO tiene modelos asignados. Crea un proyecto nuevo.");
    }
  })
  .catch(err => console.error("Error de red:", err));