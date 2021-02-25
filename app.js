const express = require('express');
const path = require('path');
const pg = require('pg');
const config = {
    user: 'postgres', // name of the user account
    database: 'project_db', // name of the database
    password: 'admin',
    port: 5432,
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000
}

const pool = new pg.Pool(config);

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.get('/todo', function (req, res){
    pool.connect((err, client, done) => {
        if (err) throw err
        client.query('select * from todo;', [], (err, result) => {
            done()
            if (err) {
                res.status(400).send(err);
                console.log(err.stack);
            } else {
                let rows = result.rows;
                console.log(rows);
                res.status(200).json(rows);
            }
        });
    });
});

app.post('/', function (req, res){
    if (!req.body) return res.sendStatus(400);

    pool.connect((err, client, done) => {
        if (err) throw err
        client.query('insert into todo (description) values ($1::varchar);', [req.body.description], (err, result) => {
            done();
            if (err) {
                res.status(400).send(err);
                console.log(err.stack)
            } else {
                res.send(req.body.description);
            }
        });
    });
});

app.delete("/", function (req, res){
    if (!req.body) return res.sendStatus(400);

    pool.connect((err, client, done) => {
        if (err) throw  err;
        client.query('delete from todo where id=$1::int',
            [req.body.id], (err, result) => {
                done();
                if (err) {
                    res.status(400).send(err);
                    console.log(err.stack);
                } else {
                    res.status(200).send();
                }
            });
    });
});

app.listen(5000,  (err) => {
    return console.log("Start", err);
});