// import fetch from "node-fetch";
// import NodeCache from "node-cache";

// const myCache = new NodeCache({ stdTTL: 3600 });

// const BASEURL = "https://apiefeito-renuncia-3ldh3.ondigitalocean.app/renuncias";

// const fetchPage = async (params) => {
//   const urlParams = new URLSearchParams(params);
//   const url = `${BASEURL}?${urlParams.toString()}`;
//   try {
//     const response = await fetch(url);
//     if (!response.ok) return [];
//     return await response.json();
//   } catch (error) {
//     return [];
//   }
// };


// const fetchInBatches = async (params, totalPages, batchSize) => {
//   let allResults = [];
//   for (let i = 0; i < totalPages; i += batchSize) {
//     const pagePromises = [];
//     const endOfBatch = Math.min(i + batchSize, totalPages);
//     for (let j = i + 1; j <= endOfBatch; j++) pagePromises.push(fetchPage(params, j));
//     const batchResults = await Promise.all(pagePromises);
//     batchResults.forEach((pageData) => {
//       if (Array.isArray(pageData)) allResults.push(...pageData);
//     });
//   }
//   return allResults;
// };
 
// // =============================DEVE FICAR COMENTADO =============================

// // export default async function handler(req, res) {
// //   res.setHeader("Access-Control-Allow-Origin", "https://consulta-beneficios-fiscais.vercel.app");
// //   res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
// //   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
// //   // Permitir resposta rápida para preflight (OPTIONS)
// //   if (req.method === "OPTIONS") {
// //     res.status(200).end();
// //     return;
// //   }
// //   try {
// //     const { ano = "todos", uf = "", cnpj = "", descricaoBeneficioFiscal = "todos" } = req.query;

// //     if (!uf && !cnpj) {
// //       return res.status(400).json({
// //         message: "Por favor, forneça um filtro primário (Estado ou CNPJ) para iniciar a busca."
// //       });
// //     }

// //     const primaryFilters = { uf, cnpj };
// //     const cacheKey = `raw-${JSON.stringify(primaryFilters)}`;
// //     let dadosPrimarios;

// //     if (myCache.has(cacheKey)) {
// //       dadosPrimarios = myCache.get(cacheKey);
// //     } else {
// //       const paramsApiExterna = {};
// //       if (uf) paramsApiExterna.nomeSiglaUF = uf;
// //       if (cnpj) paramsApiExterna.cnpj = cnpj;
// //       const MAX_PAGES_TO_FETCH = 2000;
// //       const BATCH_SIZE = 20;
// //       const allData = await fetchInBatches(paramsApiExterna, MAX_PAGES_TO_FETCH, BATCH_SIZE);
// //       myCache.set(cacheKey, allData);
// //       dadosPrimarios = allData;
// //     }

// //     let dadosRelevantes = dadosPrimarios;
// //     let anosDisponiveis = [...new Set(dadosRelevantes.map(item => item.ano))].sort((a, b) => b - a);
// //     let beneficiosDisponiveis = [...new Set(dadosRelevantes.map(item => item.descricaoBeneficioFiscal))].sort();

// //     let dadosFiltrados = dadosRelevantes;
// //     if (ano && ano !== "todos") dadosFiltrados = dadosFiltrados.filter(item => item.ano == ano);
// //     if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos")
// //       dadosFiltrados = dadosFiltrados.filter(item => item.descricaoBeneficioFiscal === descricaoBeneficioFiscal);

// //     res.status(200).json({
// //       resultados: dadosFiltrados,
// //       anosDisponiveis,
// //       beneficiosDisponiveis,
// //     });
// //   } catch (error) {
// //     res.status(500).json({ message: "Ocorreu um erro no servidor.", details: error.message });
// //   }
// // }

// // export default async function handler(req, res) {
// //   res.setHeader("Access-Control-Allow-Origin", "*");
// //   res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
// //   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

// //   if (req.method === "OPTIONS") return res.status(200).end();

// //   const BASEURL = "https://apiefeito-renuncia-3ldh3.ondigitalocean.app/renuncias";

// //   // Monta os filtros dinâmicos recebidos
// //   const searchParams = new URLSearchParams();
// //   const filtros = ["cnpj", "uf", "ano", "descricaoBeneficioFiscal", "page", "limit", "tributo", "municipio"];
// //   for (const filtro of filtros) {
// //     if (req.query[filtro]) searchParams.append(filtro, req.query[filtro]);
// //   }
// //   // Se não enviar limit, seta 100 como padrão
// //   if (!req.query.limit) searchParams.append("limit", 100);

// //   const url = `${BASEURL}?${searchParams.toString()}`;

// //   try {
// //     const response = await fetch(url);
// //     if (!response.ok) {
// //       const msg = await response.text();
// //       return res.status(response.status).json({ error: msg });
// //     }
// //     const data = await response.json();
// //     return res.status(200).json({ resultados: data });
// //   } catch (error) {
// //     return res.status(500).json({ error: error.message });
// //   }
// // }

// // ==========================================DEVE FICAR COMENTADO==========================================

// export default async function handler(req, res) {
//   // res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Origin", "https://consulta-beneficios-fiscais.vercel.app");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") return res.status(200).end();

//   const BASEURL = "https://apiefeito-renuncia-3ldh3.ondigitalocean.app/renuncias";
//   const filtros = ["cnpj", "uf", "ano", "descricaoBeneficioFiscal"];
//   const searchParams = new URLSearchParams();

//   for (const filtro of filtros) {
//     if (req.query[filtro]) searchParams.append(filtro, req.query[filtro]);
//   }

//   const limit = 500; // Defina por página conforme sua API permite
//   let page = 1;
//   let totalRegistros = [];
//   let registros;

//   try {
//     do {
//       searchParams.set("limit", limit);
//       searchParams.set("page", page);
//       const url = `${BASEURL}?${searchParams.toString()}`;
//       const response = await fetch(url);
//       if (!response.ok) break;

//       registros = await response.json();

//       if (Array.isArray(registros)) {
//         totalRegistros = totalRegistros.concat(registros);
//       } else if (registros.resultados) {
//         totalRegistros = totalRegistros.concat(registros.resultados);
//       }
//       page++;
//       // Para evitar explodir o tempo
//       if (page > 30) break; // Exemplo: máximo 30 páginas == 15.000 registros
//     } while (registros && registros.length === limit);

//     res.status(200).json({ resultados: totalRegistros });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }


// /api/renuncias-raw.js
import fetch from "node-fetch";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 3600 });
const BASE_URL = "https://apiefeito-renuncia-3ldh3.ondigitalocean.app/renuncias";

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Origin", "https://consulta-beneficios-fiscais.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { uf, cnpj, ano = "todos", descricaoBeneficioFiscal = "todos" } = req.query;

    // Exemplo de cache para filtros primários
    const cacheKey = `raw-${JSON.stringify({ uf, cnpj, ano, descricaoBeneficioFiscal })}`;
    if (myCache.has(cacheKey)) {
      return res.status(200).json(myCache.get(cacheKey));
    }

    // Montagem dos parâmetros
    const params = new URLSearchParams();
    if (uf) params.append("uf", uf);
    if (cnpj) params.append("cnpj", cnpj);

    const url = `${BASE_URL}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const msg = await response.text();
      return res.status(response.status).json({ error: msg });
    }

    const data = await response.json();

    // Cachear
    myCache.set(cacheKey, data);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Erro interno no servidor.", details: error.message });
  }
}
