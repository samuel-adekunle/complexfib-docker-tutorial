const keys = require("./keys")
const redis = require("redis")

const client = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000 // retry every second
})

const sub = client.duplicate()

const fib = (index) => {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2)
}

sub.on("message", (channel, message) => {
    client.hSet("values", message, fib(parseInt(message)))
})