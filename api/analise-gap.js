// // // // // Estrutura igual ao anterior para dependências:
// // // // import fetch from "node-fetch";
// // // // import NodeCache from "node-cache";

// // // // const myCache = new NodeCache({ stdTTL: 3600 });

// // // // const fetchPage = async (params, page) => { /* igual à anterior */ };
// // // // const fetchInBatches = async (params, totalPages, batchSize) => { /* igual à anterior */ };

// // // // // A lógica do gap analisando campos por empresa
// // // // export default async function handler(req, res) {
// // // //   res.setHeader("Access-Control-Allow-Origin", "https://consulta-beneficios-fiscais.vercel.app");
// // // //   res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
// // // //   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
// // // //   // Permitir resposta rápida para preflight (OPTIONS)
// // // //   if (req.method === "OPTIONS") {
// // // //     res.status(200).end();
// // // //     return;
// // // //   }
// // // //   try {
// // // //     const { ano = "todos", uf = "", cnpj = "", descricaoBeneficioFiscal = "todos" } = req.query;
// // // //     if (!uf && !cnpj) {
// // // //       return res.status(400).json({ message: "Por favor, forneça um filtro primário (Estado ou CNPJ) para iniciar a busca." });
// // // //     }
// // // //     const primaryFilters = { uf, cnpj };
// // // //     const cacheKey = `gap-${JSON.stringify(primaryFilters)}`;
// // // //     let dadosPrimarios;

// // // //     if (myCache.has(cacheKey)) {
// // // //       dadosPrimarios = myCache.get(cacheKey);
// // // //     } else {
// // // //       const paramsApiExterna = {};
// // // //       if (uf) paramsApiExterna.nomeSiglaUF = uf;
// // // //       if (cnpj) paramsApiExterna.cnpj = cnpj;
// // // //       const MAX_PAGES_TO_FETCH = 2000;
// // // //       const BATCH_SIZE = 20;
// // // //       const allData = await fetchInBatches(paramsApiExterna, MAX_PAGES_TO_FETCH, BATCH_SIZE);
// // // //       myCache.set(cacheKey, allData);
// // // //       dadosPrimarios = allData;
// // // //     }

// // // //     const dadosRelevantes = dadosPrimarios;

// // // //     let dadosFiltrados = dadosRelevantes;
// // // //     if (ano && ano !== "todos") dadosFiltrados = dadosFiltrados.filter(item => item.ano == ano);
// // // //     if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos")
// // // //       dadosFiltrados = dadosFiltrados.filter(item => item.descricaoBeneficioFiscal === descricaoBeneficioFiscal);

// // // //     const analisePorEmpresa = {};
// // // //     dadosFiltrados.forEach(item => {
// // // //       const id = item.cnpj;
// // // //       if (!analisePorEmpresa[id]) {
// // // //         analisePorEmpresa[id] = {
// // // //           cnpj: item.cnpj,
// // // //           razaoSocial: item.razaoSocial,
// // // //           uf: item.uf,
// // // //           totalCultura: 0,
// // // //           totalEsporte: 0,
// // // //           totalInfancia: 0,
// // // //           totalIdoso: 0,
// // // //         };
// // // //       }
// // // //       const descricao = item.descricaoBeneficioFiscal?.toLowerCase() || "";
// // // //       if (descricao.includes("cultura") || descricao.includes("rouanet") || descricao.includes("audiovisual"))
// // // //         analisePorEmpresa[id].totalCultura += item.valorRenunciado;
// // // //       else if (descricao.includes("esporte") || descricao.includes("desporto"))
// // // //         analisePorEmpresa[id].totalEsporte += item.valorRenunciado;
// // // //       else if (descricao.includes("criança") || descricao.includes("adolescente"))
// // // //         analisePorEmpresa[id].totalInfancia += item.valorRenunciado;
// // // //       else if (descricao.includes("idoso"))
// // // //         analisePorEmpresa[id].totalIdoso += item.valorRenunciado;
// // // //     });

