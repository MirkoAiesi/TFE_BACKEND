import path from 'node:path'
import url from 'node:url'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const dirName = dirname(fileURLToPath(import.meta.url))
// ---

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../',
  title: 'Learning',
  version: '1.0.0',
  tagIndex: 2,
  snakeCase: true,
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT', // if PUT/PATCH are provided for the same route, prefer PUT
  common: {
    parameters: {}, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI conform headers that are commonly used
  },
  controllerPathGlobs: [
    `${dirName}/app/controllers/*_controller.js`, // Modèle de chemin pour les contrôleurs AdonisJS
  ],
  persistAuthorization: true, // persist authorization between reloads on the swagger page
  showFullPath: false, // the path displayed after endpoint summary
}
