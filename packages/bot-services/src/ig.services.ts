
interface InstaPostData {
  shortcode: string
  owner: {
    username: string
    full_name: string
    is_verified: boolean
    is_private: boolean
  }
  edge_media_preview_like: {
    count: number
  }
  is_ad: boolean
}
function formatPostInfo (requestData: InstaPostData) {
  try {
    return {
      owner_username: requestData.owner.username,
      owner_fullname: requestData.owner.full_name,
      is_verified: requestData.owner.is_verified,
      is_private: requestData.owner.is_private,
      likes: requestData.edge_media_preview_like.count,
      is_ad: requestData.is_ad
    }
  } catch (err) {
    throw new Error(`Failed to format post info: ${JSON.stringify(err)}`)
  }
}
function formatMediaDetails(mediaData: XdtShortcodeMedia) {
  try {
    if (mediaData.is_video) {
      return {
        type: 'video',
        dimensions: mediaData.dimensions,
        video_view_count: mediaData.video_view_count,
        url: mediaData.video_url,
        thumbnail: mediaData.display_url
      }
    } else {
      return {
        type: 'image',
        dimensions: mediaData.dimensions,
        url: mediaData.display_url
      }
    }
  } catch (err) {
    throw new Error(`Failed to format media details: ${JSON.stringify(err)}`)
  }
}

function isSidecar(requestData: { __typename: string }) {
  try {
    return requestData.__typename === 'XDTGraphSidecar'
  } catch (err) {
    throw new Error(`Failed sidecar verification: ${JSON.stringify(err)}`)
  }
}
function getShortcode(url: string) {
  try {
    const splitUrl = url.split('/')
    const postTags = ['p', 'reel', 'tv']
    const indexShortcode = splitUrl.findIndex(item => postTags.includes(item)) + 1
    const shortcode = splitUrl[indexShortcode]
    return shortcode
  } catch (err) {
    throw new Error(`Failed to obtain shortcode: ${JSON.stringify(err)}`)
  }
}
async function instagramRequest(shortcode: string) {
  try {
    const BASE_URL = 'https://www.instagram.com/graphql/query'
    const INSTAGRAM_DOCUMENT_ID = '8845758582119845'
    const dataBody = new URLSearchParams({
      variables: JSON.stringify({
        shortcode,
        fetch_tagged_user_count: null,
        hoisted_comment_id: null,
        hoisted_reply_id: null
      }),
      doc_id: INSTAGRAM_DOCUMENT_ID
    })

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: dataBody
    }

    const res = await globalThis.fetch(BASE_URL, config)
    if (!res.ok) throw new Error('Failed to fetch instagram data.')
    const data = await res.json() as RootResponse
    if (typeof data.data?.xdt_shortcode_media === 'undefined') throw new Error('Only posts/reels supported, check if your link is valid.')
    return data.data.xdt_shortcode_media
  } catch (err) {
    console.log('Error instagram request', err)
    throw new Error('Failed instagram request')
  }
}
function createOutputData(requestData: XdtShortcodeMedia) {
  try {
    const urlList = []; const mediaDetails = []
    const IS_SIDECAR = isSidecar(requestData)
    if (IS_SIDECAR) {
      // Post with sidecar
      requestData.edge_sidecar_to_children.edges.forEach((media) => {
        mediaDetails.push(formatMediaDetails(media.node))
        if (media.node.is_video) { // Sidecar video item
          urlList.push(media.node.video_url)
        } else { // Sidecar image item
          urlList.push(media.node.display_url)
        }
      })
    } else {
      // Post without sidecar
      mediaDetails.push(formatMediaDetails(requestData))
      if (requestData.is_video) { // Video media
        urlList.push(requestData.video_url)
      } else { // Image media
        urlList.push(requestData.display_url)
      }
    }

    return {
      results_number: urlList.length,
      urlList,
      post_info: formatPostInfo(requestData),
      mediaDetails
    }
  } catch (err) {
    throw new Error('Failed to create output data')
  }
}
interface InstagramOutput {
  results_number: number
  urlList: string[]
  post_info: {
    owner_username: string
    owner_fullname: string
    is_verified: boolean
    is_private: boolean
    likes: number
    is_ad: boolean
  }
  mediaDetails: Array<{
    type: 'video' | 'image'
    dimensions: Dimensions
    video_view_count?: number
    url: string
    thumbnail?: string
  }>
}
export async function instagramGetUrl (urlMedia: string): Promise<InstagramOutput> {
  const { promise, resolve } = Promise.withResolvers()

  const SHORTCODE = getShortcode(urlMedia)
  const INSTAGRAM_REQUEST = await instagramRequest(SHORTCODE)
  const OUTPUT_DATA = createOutputData(INSTAGRAM_REQUEST)
  resolve(OUTPUT_DATA)

  return await promise as InstagramOutput
}
export interface RootResponse {
  data: InstagramData
  extensions: Extensions
  status: string
}

export interface InstagramData {
  xdt_shortcode_media: XdtShortcodeMedia
}

