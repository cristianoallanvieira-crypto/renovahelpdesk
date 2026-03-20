const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// conexão banco (Supabase)
const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// criar chamado
app.post("/chamados", async (req, res) => {
  try {
    const c = req.body;

    const result = await pool.query(
      `INSERT INTO chamados 
      (data_abertura, filial, setor, colaborador, categoria, descricao, solucao, prioridade, status, responsavel)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        c.Data_Abertura,
        c.Filial,
        c.Setor,
        c.Colaborador,
        c.Categoria,
        c.Descricao_do_Problema,
        c.Solucao,
        c.Prioridade,
        c.Status,
        c.Responsavel_TI
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao salvar");
  }
});

// listar
app.get("/chamados", async (req, res) => {
  const result = await pool.query("SELECT * FROM chamados ORDER BY id DESC");
  res.json(result.rows);
});

// atualizar
app.put("/chamados/:id", async (req, res) => {
  const { id } = req.params;
  const c = req.body;

  await pool.query(
    `UPDATE chamados 
     SET status=$1, prioridade=$2, responsavel=$3, solucao=$4 
     WHERE id=$5`,
    [c.Status, c.Prioridade, c.Responsavel_TI, c.Solucao, id]
  );

  res.send("Atualizado");
});

// deletar
app.delete("/chamados/:id", async (req, res) => {
  await pool.query("DELETE FROM chamados WHERE id=$1", [req.params.id]);
  res.send("Deletado");
});

// porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("RenovaHelpDesk rodando na porta", PORT));
