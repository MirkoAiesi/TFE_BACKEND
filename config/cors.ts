import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
  headers: ['Content-Type', 'Authorization'], // Spécifiez les headers autorisés
  exposeHeaders: ['Content-Length', 'ETag'],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
