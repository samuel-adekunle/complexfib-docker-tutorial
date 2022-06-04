const keys = require("./keys")

// Express App Setup
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Postgres Database Setup
const {Pool} = require("pg")
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
})

pgClient.on("connect", (client) => {
    client
        .query("CREATE TABLE IF NOT EXISTS values (number INT)")
        .catch((err) => console.error(err));
});

// Redis Client Setup
const redis = require("redis")
const redisClient = redis.createClient({
    url: `redis://${keys.redisHost}:${keys.redisPort}`,
    socket: {
        reconnectStrategy: () => 1000
    }
})

const redisPublisher = redisClient.duplicate()

// Route Handlers

app.get("/", (req, res) => {
    res.send("Server is up and healthy!. Try making requests to '/values' endpoints.")
})

app.get("/values/all", async (req, res) => {
    const values = await pgClient.query("SELECT * from values")
    res.send(values.rows)
})

app.get("/values/current", async (req, res) => {
    const values = await redisClient.hGetAll("values")
    res.send(values)
})

app.post("/values", async (req, res) => {
    const index = parseInt(req.body.index)

    if (index > 40) {
        return res.status(422).send("Index over 40 is too high.")
    }

    redisClient.hSet('values', index, "TODO(worker): Populate this field.")
    redisPublisher.publish("insert", index)

    pgClient.query("INSERT INTO values(number) VALUES($1)", [index])

    res.send({working: true})
})

app.listen(5000, () => {
    console.log("Listening on 0.0.0.0:5000")
})