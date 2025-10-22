// lib/fetchDataFromLocalAPI.js
import axios from "axios";

const DATA_API_URL = process.env.DATA_API_URL; // configure na Vercel

export async function fetchDataFromLocalAPI(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    params.set("limit", "50000"); // mantém comportamento antigo
    const url = `${DATA_API_URL}?${params.toString()}`;
    console.log(`[fetchDataFromLocalAPI] GET ${url}`);
    const response = await axios.get(url, { timeout: 30_000 });
    return response.data || [];
  } catch (err) {
    console.error("[fetchDataFromLocalAPI] Erro ao buscar dados:", err?.message || err);
    return []; // degrade gracioso como antes
  }
}