export interface XdtShortcodeMedia {
  __typename: string
  __isXDTGraphMediaInterface: string
  id: string
  shortcode: string
  thumbnail_src: string
  dimensions: Dimensions
  gating_info: any
  fact_check_overall_rating: any
  fact_check_information: any
  sensitivity_friction_info: any
  sharing_friction_info: SharingFrictionInfo
  media_overlay_info: any
  media_preview: any
  display_url: string
  display_resources: DisplayResource[]
  is_video: boolean
  video_url: string
  video_view_count: number
  tracking_token: string
  upcoming_event: any
  edge_media_to_tagged_user: EdgeMediaToTaggedUser
  owner: Owner
  accessibility_caption: string
  edge_sidecar_to_children: EdgeSidecarToChildren
  edge_media_to_caption: EdgeMediaToCaption
  can_see_insights_as_brand: boolean
  caption_is_edited: boolean
  has_ranked_comments: boolean
  like_and_view_counts_disabled: boolean
  edge_media_to_parent_comment: EdgeMediaToParentComment
  edge_media_to_hoisted_comment: EdgeMediaToHoistedComment
  edge_media_preview_comment: EdgeMediaPreviewComment
  comments_disabled: boolean
  commenting_disabled_for_viewer: boolean
  taken_at_timestamp: number
  edge_media_preview_like: EdgeMediaPreviewLike
  edge_media_to_sponsor_user: EdgeMediaToSponsorUser
  is_affiliate: boolean
  is_paid_partnership: boolean
  location: any
  nft_asset_info: any
  viewer_has_liked: boolean
  viewer_has_saved: boolean
  viewer_has_saved_to_collection: boolean
  viewer_in_photo_of_you: boolean
  viewer_can_reshare: boolean
  is_ad: boolean
  edge_web_media_to_related_media: EdgeWebMediaToRelatedMedia
  coauthor_producers: any[]
  pinned_for_users: any[]
}

export interface Dimensions {
  height: number
  width: number
}

export interface SharingFrictionInfo {
  should_have_sharing_friction: boolean
  bloks_app_url: any
}

export interface DisplayResource {
  src: string
  config_width: number
  config_height: number
}

export interface EdgeMediaToTaggedUser {
  edges: any[]
}

export interface Owner {
  id: string
  username: string
  is_verified: boolean
  profile_pic_url: string
  blocked_by_viewer: boolean
  restricted_by_viewer: any
  followed_by_viewer: boolean
  full_name: string
  has_blocked_viewer: boolean
  is_embeds_disabled: boolean
  is_private: boolean
  is_unpublished: boolean
  requested_by_viewer: boolean
  pass_tiering_recommendation: boolean
  edge_owner_to_timeline_media: EdgeOwnerToTimelineMedia
  edge_followed_by: EdgeFollowedBy
}

export interface EdgeOwnerToTimelineMedia {
  count: number
}

export interface EdgeFollowedBy {
  count: number
}

export interface EdgeSidecarToChildren {
  edges: Edge[]
}

export interface Edge {
  node: NodeEdge
}

export interface NodeEdge extends XdtShortcodeMedia {
  __typename: string
  id: string
  shortcode: string
  dimensions: Dimensions
  gating_info: any
  fact_check_overall_rating: any
  fact_check_information: any
  sensitivity_friction_info: any
  sharing_friction_info: SharingFrictionInfo2
  media_overlay_info: any
  media_preview: string
  display_url: string
  display_resources: DisplayResource2[]
  accessibility_caption: string
  is_video: boolean
  tracking_token: string
  upcoming_event: any
  edge_media_to_tagged_user: EdgeMediaToTaggedUser2
}

export interface SharingFrictionInfo2 {
  should_have_sharing_friction: boolean
  bloks_app_url: any
}

export interface DisplayResource2 {
  src: string
  config_width: number
  config_height: number
}

export interface EdgeMediaToTaggedUser2 {
  edges: any[]
}

export interface EdgeMediaToCaption {
  edges: Edge2[]
}

export interface Edge2 {
  node: Node2
}

export interface Node2 {
  created_at: string
  text: string
  id: string
}

export interface EdgeMediaToParentComment {
  count: number
  page_info: PageInfo
  edges: Edge3[]
}

export interface PageInfo {
  has_next_page: boolean
  end_cursor: string
}

export interface Edge3 {
  node: Node3
}

export interface Node3 {
  id: string
  text: string
  created_at: number
  did_report_as_spam: boolean
  owner: Owner2
  viewer_has_liked: boolean
  edge_liked_by: EdgeLikedBy
  is_restricted_pending: boolean
  edge_threaded_comments: EdgeThreadedComments
}

export interface Owner2 {
  id: string
  is_verified: boolean
  profile_pic_url: string
  username: string
}

export interface EdgeLikedBy {
  count: number
}

export interface EdgeThreadedComments {
  count: number
  page_info: PageInfo2
  edges: any[]
}

export interface PageInfo2 {
  has_next_page: boolean
  end_cursor: any
}

export interface EdgeMediaToHoistedComment {
  edges: any[]
}

export interface EdgeMediaPreviewComment {
  count: number
  edges: Edge4[]
}

export interface Edge4 {
  node: Node4
}

export interface Node4 {
  id: string
  text: string
  created_at: number
  did_report_as_spam: boolean
  owner: Owner3
  viewer_has_liked: boolean
  edge_liked_by: EdgeLikedBy2
  is_restricted_pending: boolean
}

export interface Owner3 {
  id: string
  is_verified: boolean
  profile_pic_url: string
  username: string
}

export interface EdgeLikedBy2 {
  count: number
}

export interface EdgeMediaPreviewLike {
  count: number
  edges: any[]
}

export interface EdgeMediaToSponsorUser {
  edges: any[]
}

export interface EdgeWebMediaToRelatedMedia {
  edges: any[]
}

export interface Extensions {
  is_final: boolean
}
