const keys = require("./keys")
const redis = require("redis")

const redisClient = redis.createClient({
    url: `redis://${keys.redisHost}:${keys.redisPort}`,
    socket: {
        reconnectStrategy: () => 1000
    }
})

const redisSubscriber = redisClient.duplicate()

const fib = (index) => {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2)
}

redisSubscriber.on("message", (channel, message) => {
    redisClient.hSet("values", message, fib(parseInt(message)))
})