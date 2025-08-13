import { EConstCMD, type IPostMedia } from '@/bot/interfaces/inter'
import { CmdActions, type IKudasaiData, type IEpisodeAdded, kudasaiApi, LatAnimeScraper, AnimeFLVScraper, URIS } from '@kreisler/bot-services'
import { getStreamFromUrl } from '@/bot/helpers/polyfill'
import { MarkdownWsp } from '@kreisler/js-helpers'

/**
 * Registra automáticamente todas las funciones de comandos al inicializar el bot
 */
export function registerCommandFunctions(): void {
    // Registrar comando Kudasai
    CmdActions.setCmdActions(
        EConstCMD.Kudasai,
        async () => {
            return (await kudasaiApi()).map(item => ({ id: item.slug, ...item }))
        },
        async (fn: (...args: any[]) => Promise<IKudasaiData[]>): Promise<IPostMedia[]> => {
            const urlBase = 'https://somoskudasai.com/'
            const data: IKudasaiData[] = await fn()
            const multimedias: IPostMedia[] = []
            for (const { image, title, category: { slug: cslug }, slug } of data) {
                multimedias.push({
                    image: {
                        stream: await getStreamFromUrl(image.replace('-150x150', ''))
                    },
                    caption: title.concat('\n\n', MarkdownWsp.Quote(urlBase.concat(cslug, '/', slug, '/')))
                })
            }
            return multimedias
        }
    )

    // Registrar comando LatAnime
    const latScraper = new LatAnimeScraper()
    CmdActions.setCmdActions(
        EConstCMD.Lat,
        async () => {
            return latScraper.latestEpisodesAdded()
        },
        async (fn: (...args: any[]) => Promise<IEpisodeAdded[]>): Promise<IPostMedia[]> => {
            const data: IEpisodeAdded[] = await fn()
            const multimedias: IPostMedia[] = []
            for (const { episode, title, poster, servers } of data.slice(0, 5)) {
                const enlacesParaVer = servers.watchOnline.map(({ title, code }) => MarkdownWsp.Quote(MarkdownWsp.Bold(title).concat(': ', code))).join('\n')
                const caption = MarkdownWsp.Quote(URIS.LAT_BASE_URL)
                    .concat('\n')
                    .concat(`${MarkdownWsp.Quote(`El episodio #${String(episode)} de ${MarkdownWsp.Bold(title)} ya está disponible\n`)}`)
                    .concat(enlacesParaVer)
                multimedias.push({
                    image: {
                        stream: await getStreamFromUrl(poster)
                    },
                    caption
                })
            }
            return multimedias
        }
    )

    // Registrar comando AnimeFLV
    const flvScraper = new AnimeFLVScraper()
    CmdActions.setCmdActions(
        EConstCMD.Flv,
        async () => {
            return flvScraper.latestEpisodesAdded()
        },
        async (fn: (...args: any[]) => Promise<IEpisodeAdded[]>): Promise<IPostMedia[]> => {
            const data: IEpisodeAdded[] = await fn()
            const multimedias: IPostMedia[] = []
            for (const { episode, title, poster, servers } of data) {
                const enlacesParaVer = servers.watchOnline.map(({ title, code }) => MarkdownWsp.Quote(MarkdownWsp.Bold(title).concat(': ', code))).join('\n')
                const caption = MarkdownWsp.Quote(URIS.FLV_BASE_URL)
                    .concat('\n')
                    .concat(`${MarkdownWsp.Quote(`El episodio #${String(episode)} de ${MarkdownWsp.Bold(title)} ya está disponible\n`)}`)
                    .concat(enlacesParaVer)
                multimedias.push({
                    image: {
                        stream: await getStreamFromUrl(poster)
                    },
                    caption
                })
            }
            return multimedias
        }
    )

    console.log('✅ Funciones de comandos registradas automáticamente')
}
