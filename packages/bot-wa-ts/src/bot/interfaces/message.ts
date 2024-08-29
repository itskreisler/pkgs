import { AnyMessageContent, downloadMediaMessage, GroupMetadata, MiscMessageGenerationOptions, proto, WABusinessProfile } from '@whiskeysockets/baileys'
import { Media } from './media'
import P from 'pino'
import { WaMessageTypes } from './inter'
export class Message {
  protected _data: import('@whiskeysockets/baileys').proto.IWebMessageInfo
  id: string
  client: import('@/bot/main').Whatsapp
  author: User
  content: string
  isReply: boolean
  fromMe: boolean
  hasMedia: boolean

  constructor(client: import('@/bot/main').Whatsapp, data: import('@whiskeysockets/baileys').proto.IWebMessageInfo) {
    const { message, pushName, key: { remoteJid, participant, fromMe, id }, verifiedBizName } = data

    this.client = client
    this._data = data
    this.id = id as string
    this.author = (remoteJid ?? '').endsWith('@s.whatsapp.net')
      ? new User(client, pushName ?? verifiedBizName ?? '', (remoteJid ?? '').split('@')[0], (remoteJid ?? ''))
      : new GroupUser(client, (remoteJid ?? ''), pushName ?? verifiedBizName ?? '', (participant ?? '').split('@')[0], (participant ?? ''))
    this.fromMe = fromMe as boolean
    // @ts-expect-error
    this.isReply = !((message[Object.keys(message)[0] as keyof proto.IMessage]?.contextInfo as proto.ContextInfo)?.quotedMessage === false)
    const type = Object.keys(data.message ?? {})[0] as WaMessageTypes

    this.content = client.getMessageBody(data).body
    // this.hasMedia = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage', 'documentWithCaptionMessage', 'viewOnceMessage'].includes(type)
    this.hasMedia = [
      WaMessageTypes.imageMessage,
      WaMessageTypes.videoMessage,
      WaMessageTypes.stickerMessage,
      WaMessageTypes.audioMessage,
      WaMessageTypes.documentMessage,
      WaMessageTypes.documentWithCaptionMessage,
      WaMessageTypes.viewOnceMessage
    ].includes(type)
    // console.log({ c: this.content })
  }

  async reply(content: AnyMessageContent, opts?: MiscMessageGenerationOptions) {
    return await new Promise((resolve) => {
      (async () => {
        resolve(await this.client.sock.sendMessage(this._data.key.remoteJid as string, content, { ...opts, quoted: this._data }))
      })()
    })
  }

  async react(reaction: string): Promise<Message> {
    return await new Promise((resolve) => {
      (async () => {
        await this.client.sock.readMessages([this._data.key])
        resolve(await this.client.send(this._data.key.remoteJid as string, {
          react: { text: reaction, key: this._data.key }
        }))
      })()
    })
  }

  async delete(): Promise<Message> {
    return await new Promise((resolve) => {
      (async () => {
        resolve(await this.client.send(this._data.key.remoteJid as string, { delete: this._data.key }))
      })()
    })
  }

  async getChat(): Promise<Chat> {
    return await new Promise((resolve) => {
      const id = this._data.key.remoteJid;
      (async () => {
        resolve(((id ?? '')?.endsWith('@s.whatsapp.net')) ? new Chat(this.client, id as string) : new Group(this.client, await this.client.sock.groupMetadata(id as string), id as string))
      })()
    })
  }

  downloadMedia(): Promise<Media> | undefined {
    if (!this.hasMedia) return
    return new Promise((resolve) => {
      (async () => {
        const logger = P({ level: 'fatal' }) as any

        const buffer = await downloadMediaMessage(this._data, 'buffer', {}, {
          logger,
          reuploadRequest: this.client.sock.updateMediaMessage
        })

        const msg: proto.IMessage = this._data.message?.viewOnceMessage?.message ?? this._data.message as proto.IMessage
        const type = Object.keys(msg ?? {})[0]

        // @ts-expect-error
        const data = msg.documentWithCaptionMessage?.message?.documentMessage ?? msg[type] as proto.Message.IDocumentMessage
        resolve(new Media(buffer, { mimetype: data.mimetype as string, size: data.fileLength, text: data.caption as string }))
      }
      )()
    })
  }

