const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeEmotion(message) {
  const analysisPrompt = `
Actuás como un psicólogo clínico especializado en salud mental crítica. El siguiente usuario escribió:

"${message}"

Tu única tarea es devolver un JSON válido y exacto con esta estructura:

{
  "mood": "una palabra entre: feliz, triste, enojado, neutral, ansioso, deprimido, eufórico, crítico",
  "isCritical": true o false (true si detectás ideas suicidas, autolesiones, desesperación o alto riesgo emocional)
}

⚠️ No expliques nada. No agregues texto adicional. Solo respondé con el JSON y nada más.
`;

  const primaryResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: analysisPrompt }],
    temperature: 0.3,
  });

  let initialAnalysis;

  try {
    const content = primaryResponse.choices[0].message.content.trim();
    initialAnalysis = JSON.parse(content);
  } catch (err) {
    console.error('Error parseando análisis inicial:', err.message);
    return {
      mood: 'desconocido',
      isCritical: false,
      protocol: 'seguimiento continuo',
      confirmed: false,
      corrected: true,
      responseMessage: "No pude procesar bien tu mensaje, pero si estás pasando un mal momento, acá estoy para acompañarte. No estás solo."
    };
  }

  const revisionPrompt = `
Estás actuando como un psicólogo clínico supervisor. Acabas de analizar este mensaje de un usuario:

"${message}"

El análisis anterior fue:

${JSON.stringify(initialAnalysis)}

Tu tarea es:
1. Confirmar si ese análisis es correcto o necesita corrección.
2. En caso de error, devolver el análisis corregido.
3. Sugerir qué protocolo de acción seguir:
   - Escucha activa
   - Ejercicios de respiración o mindfulness
   - Derivación urgente a profesional
   - Mensaje de contención emocional
   - Seguimiento continuo

Devolveme un JSON así:

{
  "confirmed": true o false,
  "correctedAnalysis": { "mood": "...", "isCritical": ... } (solo si confirmed es false),
  "actionProtocol": "una de las opciones"
}
`;

  const revisionResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: revisionPrompt }],
    temperature: 0.3,
  });

  let finalAnalysis;
  let actionProtocol;
  let confirmed = false;
  let corrected = false;

  try {
    const revisionContent = revisionResponse.choices[0].message.content.trim();
    const revisionJSON = JSON.parse(revisionContent);

    finalAnalysis = revisionJSON.confirmed
      ? initialAnalysis
      : revisionJSON.correctedAnalysis;

    actionProtocol = revisionJSON.actionProtocol;
    confirmed = revisionJSON.confirmed;
    corrected = !revisionJSON.confirmed;

  } catch (err) {
    console.error('Error en revisión del análisis:', err.message);
    finalAnalysis = initialAnalysis;
    actionProtocol = 'seguimiento continuo';
    confirmed = false;
    corrected = false;
  }

  const emotionalResponsePrompt = `
Estás actuando como un psicólogo clínico, hablando directamente con un paciente que se expresó de la siguiente forma:

"${message}"

El análisis profesional fue:

{
  "mood": "${finalAnalysis.mood}",
  "isCritical": ${finalAnalysis.isCritical},
  "actionProtocol": "${actionProtocol}"
}

Tu tarea es responderle con un mensaje cálido, humano, empático y contenedor, como si fueras su terapeuta. Usá un tono amable, esperanzador y directo, evitando tecnicismos o diagnósticos.

No devuelvas JSON. No expliques el análisis. Solo escribí el mensaje emocional final.
`;

  let responseMessage = "Estoy acá para acompañarte, aunque no haya podido generar una respuesta personalizada.";

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: emotionalResponsePrompt }],
      temperature: 0.7,
    });

    responseMessage = response.choices[0].message.content.trim();
  } catch (err) {
    console.error('Error generando mensaje empático:', err.message);
  }

  return {
    ...finalAnalysis,
    protocol: actionProtocol,
    confirmed,
    corrected,
    responseMessage
  };
}

module.exports = analyzeEmotion;
