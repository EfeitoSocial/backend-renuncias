import supabase from '../lib/supabase.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST" && req.query.login === "1") {
  // Autentica o usuário comum (não admin)
  const { email, senha } = req.body;
  const { data: usuarios, error } = await supabase
    .from("usuario")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (error || !usuarios || usuarios.length === 0)
    return res.status(401).json({ error: "Usuário ou senha inválidos" });
  
  const user = usuarios[0];
  const ok = await bcrypt.compare(senha, user.senha);
  if (!ok) return res.status(401).json({ error: "Usuário ou senha inválidos" });

  // gerar JWT só com role 'user'
  const token = jwt.sign({ userId: user.id, role: "user" }, process.env.JWTSECRET);
  return res.status(200).json({ token });
}


  // Somente admin autorizado pode modificar usuarios
  let adminId = null;
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWTSECRET);
      if (decoded.role === "admin") adminId = decoded.adminId;
    }
  } catch { }

  try {
    if (req.method === "GET") {
      // Lista todos os usuarios
      const { data, error } = await supabase.from('usuario').select();
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ data });
    }

    if (req.method === "POST") {
      if (!adminId) return res.status(401).json({ error: "Só admin cria usuário" });
      const { razaosocial, cnpj, email, senha } = req.body;
      const senhaHash = await bcrypt.hash(senha, 10);
      const { error } = await supabase
        .from('usuario')
        .insert({ razaosocial, cnpj, email, senha: senhaHash, criado_por: adminId });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json({ ok: true });
    }

    if (req.method === "PUT") {
      if (!adminId) return res.status(401).json({ error: "Só admin edita usuário" });
      const { id } = req.query;
      const { razaosocial, cnpj, email, senha } = req.body;
      let updateFields = { razaosocial, cnpj, email };
      if (senha) updateFields.senha = await bcrypt.hash(senha, 10);
      const { error } = await supabase
        .from('usuario').update(updateFields).eq('id', id);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      if (!adminId) return res.status(401).json({ error: "Só admin exclui usuário" });
      const { id } = req.query;
      const { error } = await supabase.from('usuario').delete().eq('id', id);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro inesperado" });
  }
}
