import Title from './Title'
import React from 'react'
import { getSiteSettings } from '@/sanity/lib/siteSettings'
import { isAdmin } from '@/lib/admin'
import SiteSettingsEditor from './admin/SiteSettingsEditor'

const HomeBanner = async () => {
  const settings = await getSiteSettings()
  const { bannerTitle, bannerDescription } = settings
  const admin = await isAdmin()
  return (
    <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-600 to-sky-500 px-6 py-16 md:py-24 text-white shadow-xl shadow-brand-600/20'>
        {/* Soft decorative glows */}
        <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl'/>
        <div className='pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl'/>

        <div className='relative flex flex-col items-center justify-center gap-6 text-center'>
            <span className='rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] ring-1 ring-white/30'>
                JSS Atelier
            </span>
            <Title className='text-4xl md:text-6xl uppercase font-extrabold tracking-tight max-w-3xl'>{bannerTitle}</Title>
            <p className='text-base md:text-lg text-white/85 max-w-xl'>
            {bannerDescription}
            </p>
            <a href='#collections' className='rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 shadow-lg hover:bg-brand-50 hover:-translate-y-0.5 hoverEffect'>
                Explore collections
            </a>
            {admin && <SiteSettingsEditor settings={settings} className='bg-white/15 ring-1 ring-white/30 hover:bg-white/25' />}
        </div>
    </section>
  )
}

export default HomeBanner