// // // //     const resultadosFinais = Object.values(analisePorEmpresa).map(empresa => {
// // // //       const baseIrDevido = Math.max(
// // // //         empresa.totalCultura / 0.04,
// // // //         empresa.totalEsporte / 0.02,
// // // //         empresa.totalInfancia / 0.01,
// // // //         empresa.totalIdoso / 0.01,
// // // //         0
// // // //       );
// // // //       const potencialCultura = baseIrDevido * 0.04;
// // // //       const potencialEsporte = baseIrDevido * 0.02;
// // // //       const potencialInfancia = baseIrDevido * 0.01;
// // // //       const potencialIdoso = baseIrDevido * 0.01;
// // // //       const gapCultura = Math.max(0, potencialCultura - empresa.totalCultura);
// // // //       const gapEsporte = Math.max(0, potencialEsporte - empresa.totalEsporte);
// // // //       const gapInfancia = Math.max(0, potencialInfancia - empresa.totalInfancia);
// // // //       const gapIdoso = Math.max(0, potencialIdoso - empresa.totalIdoso);
// // // //       return {
// // // //         ...empresa,
// // // //         gapTotal: gapCultura + gapEsporte + gapInfancia + gapIdoso
// // // //       };
// // // //     }).sort((a, b) => b.gapTotal - a.gapTotal);

// // // //     const numeroDeEmpresas = resultadosFinais.length;
// // // //     const valorTotalInvestido = dadosFiltrados.reduce((acc, item) => acc + item.valorRenunciado, 0);
// // // //     const gapTotalGeral = resultadosFinais.reduce((acc, item) => acc + item.gapTotal, 0);

// // // //     res.status(200).json({
// // // //       estatisticas: { numeroDeEmpresas, valorTotalInvestido, gapTotalGeral },
// // // //       resultados: resultadosFinais,
// // // //       anosDisponiveis: [...new Set(dadosRelevantes.map(item => item.ano))].sort((a, b) => b - a),
// // // //       beneficiosDisponiveis: [...new Set(dadosRelevantes.map(item => item.descricaoBeneficioFiscal))].sort()
// // // //     });
// // // //   } catch (error) {
// // // //     res.status(500).json({ message: "Ocorreu um erro no servidor.", details: error.message });
// // // //   }
// // // // }

// // // // api/analise-gap.js
// // // import { fetchDataFromLocalAPI } from "../lib/fetchDataFromLocalAPI.js";
// // // import cache from "../lib/cache.js";

// // // /**
// // //  * Handler serverless para /api/analise-gap
// // //  */
// // // export default async function handler(req, res) {
// // //   res.setHeader("Access-Control-Allow-Origin", "*");
// // //   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
// // //   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
// // //   if (req.method === "OPTIONS") return res.status(204).end();

// // //   try {
// // //     const { ano, uf, cnpj, descricaoBeneficioFiscal } = (req.query || req.url?.includes("?")) ? req.query : req.body || {};

// // //     if (!uf && !cnpj) {
// // //       return res.status(400).json({ message: "Por favor, forneça um filtro primário (Estado ou CNPJ) para iniciar a busca." });
// // //     }

// // //     const primaryFilters = { uf: uf || null, cnpj: cnpj || null };
// // //     const cacheKey = `gap-${JSON.stringify(primaryFilters)}`;

// // //     let dadosPrimarios;
// // //     if (cache.has(cacheKey)) {
// // //       console.log("[analise-gap] usando cache:", cacheKey);
// // //       dadosPrimarios = cache.get(cacheKey);
// // //     } else {
// // //       console.log("[analise-gap] buscando API remota...");
// // //       dadosPrimarios = await fetchDataFromLocalAPI({ uf, cnpj });
// // //       cache.set(cacheKey, dadosPrimarios);
// // //     }

// // //     const anosDisponiveis = [...new Set(dadosPrimarios.map(item => item.ano))].sort((a, b) => b - a);
// // //     const beneficiosDisponiveis = [...new Set(dadosPrimarios.map(item => item.descricaoBeneficioFiscal))].sort();

// // //     let dadosFiltrados = dadosPrimarios;
// // //     if (ano && ano !== "todos") dadosFiltrados = dadosFiltrados.filter(item => item.ano == ano);
// // //     if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos") {
// // //       dadosFiltrados = dadosFiltrados.filter(item => item.descricaoBeneficioFiscal === descricaoBeneficioFiscal);
// // //     }

