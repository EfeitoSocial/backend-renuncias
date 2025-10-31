import supabase from '../lib/supabase.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "POST") {
      const { razaosocial, cnpj, email, senha } = req.body;
      if (!email || !senha) {
        return res.status(400).json({ error: "Email e senha obrigatórios." });
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      const { data: adms } = await supabase.from('admin').select().limit(1);
      if (adms && adms.length > 0) {
        return res.status(403).json({ error: "Já existe admin cadastrado." });
      }

      const { error } = await supabase
        .from('admin')
        .insert({ razaosocial, cnpj, email, senha: senhaHash });
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json({ ok: true });
    }

    if (req.method === "GET") {
      const { email, senha } = req.query;
      if (!email || !senha) {
        return res.status(400).json({ error: "Email e senha obrigatórios." });
      }

      const { data, error } = await supabase
        .from('admin')
        .select()
        .eq('email', email)
        .single();
      if (!data) {
        return res.status(404).json({ error: "Admin não encontrado" });
      }

      const confere = await bcrypt.compare(senha, data.senha);
      if (!confere) {
        return res.status(403).json({ error: "Senha inválida" });
      }

      // Não envie várias respostas!
      const token = jwt.sign(
        { adminId: data.id, email: data.email, role: "admin" },
        process.env.JWTSECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).json({ token });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    console.error("Erro backend:", err);
    return res.status(500).json({ error: "Erro inesperado" });
  }
}
