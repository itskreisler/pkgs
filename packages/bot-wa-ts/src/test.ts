import { r34API, r34Tags, r34RandomPic, type R34Tags, R34Const, R34Response } from '@kreisler/bot-services'

    ; (async () => {
        const listTags = 'furina'.split(' ').map((tag) => r34Tags(tag))
        const results = await Promise.allSettled(listTags)
        console.dir(results, { depth: null })
        const tag = 'furina_(genshin_impact)'
        const limit = 10
        const pid = 0
        let res
        try {
            res = await r34API([tag], { limit, pid })
        } catch (error) {

            res = await r34API([tag], { limit, pid: 0 })
        }
        console.log({ res })
    })()