// // //     // Lógica de agregação por empresa (mesma do seu index.js)
// // //     const analisePorEmpresa = {};
// // //     dadosFiltrados.forEach(item => {
// // //       const id = item.cnpj;
// // //       if (!analisePorEmpresa[id]) {
// // //         analisePorEmpresa[id] = {
// // //           cnpj: item.cnpj,
// // //           razaoSocial: item.razaoSocial,
// // //           uf: item.uf,
// // //           totalCultura: 0, totalEsporte: 0, totalInfancia: 0, totalIdoso: 0,
// // //         };
// // //       }

// // //       const descricao = (item.descricaoBeneficioFiscal || "").toLowerCase();
// // //       if (descricao.includes('cultura') || descricao.includes('rouanet') || descricao.includes('audiovisual')) {
// // //         analisePorEmpresa[id].totalCultura += Number(item.valorRenunciado || 0);
// // //       } else if (descricao.includes('esporte') || descricao.includes('desporto')) {
// // //         analisePorEmpresa[id].totalEsporte += Number(item.valorRenunciado || 0);
// // //       } else if (descricao.includes('criança') || descricao.includes('adolescente')) {
// // //         analisePorEmpresa[id].totalInfancia += Number(item.valorRenunciado || 0);
// // //       } else if (descricao.includes('idoso')) {
// // //         analisePorEmpresa[id].totalIdoso += Number(item.valorRenunciado || 0);
// // //       }
// // //     });

// // //     const resultadosFinais = Object.values(analisePorEmpresa).map(empresa => {
// // //       const baseIrDevido = Math.max(
// // //         empresa.totalCultura / 0.04,
// // //         empresa.totalEsporte / 0.02,
// // //         empresa.totalInfancia / 0.01,
// // //         empresa.totalIdoso / 0.01,
// // //         0
// // //       );
// // //       const potencialCultura = baseIrDevido * 0.04;
// // //       const potencialEsporte = baseIrDevido * 0.02;
// // //       const potencialInfancia = baseIrDevido * 0.01;
// // //       const potencialIdoso = baseIrDevido * 0.01;
// // //       const gapCultura = Math.max(0, potencialCultura - empresa.totalCultura);
// // //       const gapEsporte = Math.max(0, potencialEsporte - empresa.totalEsporte);
// // //       const gapInfancia = Math.max(0, potencialInfancia - empresa.totalInfancia);
// // //       const gapIdoso = Math.max(0, potencialIdoso - empresa.totalIdoso);

// // //       return { ...empresa, gapTotal: gapCultura + gapEsporte + gapInfancia + gapIdoso };
// // //     }).sort((a, b) => b.gapTotal - a.gapTotal);

// // //     const numeroDeEmpresas = resultadosFinais.length;
// // //     const valorTotalInvestido = dadosFiltrados.reduce((acc, item) => acc + Number(item.valorRenunciado || 0), 0);
// // //     const gapTotalGeral = resultadosFinais.reduce((acc, item) => acc + Number(item.gapTotal || 0), 0);

// // //     return res.status(200).json({
// // //       estatisticas: { numeroDeEmpresas, valorTotalInvestido, gapTotalGeral },
// // //       resultados: resultadosFinais,
// // //       anosDisponiveis, beneficiosDisponiveis,
// // //     });
// // //   } catch (error) {
// // //     console.error("[analise-gap] Erro:", error);
// // //     return res.status(500).json({ message: "Ocorreu um erro no servidor.", details: error?.message });
// // //   }
// // // }


// // =====================CODIGO ABAIXO FUNCIONAL=========================

// // import { fetchDataFromLocalAPI } from "../lib/fetchDataFromLocalAPI.js";
// // import cache from "../lib/cache.js";

// // /**
// //  * Handler serverless para /api/analise-gap
// //  */
// // export default async function handler(req, res) {
// //   res.setHeader("Access-Control-Allow-Origin", "*");
// //   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
// //   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
// //   if (req.method === "OPTIONS") return res.status(204).end();

// //   try {
// //     const { ano, uf, cnpj, descricaoBeneficioFiscal } = (req.query || req.url?.includes("?")) ? req.query : req.body || {};

// //     if (!uf && !cnpj) {
// //       return res.status(400).json({ message: "Por favor, forneça um filtro primário (Estado ou CNPJ) para iniciar a busca." });
// //     }

