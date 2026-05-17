import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const transactionsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        summary: 'Listar transações',
        tags: ['Transactions'],
      },
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions }
    },
  )

  app.get(
    '/:id',
    {
      schema: {
        summary: 'Obter transação por ID',
        tags: ['Transactions'],
        params: z.object({
          id: z.string().uuid(),
        }),
      },
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { id } = request.params

      const { sessionId } = request.cookies

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return {
        transaction,
      }
    },
  )

  app.get(
    '/summary',
    {
      schema: {
        summary: 'Obter resumo (saldo)',
        tags: ['Transactions'],
      },
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  app.post(
    '/',
    {
      schema: {
        summary: 'Criar transação',
        tags: ['Transactions'],
        body: z.object({
          title: z.string(),
          amount: z.number(),
          type: z.enum(['credit', 'debit']),
        }),
      },
    },
    async (request, reply) => {
      const { title, amount, type } = request.body

      let sessionId = request.cookies.sessionId

      if (!sessionId) {
        sessionId = randomUUID()

        reply.setCookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })
      }

      const transactionId = randomUUID()

      await knex('transactions').insert({
        id: transactionId,
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })

      return reply.status(201).send({ id: transactionId })
    },
  )
}
