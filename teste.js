export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://consulta-beneficios-fiscais.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Permitir resposta rápida para preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  res.status(200).json({
    message: "Ol\u00e1! A API de An\u00e1lise est\u00e1 a funcionar."
  });
}