// //     const primaryFilters = { uf: uf || null, cnpj: cnpj || null };
// //     const cacheKey = `gap-${JSON.stringify(primaryFilters)}`;

// //     let dadosPrimarios;
// //     if (cache.has(cacheKey)) {
// //       console.log("[analise-gap] usando cache:", cacheKey);
// //       dadosPrimarios = cache.get(cacheKey);
// //     } else {
// //       console.log("[analise-gap] buscando API remota...");
// //       dadosPrimarios = await fetchDataFromLocalAPI({ uf, cnpj });
// //       cache.set(cacheKey, dadosPrimarios);
// //     }

// //     const anosDisponiveis = [...new Set(dadosPrimarios.map(item => item.ano))].sort((a, b) => b - a);
// //     const beneficiosDisponiveis = [...new Set(dadosPrimarios.map(item => item.descricaoBeneficioFiscal))].sort();

// //     let dadosFiltrados = dadosPrimarios;
// //     if (ano && ano !== "todos") dadosFiltrados = dadosFiltrados.filter(item => item.ano == ano);
// //     if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos") {
// //       dadosFiltrados = dadosFiltrados.filter(item => item.descricaoBeneficioFiscal === descricaoBeneficioFiscal);
// //     }

// //     const analisePorEmpresa = {};
// //     dadosFiltrados.forEach(item => {
// //       const id = item.cnpj;
// //       if (!analisePorEmpresa[id]) {
// //         analisePorEmpresa[id] = {
// //           cnpj: item.cnpj,
// //           razaoSocial: item.razaoSocial,
// //           uf: item.uf,
// //           totalCultura: 0, totalEsporte: 0, totalInfancia: 0, totalIdoso: 0,
// //         };
// //       }

// //       const descricao = (item.descricaoBeneficioFiscal || "").toLowerCase();
// //       if (descricao.includes('cultura') || descricao.includes('rouanet') || descricao.includes('audiovisual')) {
// //         analisePorEmpresa[id].totalCultura += Number(item.valorRenunciado || 0);
// //       } else if (descricao.includes('esporte') || descricao.includes('desporto')) {
// //         analisePorEmpresa[id].totalEsporte += Number(item.valorRenunciado || 0);
// //       } else if (descricao.includes('criança') || descricao.includes('adolescente')) {
// //         analisePorEmpresa[id].totalInfancia += Number(item.valorRenunciado || 0);
// //       } else if (descricao.includes('idoso')) {
// //         analisePorEmpresa[id].totalIdoso += Number(item.valorRenunciado || 0);
// //       }
// //     });

// //     const resultadosFinais = Object.values(analisePorEmpresa).map(empresa => {
// //       // Calcula uma base potencial de imposto para cada tipo de doação.
// //       // O limite de 4% para cultura e 2% para esporte se aplica a doações individuais,
// //       // mas a Receita Federal os trata como um teto.
// //       // A lógica abaixo assume que a maior doação de uma categoria indica a base de cálculo.
// //       const baseIrEstimadaCultura = empresa.totalCultura > 0 ? empresa.totalCultura / 0.04 : 0;
// //       const baseIrEstimadaEsporte = empresa.totalEsporte > 0 ? empresa.totalEsporte / 0.02 : 0;
// //       const baseIrEstimadaInfancia = empresa.totalInfancia > 0 ? empresa.totalInfancia / 0.01 : 0;
// //       const baseIrEstimadaIdoso = empresa.totalIdoso > 0 ? empresa.totalIdoso / 0.01 : 0;

// //       // A base de IRPJ mais conservadora é a maior entre as bases estimadas,
// //       // pois uma empresa poderia estar no limite de apenas uma categoria.
// //       const baseIrDevido = Math.max(
// //         baseIrEstimadaCultura,
// //         baseIrEstimadaEsporte,
// //         baseIrEstimadaInfancia,
// //         baseIrEstimadaIdoso
// //       );

