import { app } from './app'
import { env } from './env'

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('HTTP Server Running!')
  })
