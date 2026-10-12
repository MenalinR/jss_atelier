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
    <div className='flex flex-col items-center justify-center gap-5'>
        <Title className='text-3xl md:text-4xl uppercase font-bold text-center '>{bannerTitle}</Title>
        <p className='text-sm text-center text-lightColor/80 font-medium max-w-[480px]'>
        {bannerDescription}
        </p>
        {admin && <SiteSettingsEditor settings={settings} />}
    </div>
  )
}

export default HomeBanner