// //       // Agora, calculamos o potencial máximo de doação para cada categoria
// //       // com base no IRPJ devido e subtraímos o que já foi doado para encontrar o 'gap'.
// //       const potencialCultura = Math.min(baseIrDevido * 0.04, empresa.totalCultura + (baseIrDevido * 0.04 - empresa.totalCultura));
// //       const potencialEsporte = Math.min(baseIrDevido * 0.02, empresa.totalEsporte + (baseIrDevido * 0.02 - empresa.totalEsporte));
// //       const potencialInfancia = Math.min(baseIrDevido * 0.01, empresa.totalInfancia + (baseIrDevido * 0.01 - empresa.totalInfancia));
// //       const potencialIdoso = Math.min(baseIrDevido * 0.01, empresa.totalIdoso + (baseIrDevido * 0.01 - empresa.totalIdoso));
      
// //       const gapCultura = Math.max(0, potencialCultura - empresa.totalCultura);
// //       const gapEsporte = Math.max(0, potencialEsporte - empresa.totalEsporte);
// //       const gapInfancia = Math.max(0, potencialInfancia - empresa.totalInfancia);
// //       const gapIdoso = Math.max(0, potencialIdoso - empresa.totalIdoso);

// //       return {
// //         ...empresa,
// //         gapCultura,
// //         gapEsporte,
// //         gapInfancia,
// //         gapIdoso,
// //         gapTotal: gapCultura + gapEsporte + gapInfancia + gapIdoso,
// //       };
// //     }).sort((a, b) => b.gapTotal - a.gapTotal);

// //     const numeroDeEmpresas = resultadosFinais.length;
// //     const valorTotalInvestido = dadosFiltrados.reduce((acc, item) => acc + Number(item.valorRenunciado || 0), 0);
// //     const gapTotalGeral = resultadosFinais.reduce((acc, item) => acc + Number(item.gapTotal || 0), 0);

// //     return res.status(200).json({
// //       estatisticas: { numeroDeEmpresas, valorTotalInvestido, gapTotalGeral },
// //       resultados: resultadosFinais,
// //       anosDisponiveis, beneficiosDisponiveis,
// //     });
// //   } catch (error) {
// //     console.error("[analise-gap] Erro:", error);
// //     return res.status(500).json({ message: "Ocorreu um erro no servidor.", details: error?.message });
// //   }
// // }
// // ========================CODIGO ACIMA FUNCIONAL=====================

// import { fetchDataFromLocalAPI } from "../lib/fetchDataFromLocalAPI.js";
// import cache from "../lib/cache.js";

// /**
//  * Handler serverless para /api/analise-gap (com PRONAS e PRONON)
//  */
// export default async function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   if (req.method === "OPTIONS") return res.status(204).end();
//   try {
//     const { ano, uf, cnpj, descricaoBeneficioFiscal } = (req.query || req.url?.includes("?")) ? req.query : req.body || {};

//     if (!uf && !cnpj) {
//       return res.status(400).json({ message: "Por favor, forneça um filtro primário (Estado ou CNPJ) para iniciar a busca." });
//     }

//     const primaryFilters = { uf: uf || null, cnpj: cnpj || null };
//     const cacheKey = `gap-${JSON.stringify(primaryFilters)}`;
//     let dadosPrimarios;

//     if (cache.has(cacheKey)) {
//       dadosPrimarios = cache.get(cacheKey);
//     } else {
//       dadosPrimarios = await fetchDataFromLocalAPI({ uf, cnpj });
//       cache.set(cacheKey, dadosPrimarios);
//     }

//     const anosDisponiveis = [...new Set(dadosPrimarios.map(item => item.ano))].sort((a, b) => b - a);
//     const beneficiosDisponiveis = [...new Set(dadosPrimarios.map(item => item.descricaoBeneficioFiscal))].sort();

//     let dadosFiltrados = dadosPrimarios;
//     if (ano && ano !== "todos") dadosFiltrados = dadosFiltrados.filter(item => item.ano == ano);
//     if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos") {
//       dadosFiltrados = dadosFiltrados.filter(item => item.descricaoBeneficioFiscal === descricaoBeneficioFiscal);
//     }

