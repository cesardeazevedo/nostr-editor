import { getLinkKind } from '../utils'

describe('getLinkKind', () => {
  test('assert image links', () => {
    expect(getLinkKind('https://nostr.com/image')).toBe('text')
    expect(getLinkKind('https://nostr.com/image.jpg')).toBe('image')
    expect(getLinkKind('https://nostr.com/image.png')).toBe('image')
    expect(getLinkKind('https://nostr.com/image.webp')).toBe('image')
    expect(getLinkKind('https://nostr.com/imagejpg')).toBe('text')
    expect(getLinkKind('https://nostr.com/imagepng')).toBe('text')
  })

  test('assert video links', () => {
    expect(getLinkKind('https://nostr.com/video')).toBe('text')
    expect(getLinkKind('https://nostr.com/video.webm')).toBe('video')
    expect(getLinkKind('https://nostr.com/video.mp4')).toBe('video')
    expect(getLinkKind('https://nostr.com/video.ogg')).toBe('video')
    expect(getLinkKind('https://nostr.com/videowebm')).toBe('text')
    expect(getLinkKind('https://nostr.com/videomp4')).toBe('text')
  })

  test('assert youtube links', () => {
    expect(getLinkKind('https://youtube.com')).toBe('text')
    expect(getLinkKind('https://youtube.com/@user')).toBe('text')
    expect(getLinkKind('https://www.youtube.com/@user')).toBe('text')
    expect(getLinkKind('https://youtube.com/@user/feature')).toBe('text')
    expect(getLinkKind('https://youtube.com/shorts/abcdef12345')).toBe('youtube')
    expect(getLinkKind('https://www.youtube.com/watch?v=aA-jiiepOrE&t=924s')).toBe('youtube')
    expect(getLinkKind('https://youtube.com/watch?v=aA-jiiepOrE&t=924s')).toBe('youtube')
    expect(getLinkKind('https://youtu.be/aA-jiiepOrE?si=YguTWCcr8-fBWq9h')).toBe('youtube')
    expect(getLinkKind('https://www.youtube.com/embed/aA-jiiepOrE?si=tVlJ8q_QSP_3yPHM')).toBe('youtube')
  })

  test('assert twitter links', () => {
    expect(getLinkKind('https://x.com/halfin/status/1110302988')).toBe('tweet')
    expect(getLinkKind('https://twitter.com/halfin/status/1110302988')).toBe('tweet')
  })
})
