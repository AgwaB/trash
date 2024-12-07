import localFont from 'next/font/local'

export const ms_sans = localFont({
  src: [
    {
      path: '../public/fonts/MS Sans Serif-normal-400-100.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/MS Sans Serif Bold-normal-700-100.ttf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-ms-sans'
}) 