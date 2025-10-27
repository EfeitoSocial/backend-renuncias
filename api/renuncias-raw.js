// // // ==========================================DEVE FICAR COMENTADO==========================================

// // export default async function handler(req, res) {
// //   // res.setHeader("Access-Control-Allow-Origin", "*");
// //   res.setHeader("Access-Control-Allow-Origin", "https://consulta-beneficios-fiscais.vercel.app");
// //   res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
// //   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

// //   if (req.method === "OPTIONS") return res.status(200).end();

// //   const BASEURL = "https://apiefeito-renuncia-3ldh3.ondigitalocean.app/renuncias";
// //   const filtros = ["cnpj", "uf", "ano", "descricaoBeneficioFiscal"];
// //   const searchParams = new URLSearchParams();

// //   for (const filtro of filtros) {
// //     if (req.query[filtro]) searchParams.append(filtro, req.query[filtro]);
// //   }

// //   const limit = 500; // Defina por página conforme sua API permite
// //   let page = 1;
// //   let totalRegistros = [];
// //   let registros;

// //   try {
// //     do {
// //       searchParams.set("limit", limit);
// //       searchParams.set("page", page);
// //       const url = `${BASEURL}?${searchParams.toString()}`;
// //       const response = await fetch(url);
// //       if (!response.ok) break;

// //       registros = await response.json();

// //       if (Array.isArray(registros)) {
// //         totalRegistros = totalRegistros.concat(registros);
// //       } else if (registros.resultados) {
// //         totalRegistros = totalRegistros.concat(registros.resultados);
// //       }
// //       page++;
// //       // Para evitar explodir o tempo
// //       if (page > 30) break; // Exemplo: máximo 30 páginas == 15.000 registros
// //     } while (registros && registros.length === limit);

// //     res.status(200).json({ resultados: totalRegistros });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // }




// ========================ultimo que deu certo ========================

// // /api/renuncias-raw.js
// import fetch from "node-fetch";
// import NodeCache from "node-cache";

// const myCache = new NodeCache({ stdTTL: 3600 });
// const BASE_URL = "https://apiefeito-renuncia-3ldh3.ondigitalocean.app/renuncias";

// export default async function handler(req, res) {
//   // CORS configuration
//   res.setHeader("Access-Control-Allow-Origin", "https://consulta-beneficios-fiscais-bmyg.vercel.app");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") {
//     res.status(200).end();
//     return;
//   }

//   try {
//     const { uf, cnpj, ano = "todos", descricaoBeneficioFiscal = "todos" } = req.query;

//     // Exemplo de cache para filtros primários
//     const cacheKey = `raw-${JSON.stringify({ uf, cnpj, ano, descricaoBeneficioFiscal })}`;
//     if (myCache.has(cacheKey)) {
//       return res.status(200).json(myCache.get(cacheKey));
//     }

//     // Montagem dos parâmetros
//     const params = new URLSearchParams();
//     if (uf) params.append("uf", uf);
//     if (cnpj) params.append("cnpj", cnpj);

//     const url = `${BASE_URL}?${params.toString()}`;
//     const response = await fetch(url);

//     if (!response.ok) {
//       const msg = await response.text();
//       return res.status(response.status).json({ error: msg });
//     }

//     const data = await response.json();

//     // Cachear
//     myCache.set(cacheKey, data);

//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ message: "Erro interno no servidor.", details: error.message });
//   }
// }
// =========================novo editado =======================

// api/renuncias-raw.js
import { fetchDataFromLocalAPI } from "../lib/fetchDataFromLocalAPI.js";
import cache from "../lib/cache.js";

/**
 * Handler serverless para /api/renuncias-raw
 * Deploy na Vercel: coloque esse arquivo dentro da pasta api/ (ou ajuste conforme seu framework)
 */
export default async function handler(req, res) {
  // Suporte básico a CORS (se sua front chama direto)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const { ano, uf, cnpj, descricaoBeneficioFiscal } = (req.query || req.url?.includes("?")) ? req.query : req.body || {};

    if (!uf && !cnpj) {
      return res.status(400).json({ message: "Por favor, forneça um filtro primário (uf ou cnpj)." });
    }

    const primaryFilters = { uf: uf || null, cnpj: cnpj || null };
    const cacheKey = `raw-${JSON.stringify(primaryFilters)}`;

    let dadosPrimarios;
    if (cache.has(cacheKey)) {
      console.log("[renuncias-raw] usando cache:", cacheKey);
      dadosPrimarios = cache.get(cacheKey);
    } else {
      console.log("[renuncias-raw] buscando API remota...");
      dadosPrimarios = await fetchDataFromLocalAPI({ uf, cnpj });
      cache.set(cacheKey, dadosPrimarios);
    }

    const anosDisponiveis = [...new Set(dadosPrimarios.map(item => item.ano))].sort((a, b) => b - a);
    const beneficiosDisponiveis = [...new Set(dadosPrimarios.map(item => item.descricaoBeneficioFiscal))].sort();

    let dadosFiltrados = dadosPrimarios;
    if (ano && ano !== "todos") dadosFiltrados = dadosFiltrados.filter(item => item.ano == ano);
    // if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos") {
    //   dadosFiltrados = dadosFiltrados.filter(item => item.descricaoBeneficioFiscal === descricaoBeneficioFiscal);
    // }
    if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos") {
  let listaBeneficios = descricaoBeneficioFiscal;
  if (typeof listaBeneficios === "string") {
    // Suporta tanto envio separado por vírgula quanto array
    listaBeneficios = listaBeneficios.split(",");
  }
  dadosFiltrados = dadosFiltrados.filter(
    item => listaBeneficios.includes(item.descricaoBeneficioFiscal)
  );
}


    return res.status(200).json({
      resultados: dadosFiltrados,
      anosDisponiveis,
      beneficiosDisponiveis,
    });
  } catch (error) {
    console.error("[renuncias-raw] Erro:", error);
    return res.status(500).json({ message: "Ocorreu um erro no servidor.", details: error?.message });
  }
}
