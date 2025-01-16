import fs from 'fs'

console.log('Hello world!')

console.dir({
  name: 'test'
}, { depth: 1 })
export type Name = string
// create a file
fs.writeFileSync('test.txt', 'Hello world!')

export default function hadler(str: Name) {
  fs.writeFileSync('hol.json',
    JSON.stringify({
      hola: 2
    })
  )
}