  getQuotedMsg(): Message | undefined {
    if (!this.isReply) return

    // @ts-expect-error
    const ctx: proto.IContextInfo = this._data.message[Object.keys(this._data.message)[0]]?.contextInfo

    if (ctx === null) return

    return new Message(this.client, {
      key: {
        fromMe: (ctx.participant ?? ctx.remoteJid) === this.author.id,
        participant: ctx.participant,
        remoteJid: ctx.remoteJid ?? this._data.key.remoteJid,
        id: ctx.stanzaId
      },
      message: ctx.quotedMessage
    })
  }

  async getMentions(): Promise<User[]> {
    return await new Promise((resolve) => {
      (async () => {
        const mentionedJid = this._data.message?.extendedTextMessage?.contextInfo?.mentionedJid
        const mentioned: User[] = []

        if (mentionedJid != null) {
          for (const jid of mentionedJid) {
            if ((this._data.key.remoteJid ?? '')?.endsWith('@s.whatsapp.net')) { mentioned.push(new User(this.client, undefined, jid.split('@')[0], jid)) }

            mentioned.push(new GroupUser(this.client, this._data.key.remoteJid as string, undefined, jid?.split('@')[0], jid))
          }
        }

        resolve(mentioned)
      })()
    })
  }
}

export class User {
  client: import('@/bot/main').Whatsapp
  pushname?: string
  number: string
  countryCode: string
  id: string

  constructor(client: import('@/bot/main').Whatsapp, pushname: string = '', number: string, id: string) {
    this.client = client
    this.pushname = pushname
    this.number = number
    this.id = id
    this.countryCode = '57'
  }

  sendMessage(content: string | Media | AnyMessageContent, opts?: MiscMessageGenerationOptions) {
    this.client.send(this.id, content, opts)
  }

  async getProfile(): Promise<WABusinessProfile> {
    return await new Promise((resolve) => {
      (async () => {
        const profile = await this.client.sock.getBusinessProfile(this.id)
        resolve(profile as WABusinessProfile)
      })()
    })
  }

  /**
     * @returns { Promise<string | undefined> }
     */
  /*
  async getProfilePicUrl(): Promise<string | undefined> {
    return await new Promise((resolve) => {
      (async () => {
        const url = await this.client.getProfilePicUrl(this.id)
        resolve(url)
      })()
    })
  }
    */
}
export class GroupUser extends User {
  /**
     * @type { Client }
     */
  client: import('@/bot/main').Whatsapp
  pushname?: string
  number
  countryCode: string
  id
  isAdmin: boolean
  groupId: string

  constructor(client: import('@/bot/main').Whatsapp, groupId: string, pushname: string = '', number: string, id: string) {
    super(client, pushname, number, id)
    this.groupId = groupId
    this.client = client
    this.pushname = pushname
    this.number = number
    this.id = id
    this.countryCode = '57'
    this.isAdmin = false
  }

  sendDM(content: string | Media | AnyMessageContent, opts: MiscMessageGenerationOptions) {
    this.client.send(this.id, content, opts)
  }

  async getProfile(): Promise<WABusinessProfile> {
    return await new Promise((resolve) => {
      (async () => {
        const profile = await this.client.sock.getBusinessProfile(this.id)
        resolve(profile as WABusinessProfile)
      })()
    })
  }

  /**
     *
     * @returns { Promise<Group> }
     */
  async getGroup(): Promise<Group> {
    return await new Promise((resolve) => {
      (async () => {
        const group = new Group(this.client, await this.client.sock.groupMetadata(this.groupId), this.groupId)
        resolve(group)
      })()
    })
  }
}

export class Chat {
  /**
     * @type { Client }
     */
  client: import('@/bot/main').Whatsapp
  id

  /**
     * @param { Client } client
     * @param { string } id
     */
  constructor(client: import('@/bot/main').Whatsapp, id: string) {
    this.client = client
    this.id = id
  }

  async send(content: string | Media | AnyMessageContent): Promise<Message> {
    return await new Promise((resolve) => {
      (async () => {
        resolve(await this.client.send(this.id, content))
      })()
    })
  }

  isGroup(): this is Group {
    return this.id.endsWith('@g.us')
  }
}
export class Group extends Chat {
  protected _data: GroupMetadata
  name
  description

  constructor(client: import('@/bot/main').Whatsapp, data: GroupMetadata, id: string) {
    super(client, id)
    this._data = data
    this.name = data.subject
    this.description = data.desc
  }

  isAdmin(user: User) {
    return this._data.participants.some((p) => {
      return p.id === user.id && (p.isAdmin ?? p.isSuperAdmin)
    })
  }
}
