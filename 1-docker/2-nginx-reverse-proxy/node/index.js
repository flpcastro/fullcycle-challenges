const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

const config = {
  host: 'mysql',
  user: 'root',
  password: 'root',
  database: 'fullcycle'
};

let connection;

const connectWithRetry = () => {
  connection = mysql.createConnection(config);

  connection.connect(err => {
    if (err) {
      console.error('Error connecting to database:', err);
      setTimeout(connectWithRetry, 5000); // Tenta conectar novamente após 5 segundos
    } else {
      console.log('Connected to MySQL');
      const createTable = `CREATE TABLE IF NOT EXISTS people (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )`;
      connection.query(createTable, (err, results, fields) => {
        if (err) throw err;
        console.log('Table people created or exists already');
      });
    }
  });

  connection.on('error', function (err) {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connectWithRetry();
    } else {
      throw err;
    }
  });
};

connectWithRetry();

app.get('/', (req, res) => {
  connection.query('SELECT name FROM people', (err, results, fields) => {
    if (err) throw err;
    let response = '<h1>Full Cycle Rocks!</h1>';
    response += '<ul>';
    results.forEach(person => {
      response += `<li>${person.name}</li>`;
    });
    response += '</ul>';
    res.send(response);
  });
});

app.get('/add/:name', (req, res) => {
  const name = req.params.name;
  const insert = `INSERT INTO people(name) values(?)`;
  connection.query(insert, [name], (err, results, fields) => {
    if (err) throw err;
    res.send(`<h1>Added ${name} to database!</h1>`);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});