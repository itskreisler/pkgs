import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'dist', 'package.json')

const pkg = {
  name: 'app',
  version: '1.0.0',
  description: '',
  main: 'index.js',
  keywords: [],
  author: '',
  license: 'ISC'
}
// Crear el archivo si no existe
fs.writeFileSync(filePath,
  JSON.stringify(pkg, null, 2)
)
console.log(`Archivo creado en: ${filePath}`)
