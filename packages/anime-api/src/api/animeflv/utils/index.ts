import cloudscraper from 'cloudscraper'
// import imageToBase64 from 'image-to-base64'

const MergeRecursive = (obj1: any, obj2: any) => {
  for (const p in obj2) {
    try {
      // Property in destination object set; update its value.
      if (obj2[p].constructor === Object) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p])
      } else {
        obj1[p] = obj2[p]
      }
    } catch (e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p]
    }
  }
  return obj1
}

const imageUrlToBase64 = async(uri: string) => {
  const res = await cloudscraper({
    uri,
    method: 'GET',
    encoding: null
  })

  return Buffer.from(res).toString('base64')
}
const poster64 = (poster: string) => 'data:image/png;base64,'.concat(poster)

const urlify = async(text: string) => {
  const urlRegex = /[>]*(https?:\/\/[^\s"]+)/g // /(https?:\/\/[^\s]+)/g
  return await Promise.all(text.match(urlRegex) ?? [])
}

export {
  MergeRecursive,
  imageUrlToBase64,
  poster64,
  urlify
}
