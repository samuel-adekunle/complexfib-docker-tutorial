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
const postgresClient = new Pool({
    user: keys.postgresUser,
    host: keys.postgresHost,
    database: keys.postgresDatabase,
    password: keys.postgresPassword,
    port: keys.postgresPort
})

postgresClient.on("connect", (client) => {
    client
        .query("CREATE TABLE IF NOT EXISTS values (number INT)")
        .catch((err) => console.error(err));
});

// Redis Client Setup
const redis = require("redis")

const redisClient = redis.createClient({
    socket: {
        port: keys.redisPort, host: keys.redisHost, reconnectStrategy: () => 1000
    }
})

const redisPublisher = redisClient.duplicate()

// Route Handlers

app.get("/", (req, res) => {
    res.send("Server is up and healthy!. Try making requests to '/values' endpoints.")
})

app.get("/values/all", async (req, res) => {
    const values = await postgresClient.query("SELECT * from values")
    res.send(values.rows)
})

app.get("/values/current", async (req, res) => {
    const values = await redisClient.hGetAll("values")
    res.send(values)
})

app.post("/values", async (req, res) => {
    const index = req.body.index

    if (parseInt(index) > 40) {
        return res.status(422).send("Index over 40 is too high.")
    }

    await redisClient.hSet("values", index, "TODO(worker): Populate this field.")
    await redisPublisher.publish("insert", index)

    postgresClient.query("INSERT INTO values(number) VALUES($1)", [index])

    res.send({working: true})
})

app.listen(keys.port, async () => {
    await redisClient.connect()
    await redisPublisher.connect()
    console.log(`Listening on 0.0.0.0:${keys.port}`)
})