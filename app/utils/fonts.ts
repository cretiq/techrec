import { Inter, Outfit, Plus_Jakarta_Sans, DM_Sans, Manrope, Roboto, Open_Sans, Lato, Montserrat, Playfair_Display, Merriweather, Raleway, Poppins, Source_Sans_3, Ubuntu, Nunito } from 'next/font/google'

// Modern sans-serif fonts
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
})

export const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

// Additional requested fonts
export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Example weights, adjust as needed
  display: 'swap',
  variable: '--font-roboto',
})

export const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

export const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'], // Example weights
  display: 'swap',
  variable: '--font-lato',
})

export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display', // Note: This is a serif font
})

export const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'], // Example weights
  display: 'swap',
  variable: '--font-merriweather', // Note: This is a serif font
})

export const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
})

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Example weights
  display: 'swap',
  variable: '--font-poppins',
})

export const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // Example weights
  display: 'swap',
  variable: '--font-source-sans-pro',
})

export const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Example weights
  display: 'swap',
  variable: '--font-ubuntu',
})

export const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
})


// Font objects map for easy access
export const fontObjects = {
  inter,
  outfit,
  plusJakartaSans,
  dmSans,
  manrope,
  roboto,
  openSans,
  lato,
  montserrat,
  playfairDisplay,
  merriweather,
  raleway,
  poppins,
  sourceSansPro,
  ubuntu,
  nunito
}

// Font class maps for easy switching (if needed elsewhere)
export const fontClasses = {
  inter: inter.className,
  outfit: outfit.className,
  plusJakartaSans: plusJakartaSans.className,
  dmSans: dmSans.className,
  manrope: manrope.className,
  roboto: roboto.className,
  openSans: openSans.className,
  lato: lato.className,
  montserrat: montserrat.className,
  playfairDisplay: playfairDisplay.className,
  merriweather: merriweather.className,
  raleway: raleway.className,
  poppins: poppins.className,
  sourceSansPro: sourceSansPro.className,
  ubuntu: ubuntu.className,
  nunito: nunito.className
}

// CSS Variables for all fonts
export const fontVariables = [
  inter.variable,
  outfit.variable,
  plusJakartaSans.variable,
  dmSans.variable,
  manrope.variable,
  roboto.variable,
  openSans.variable,
  lato.variable,
  montserrat.variable,
  playfairDisplay.variable,
  merriweather.variable,
  raleway.variable,
  poppins.variable,
  sourceSansPro.variable,
  ubuntu.variable,
  nunito.variable
].join(' ') 