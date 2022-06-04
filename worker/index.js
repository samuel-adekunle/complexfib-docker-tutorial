const keys = require("./keys")
const redis = require("redis")

const redisClient = redis.createClient({
    socket: {
        port: keys.redisPort,
        host: keys.redisHost,
        reconnectStrategy: () => 1000
    }
})

const redisSubscriber = redisClient.duplicate()

const fib = (index) => {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2)
}

(async function main() {
    await redisClient.connect()
    await redisSubscriber.connect()

    await redisSubscriber.subscribe("insert", (message) => {
        redisClient.hSet("values", message, fib(parseInt(message)))
    })
})()



