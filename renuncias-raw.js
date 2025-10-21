import fetch from "node-fetch";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 3600 });

const BASEURL = "https://apiefeito-renuncia-3ldh3.ondigitalocean.app/renuncias";

const fetchPage = async (params) => {
  const urlParams = new URLSearchParams(params);
  const url = `${BASEURL}?${urlParams.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
};


const fetchInBatches = async (params, totalPages, batchSize) => {
  let allResults = [];
  for (let i = 0; i < totalPages; i += batchSize) {
    const pagePromises = [];
    const endOfBatch = Math.min(i + batchSize, totalPages);
    for (let j = i + 1; j <= endOfBatch; j++) pagePromises.push(fetchPage(params, j));
    const batchResults = await Promise.all(pagePromises);
    batchResults.forEach((pageData) => {
      if (Array.isArray(pageData)) allResults.push(...pageData);
    });
  }
  return allResults;
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://consulta-beneficios-fiscais.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Permitir resposta rápida para preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  try {
    const { ano = "todos", uf = "", cnpj = "", descricaoBeneficioFiscal = "todos" } = req.query;

    if (!uf && !cnpj) {
      return res.status(400).json({
        message: "Por favor, forneça um filtro primário (Estado ou CNPJ) para iniciar a busca."
      });
    }

    const primaryFilters = { uf, cnpj };
    const cacheKey = `raw-${JSON.stringify(primaryFilters)}`;
    let dadosPrimarios;

    if (myCache.has(cacheKey)) {
      dadosPrimarios = myCache.get(cacheKey);
    } else {
      const paramsApiExterna = {};
      if (uf) paramsApiExterna.nomeSiglaUF = uf;
      if (cnpj) paramsApiExterna.cnpj = cnpj;
      const MAX_PAGES_TO_FETCH = 2000;
      const BATCH_SIZE = 20;
      const allData = await fetchInBatches(paramsApiExterna, MAX_PAGES_TO_FETCH, BATCH_SIZE);
      myCache.set(cacheKey, allData);
      dadosPrimarios = allData;
    }

    let dadosRelevantes = dadosPrimarios;
    let anosDisponiveis = [...new Set(dadosRelevantes.map(item => item.ano))].sort((a, b) => b - a);
    let beneficiosDisponiveis = [...new Set(dadosRelevantes.map(item => item.descricaoBeneficioFiscal))].sort();

    let dadosFiltrados = dadosRelevantes;
    if (ano && ano !== "todos") dadosFiltrados = dadosFiltrados.filter(item => item.ano == ano);
    if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos")
      dadosFiltrados = dadosFiltrados.filter(item => item.descricaoBeneficioFiscal === descricaoBeneficioFiscal);

    res.status(200).json({
      resultados: dadosFiltrados,
      anosDisponiveis,
      beneficiosDisponiveis,
    });
  } catch (error) {
    res.status(500).json({ message: "Ocorreu um erro no servidor.", details: error.message });
  }
}