//     // Agregação por empresa (inclui PRONAS e PRONON)
//     const analisePorEmpresa = {};
//     dadosFiltrados.forEach(item => {
//       const id = item.cnpj;
//       if (!analisePorEmpresa[id]) {
//         analisePorEmpresa[id] = {
//           cnpj: item.cnpj,
//           razaoSocial: item.razaoSocial,
//           uf: item.uf,
//           totalCultura: 0,
//           totalEsporte: 0,
//           totalInfancia: 0,
//           totalIdoso: 0,
//           totalPronas: 0,
//           totalPronon: 0,
//         };
//       }
//       const descricao = (item.descricaoBeneficioFiscal || "").toLowerCase();
//       if (descricao.includes('cultura') || descricao.includes('rouanet') || descricao.includes('audiovisual')) {
//         analisePorEmpresa[id].totalCultura += Number(item.valorRenunciado || 0);
//       } else if (descricao.includes('esporte') || descricao.includes('desporto')) {
//         analisePorEmpresa[id].totalEsporte += Number(item.valorRenunciado || 0);
//       } else if (descricao.includes('criança') || descricao.includes('adolescente')) {
//         analisePorEmpresa[id].totalInfancia += Number(item.valorRenunciado || 0);
//       } else if (descricao.includes('idoso')) {
//         analisePorEmpresa[id].totalIdoso += Number(item.valorRenunciado || 0);
//       } else if (descricao.includes('pronas') || descricao.includes('pcd')) {
//         analisePorEmpresa[id].totalPronas += Number(item.valorRenunciado) || 0;
//       } else if (descricao.includes('pronon') || descricao.includes('oncológica')) {
//         analisePorEmpresa[id].totalPronon += Number(item.valorRenunciado) || 0;
//       }
//     });

//     const resultadosFinais = Object.values(analisePorEmpresa).map(empresa => {
//       // Estimativa da base IRPJ para cada tipo
//       const baseIrEstimadaCultura = empresa.totalCultura > 0 ? empresa.totalCultura / 0.04 : 0;
//       const baseIrEstimadaEsporte = empresa.totalEsporte > 0 ? empresa.totalEsporte / 0.02 : 0;
//       const baseIrEstimadaInfancia = empresa.totalInfancia > 0 ? empresa.totalInfancia / 0.01 : 0;
//       const baseIrEstimadaIdoso = empresa.totalIdoso > 0 ? empresa.totalIdoso / 0.01 : 0;
//       const baseIrEstimadaPronas = empresa.totalPronas > 0 ? empresa.totalPronas / 0.01 : 0;
//       const baseIrEstimadaPronon = empresa.totalPronon > 0 ? empresa.totalPronon / 0.01 : 0;
//       // Base conservadora: maior base estimada
//       const baseIrDevido = Math.max(
//         baseIrEstimadaCultura,
//         baseIrEstimadaEsporte,
//         baseIrEstimadaInfancia,
//         baseIrEstimadaIdoso,
//         baseIrEstimadaPronas,
//         baseIrEstimadaPronon,
//         0
//       );
//       // Potenciais máximos
//       const potencialCultura  = baseIrDevido * 0.04;
//       const potencialEsporte  = baseIrDevido * 0.02;
//       const potencialInfancia = baseIrDevido * 0.01;
//       const potencialIdoso    = baseIrDevido * 0.01;
//       const potencialPronas   = baseIrDevido * 0.01;
//       const potencialPronon   = baseIrDevido * 0.01;
//       // Gaps
//       const gapCultura  = Math.max(0, potencialCultura  - empresa.totalCultura);
//       const gapEsporte  = Math.max(0, potencialEsporte  - empresa.totalEsporte);
//       const gapInfancia = Math.max(0, potencialInfancia - empresa.totalInfancia);
//       const gapIdoso    = Math.max(0, potencialIdoso    - empresa.totalIdoso);
//       const gapPronas   = Math.max(0, potencialPronas   - empresa.totalPronas);
//       const gapPronon   = Math.max(0, potencialPronon   - empresa.totalPronon);
//       return {
//         ...empresa,
//         gapCultura,
//         gapEsporte,
//         gapInfancia,
//         gapIdoso,
//         gapPronas,
//         gapPronon,
//         gapTotal: gapCultura + gapEsporte + gapInfancia + gapIdoso + gapPronas + gapPronon,
//       };
//     }).sort((a, b) => b.gapTotal - a.gapTotal);

