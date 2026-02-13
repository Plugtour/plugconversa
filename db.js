// db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',          // usuário padrão do Postgres
  password: 'Pascana1980', // 🔴 TROQUE pela senha que você criou
  database: 'plugconversa',  // nome do banco que criamos no pgAdmin
});

module.exports = pool;
