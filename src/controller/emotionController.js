const Emotion = require('../models/Emotion');
const analyzeEmotion = require('../utils/emotionalAnalyzer');

exports.saveEmotion = async (req, res) => {
  try {
    const { user, message } = req.body;

    const analysis = await analyzeEmotion(message);

    const emotion = new Emotion({
      user,
      message,
      mood: analysis.mood,
      isCritical: analysis.isCritical,
    });

    await emotion.save();

    let responseMsg = 'Gracias por confiar en mí. Estoy acá para escucharte.';
    if (analysis.isCritical) {
      responseMsg =
        'Detecté que estás pasando un momento muy difícil. No estás solo/a. Si querés, puedo recomendarte ayuda profesional y acompañarte en este proceso.';
    }

    res.status(201).json({ message: responseMsg, mood: analysis.mood });
  } catch (err) {
    console.error('Error al guardar emoción:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
