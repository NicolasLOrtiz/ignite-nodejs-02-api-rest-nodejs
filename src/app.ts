import cookie from '@fastify/cookie'
import fastifySwagger from '@fastify/swagger'
import scalar from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { transactionsRoutes } from './routes/transactions'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(cookie)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Ignite Node.js API REST',
      description: 'Documentação da API de transações',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(scalar, {
  routePrefix: '/docs',
})

app.register(transactionsRoutes, {
  prefix: 'transactions',
})
