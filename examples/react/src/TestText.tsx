import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { useState } from 'react'

export const TEST_NPROFILE_1 =
  'nostr:nprofile1qy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcprfmhxue69uhhyetvv9ujuem9w3skccne9e3k7mf0wccsqgxxvqas78x0a339m8qgkaf7fam5atmarne8dy3rzfd4l4x6w2qpncmfs8zh'
export const TEST_NPROFILE_2 =
  'nostr:nprofile1qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qgmwaehxw309aex2mrp0yh8wetnw3jhymnzw33jucm0d5hsz9thwden5te0wfjkccte9ejxzmt4wvhxjme0qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gfnma0u'
export const TEST_NPROFILE_3 =
  'nostr:nprofile1qyfhwumn8ghj7ur4wfcxcetsv9njuetn9uqsuamnwvaz7tmwdaejumr0dshsz9mhwden5te0wfjkccte9ec8y6tdv9kzumn9wshsqgyzxs0cs2mw40xjhfl3a7g24ktpeur54u2mnm6y5z0e6250h7lx5gflu83m'
export const TEST_NEVENT_1 =
  'nostr:nevent1qvzqqqqqqypzplnld0r0wvutw6alsrd5q2k7vk2nug9j7glxd6ycyp9k8nzz2wdrqyg8wumn8ghj7mn0wd68ytnhd9hx2qg5waehxw309aex2mrp0yhxgctdw4eju6t0qyxhwumn8ghj7mn0wvhxcmmvqqs9gg4thq8ng87z8377jxksjwhk9dl0f8su9c4kq335ydzp0ykmv5gqt3csa'
export const TEST_NPUB = 'nostr:note1dezy67z2sl5yxm6scwmy6w4k0zjleyw3tnttxyduygz96cl79fnsgcsf6g'
export const TEST_NADDR =
  'nostr:naddr1qqwysetjv5syxmmdv4ejqsnfw33k76twyp38jgznwp5hyctvqgsph3c2q9yt8uckmgelu0yf7glruudvfluesqn7cuftjpwdynm2gygrqsqqqa2w4ua43m'
export const TEST_LNBC =
  'lnbc15u1p3xnhl2pp5jptserfk3zk4qy42tlucycrfwxhydvlemu9pqr93tuzlv9cc7g3sdqsvfhkcap3xyhx7un8cqzpgxqzjcsp5f8c52y2stc300gl6s4xswtjpc37hrnnr3c9wvtgjfuvqmpm35evq9qyyssqy4lgd8tj637qcjp05rdpxxykjenthxftej7a2zzmwrmrl70fyj9hvj0rewhzj7jfyuwkwcg9g2jpwtk3wkjtwnkdks84hsnu8xps5vsq4gj5hs'
export const TEST_IMAGE =
  'https://image.nostr.build/87dbc55a6391d15bddda206561d53867a5679dd95e84fe8ed62bfe2e3adcadf3.jpg'

export const TestText = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className='flex flex-row items-center justify-start mt-4'>
        <button className='hover:bg-gray-200 rounded-full w-6 h-6 mr-2' onClick={() => setOpen((prev) => !prev)}>
          {!open ? <IconChevronRight /> : <IconChevronDown />}
        </button>
        <h6 className='text-gray-800'>Testing text</h6>
      </div>
      {open && (
        <span id='raw' className='text-xs break-words text-wrap relative'>
          Try copy & paste some of text below into the editor. <br />
          Hello {TEST_NPROFILE_1} {TEST_NPROFILE_2} {TEST_NPROFILE_3} {TEST_NEVENT_1} {TEST_NPUB} <br />
          {TEST_NADDR}
          <br />
          {TEST_IMAGE}
          <br />
          {TEST_LNBC}
        </span>
      )}
    </>
  )
}
