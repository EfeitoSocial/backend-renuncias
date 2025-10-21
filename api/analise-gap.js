// Estrutura igual ao anterior para dependências:
import fetch from "node-fetch";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 3600 });

const fetchPage = async (params, page) => { /* igual à anterior */ };
const fetchInBatches = async (params, totalPages, batchSize) => { /* igual à anterior */ };

// A lógica do gap analisando campos por empresa
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
      return res.status(400).json({ message: "Por favor, forneça um filtro primário (Estado ou CNPJ) para iniciar a busca." });
    }
    const primaryFilters = { uf, cnpj };
    const cacheKey = `gap-${JSON.stringify(primaryFilters)}`;
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

    const dadosRelevantes = dadosPrimarios;

    let dadosFiltrados = dadosRelevantes;
    if (ano && ano !== "todos") dadosFiltrados = dadosFiltrados.filter(item => item.ano == ano);
    if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos")
      dadosFiltrados = dadosFiltrados.filter(item => item.descricaoBeneficioFiscal === descricaoBeneficioFiscal);

    const analisePorEmpresa = {};
    dadosFiltrados.forEach(item => {
      const id = item.cnpj;
      if (!analisePorEmpresa[id]) {
        analisePorEmpresa[id] = {
          cnpj: item.cnpj,
          razaoSocial: item.razaoSocial,
          uf: item.uf,
          totalCultura: 0,
          totalEsporte: 0,
          totalInfancia: 0,
          totalIdoso: 0,
        };
      }
      const descricao = item.descricaoBeneficioFiscal?.toLowerCase() || "";
      if (descricao.includes("cultura") || descricao.includes("rouanet") || descricao.includes("audiovisual"))
        analisePorEmpresa[id].totalCultura += item.valorRenunciado;
      else if (descricao.includes("esporte") || descricao.includes("desporto"))
        analisePorEmpresa[id].totalEsporte += item.valorRenunciado;
      else if (descricao.includes("criança") || descricao.includes("adolescente"))
        analisePorEmpresa[id].totalInfancia += item.valorRenunciado;
      else if (descricao.includes("idoso"))
        analisePorEmpresa[id].totalIdoso += item.valorRenunciado;
    });

    const resultadosFinais = Object.values(analisePorEmpresa).map(empresa => {
      const baseIrDevido = Math.max(
        empresa.totalCultura / 0.04,
        empresa.totalEsporte / 0.02,
        empresa.totalInfancia / 0.01,
        empresa.totalIdoso / 0.01,
        0
      );
      const potencialCultura = baseIrDevido * 0.04;
      const potencialEsporte = baseIrDevido * 0.02;
      const potencialInfancia = baseIrDevido * 0.01;
      const potencialIdoso = baseIrDevido * 0.01;
      const gapCultura = Math.max(0, potencialCultura - empresa.totalCultura);
      const gapEsporte = Math.max(0, potencialEsporte - empresa.totalEsporte);
      const gapInfancia = Math.max(0, potencialInfancia - empresa.totalInfancia);
      const gapIdoso = Math.max(0, potencialIdoso - empresa.totalIdoso);
      return {
        ...empresa,
        gapTotal: gapCultura + gapEsporte + gapInfancia + gapIdoso
      };
    }).sort((a, b) => b.gapTotal - a.gapTotal);

    const numeroDeEmpresas = resultadosFinais.length;
    const valorTotalInvestido = dadosFiltrados.reduce((acc, item) => acc + item.valorRenunciado, 0);
    const gapTotalGeral = resultadosFinais.reduce((acc, item) => acc + item.gapTotal, 0);

    res.status(200).json({
      estatisticas: { numeroDeEmpresas, valorTotalInvestido, gapTotalGeral },
      resultados: resultadosFinais,
      anosDisponiveis: [...new Set(dadosRelevantes.map(item => item.ano))].sort((a, b) => b - a),
      beneficiosDisponiveis: [...new Set(dadosRelevantes.map(item => item.descricaoBeneficioFiscal))].sort()
    });
  } catch (error) {
    res.status(500).json({ message: "Ocorreu um erro no servidor.", details: error.message });
  }
}
