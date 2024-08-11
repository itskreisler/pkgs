import { glob } from 'glob'

async function loadFiles (dirName: string): Promise<string[]> {
  // usalo si usas la version glob@10.2.2
  // const Files = await glob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/*.{cjs,js,json}`)
  const files = await glob(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/!(*.test*).{cjs,js,ts,json}`)
  console.log(`${process.cwd().replace(/\\/g, '/')}/${dirName}/**/!(*.test*).{cjs,js,json}`)
  /* files.forEach((file) => {
    Reflect.deleteProperty(require.cache, require.resolve(file))
  })
  */
  return files
}
export { loadFiles }
