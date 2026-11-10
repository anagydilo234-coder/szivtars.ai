
import express from "express";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));

app.use("/api/", rateLimit({
  windowMs: 60000,
  limit: 20
}));

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "Az AI-kulcs még nincs beállítva."
      });
    }

    const { character, persona, messages } = req.body;

    if (!Array.isArray(messages) || messages.length > 16) {
      return res.status(400).json({ error: "Hibás üzenet." });
    }

    const ai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const result = await ai.responses.create({
      model: "gpt-4.1-mini",
      instructions: `Te ${character} vagy, egy felnőtt, 18+ fiktív AI-karakter. Személyiséged: ${persona}. Magyarul, kedvesen, természetesen és romantikusan beszélgess. Ne állítsd, hogy valódi ember vagy.`,
      input: messages
    });

    res.json({ reply: result.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Az AI jelenleg nem elérhető."
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("SzívTárs AI elindult!");
});
