import { Extension } from '@tiptap/core'

const NSEC_REGEX = /(nsec1[0-9a-z]+)/g

export type NSecRejectOptions = {
  onError?: (props: unknown) => void
}

export const NSecRejectExtension = Extension.create<NSecRejectOptions>({
  name: 'nsecReject',

  addOptions() {
    return {}
  },

  addPasteRules() {
    return [
      {
        find: NSEC_REGEX,
        handler: (props) => {
          props
            .chain()
            .deleteRange(props.range)
            .insertContentAt(props.range.from, { text: '*NSEC_DELETED*', type: 'text' })
            .run()

          if (this.options.onError) {
            this.options.onError(props)
            return
          }
          window.alert('DO NOT PASTE YOUR NSEC INTO THE EDITOR')
        },
      },
    ]
  },
})