//     const numeroDeEmpresas = resultadosFinais.length;
//     const valorTotalInvestido = dadosFiltrados.reduce((acc, item) => acc + Number(item.valorRenunciado || 0), 0);
//     const gapTotalGeral = resultadosFinais.reduce((acc, item) => acc + Number(item.gapTotal || 0), 0);

//     return res.status(200).json({
//       estatisticas: { numeroDeEmpresas, valorTotalInvestido, gapTotalGeral },
//       resultados: resultadosFinais,
//       anosDisponiveis,
//       beneficiosDisponiveis,
//     });

//   } catch (error) {
//     return res.status(500).json({ message: "Ocorreu um erro no servidor.", details: error?.message });
//   }
// }


import { fetchDataFromLocalAPI } from "../lib/fetchDataFromLocalAPI.js";
import cache from "../lib/cache.js";

/**
 * Handler serverless para /api/analise-gap conforme limites da imagem (Cultura, Audiovisual, Esporte, Reciclagem, Infância, Idoso, PRONAS, PRONON)
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    // Filtros de entrada da API
    const { ano, uf, cnpj, descricaoBeneficioFiscal } = req.query || req.body || {};

    if (!uf && !cnpj) {
      return res.status(400).json({ message: "Por favor, forneça um filtro primário (Estado ou CNPJ) para iniciar a busca." });
    }

    // Cache de resultados
    const primaryFilters = { uf: uf || null, cnpj: cnpj || null };
    const cacheKey = `gap-${JSON.stringify(primaryFilters)}`;
    let dadosPrimarios;
    if (cache.has(cacheKey)) {
      dadosPrimarios = cache.get(cacheKey);
    } else {
      dadosPrimarios = await fetchDataFromLocalAPI({ uf, cnpj });
      cache.set(cacheKey, dadosPrimarios);
    }

    const anosDisponiveis = [...new Set(dadosPrimarios.map(item => item.ano))].sort((a, b) => b - a);
    const beneficiosDisponiveis = [...new Set(dadosPrimarios.map(item => item.descricaoBeneficioFiscal))].sort();

    // Aplica filtros de ano e benefício
    let dadosFiltrados = dadosPrimarios;
    if (ano && ano !== "todos") dadosFiltrados = dadosFiltrados.filter(item => item.ano == ano);
    if (descricaoBeneficioFiscal && descricaoBeneficioFiscal !== "todos") {
      dadosFiltrados = dadosFiltrados.filter(item => item.descricaoBeneficioFiscal === descricaoBeneficioFiscal);
    }

    // Agregação por empresa
    const analisePorEmpresa = {};
    dadosFiltrados.forEach(item => {
      const id = item.cnpj;
      if (!analisePorEmpresa[id]) {
        analisePorEmpresa[id] = {
          cnpj: item.cnpj,
          razaoSocial: item.razaoSocial,
          uf: item.uf,
          totalCultura: 0,
          totalAudiovisual: 0,
          totalEsporte: 0,
          totalReciclagem: 0,
          totalInfancia: 0,
          totalIdoso: 0,
          totalPronas: 0,
          totalPronon: 0,
        };
      }
      const descricao = (item.descricaoBeneficioFiscal || "").toLowerCase();

      if (descricao.includes('audiovisual')) {
        analisePorEmpresa[id].totalAudiovisual += Number(item.valorRenunciado || 0);
        analisePorEmpresa[id].totalCultura += Number(item.valorRenunciado || 0); // Audiovisual entra no limite de Cultura
      } else if (descricao.includes('cultura') || descricao.includes('rouanet')) {
        analisePorEmpresa[id].totalCultura += Number(item.valorRenunciado || 0);
      } else if (descricao.includes('esporte') || descricao.includes('desporto')) {
        analisePorEmpresa[id].totalEsporte += Number(item.valorRenunciado || 0);
      } else if (descricao.includes('reciclagem')) {
        analisePorEmpresa[id].totalReciclagem += Number(item.valorRenunciado || 0);
      } else if (descricao.includes('criança') || descricao.includes('adolescente')) {
        analisePorEmpresa[id].totalInfancia += Number(item.valorRenunciado || 0);
      } else if (descricao.includes('idoso')) {
        analisePorEmpresa[id].totalIdoso += Number(item.valorRenunciado || 0);
      } else if (descricao.includes('pronas') || descricao.includes('pcd')) {
        analisePorEmpresa[id].totalPronas += Number(item.valorRenunciado) || 0;
      } else if (descricao.includes('pronon') || descricao.includes('oncológica')) {
        analisePorEmpresa[id].totalPronon += Number(item.valorRenunciado) || 0;
      }
    });

    // Lógica do cálculo do gap
    const limites = {
      cultura: 0.04,
      audiovisual: 0.03,  // Limita 3% dentro dos 4% cultura
      esporte: 0.02,
      reciclagem: 0.01,
      infancia: 0.01,
      idoso: 0.01,
      pronas: 0.01,
      pronon: 0.01
    };

    const resultadosFinais = Object.values(analisePorEmpresa).map(empresa => {
      // Estimativas conservadoras da base IRPJ para cada categoria
      const estimativas = [
        empresa.totalCultura > 0 ? empresa.totalCultura / limites.cultura : 0,
        empresa.totalEsporte > 0 ? empresa.totalEsporte / limites.esporte : 0,
        empresa.totalReciclagem > 0 ? empresa.totalReciclagem / limites.reciclagem : 0,
        empresa.totalInfancia > 0 ? empresa.totalInfancia / limites.infancia : 0,
        empresa.totalIdoso > 0 ? empresa.totalIdoso / limites.idoso : 0,
        empresa.totalPronas > 0 ? empresa.totalPronas / limites.pronas : 0,
        empresa.totalPronon > 0 ? empresa.totalPronon / limites.pronon : 0,
      ];
      const baseIrDevido = Math.max(...estimativas, 0);

      // Potenciais máximos pelo IR devido
      const potencialCultura = baseIrDevido * limites.cultura;
      const potencialAudiovisual = baseIrDevido * limites.audiovisual;
      const potencialEsporte = baseIrDevido * limites.esporte;
      const potencialReciclagem = baseIrDevido * limites.reciclagem;
      const potencialInfancia = baseIrDevido * limites.infancia;
      const potencialIdoso = baseIrDevido * limites.idoso;
      const potencialPronas = baseIrDevido * limites.pronas;
      const potencialPronon = baseIrDevido * limites.pronon;

      // Gaps
      const gapCultura = Math.max(0, potencialCultura - empresa.totalCultura);
      const gapAudiovisual = Math.max(0, potencialAudiovisual - empresa.totalAudiovisual);
      const gapEsporte = Math.max(0, potencialEsporte - empresa.totalEsporte);
      const gapReciclagem = Math.max(0, potencialReciclagem - empresa.totalReciclagem);
      const gapInfancia = Math.max(0, potencialInfancia - empresa.totalInfancia);
      const gapIdoso = Math.max(0, potencialIdoso - empresa.totalIdoso);
      const gapPronas = Math.max(0, potencialPronas - empresa.totalPronas);
      const gapPronon = Math.max(0, potencialPronon - empresa.totalPronon);

      return {
        ...empresa,
        baseIrDevido,
        potencialCultura,
        potencialAudiovisual,
        potencialEsporte,
        potencialReciclagem,
        potencialInfancia,
        potencialIdoso,
        potencialPronas,
        potencialPronon,
        gapCultura,
        gapAudiovisual,
        gapEsporte,
        gapReciclagem,
        gapInfancia,
        gapIdoso,
        gapPronas,
        gapPronon,
        gapTotal: gapCultura + gapAudiovisual + gapEsporte + gapReciclagem + gapInfancia + gapIdoso + gapPronas + gapPronon
      };
    }).sort((a, b) => b.gapTotal - a.gapTotal);

    const numeroDeEmpresas = resultadosFinais.length;
    const valorTotalInvestido = dadosFiltrados.reduce((acc, item) => acc + Number(item.valorRenunciado || 0), 0);
    const gapTotalGeral = resultadosFinais.reduce((acc, item) => acc + Number(item.gapTotal || 0), 0);

    return res.status(200).json({
      estatisticas: { numeroDeEmpresas, valorTotalInvestido, gapTotalGeral },
      resultados: resultadosFinais,
      anosDisponiveis,
      beneficiosDisponiveis,
    });

  } catch (error) {
    return res.status(500).json({ message: "Ocorreu um erro no servidor.", details: error?.message });
  }
}
