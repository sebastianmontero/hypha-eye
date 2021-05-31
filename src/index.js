const fastify = require('fastify')
const fp = require('fastify-plugin')
const path = require('path')
const swaggerConfig = require('./swagger/config')
const Store = require('data-store')
const { Assignment, Payout, Period } = require('./model')
const { DGraph } = require('./service')

const {
  NODE_ENV,
  PORT, // has to come from env vars because its set by app services,
  DGRAPH_ENDPOINT,
  DATA_PATH,
  STORE_NAME
} = process.env

function unhandledRejectionHandler (error) {
  console.error(error)
  process.exit(1)
}

async function decorateFastifyInstance (fastify) {
  const dgraph = new DGraph({
    addr: DGRAPH_ENDPOINT
  })
  const store = new Store({
    path: path.join(DATA_PATH, STORE_NAME)
  })
  const period = new Period(dgraph)
  await period.load()
  const assignment = new Assignment({
    dgraph,
    period,
    store
  })
  const payout = new Payout(dgraph)

  fastify.decorate('assignment', assignment)
  fastify.decorate('payout', payout)
}

async function main () {
  console.log('ENV VARS:', process.env)
  // Create the instance
  const server = fastify({ logger: { prettyPrint: NODE_ENV !== 'production' }, pluginTimeout: 20000 })
  // Add application assets and manifest.json serving
  server.log.info(`cwd: ${process.cwd()}`)
  server.register(require('fastify-swagger'), swaggerConfig)
    .register(require('fastify-cors'), {
      origin: true,
      credentials: true,
      allowedHeaders: 'Authorization, Origin, X-Requested-With, Content-Type, Accept'
    })
    .register(fp(decorateFastifyInstance))
    // APIs modules
    .register(require('./controller/assignment'), { prefix: '/api/assignment' })
    .register(require('./controller/payout'), { prefix: '/api/payout' })

    // static resources
    .setErrorHandler(function (error, request, reply) {
      server.log.info(error)
      reply.send(error)
    })
  await server.ready()
  server.swagger()
  // Run the server!
  await server.listen(PORT || 3000, '0.0.0.0')
  return server
}

process.on('unhandledRejection', unhandledRejectionHandler)
main().catch(unhandledRejectionHandler)
