import Container from './Container'
import React from 'react'
import FooterTop from './FooterTop'
import Logo from './Logo';
import SocialMedia from './SocialMedia';
import { quickLinksData } from '@/constants';
import Link from 'next/link';
import { getSiteSettings } from '@/sanity/lib/siteSettings';
import { isAdmin } from '@/lib/admin';
import { getCategories } from '@/sanity/lib/categories';
import SiteSettingsEditor from './admin/SiteSettingsEditor';

const linkClassName = 'text-slate-400 hover:text-white text-sm font-medium hoverEffect';

const Footer = async () => {
  const [settings, admin, categories] = await Promise.all([getSiteSettings(), isAdmin(), getCategories()]);
  return (
  <footer className='mt-20 bg-brand-950 text-slate-300'>

    <Container>
    {admin && <div className='flex justify-end pt-6'><SiteSettingsEditor settings={settings} className='bg-white text-brand-900 hover:bg-brand-50' /></div>}
    <FooterTop settings={settings}/>
    <div className='py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10'>
      <div className='space-y-4'>
        <Logo className='text-white'>JSS</Logo>
        <p className='text-slate-400 text-sm leading-relaxed'>{settings.footerAbout}</p>

      </div>
      <div>
        <h3 className='font-semibold text-white mb-4'>Quick Links</h3>
        <div className='flex flex-col gap-3'>
          {quickLinksData?.map((item) =>(
            <Link key={item?.title} href={item?.href} className={linkClassName}>{item?.title}</Link>
          ))}
        </div>
      </div>
      <div>
      <h3 className='font-semibold text-white mb-4'>Categories</h3>
        <div className='flex flex-col gap-3'>
          {categories.map((category) =>(
            <Link key={category._id} href={`/?category=${category.slug}#collections`} className={linkClassName}>{category.title}</Link>
          ))}
        </div>
      </div>
      <div>
        <h3 className='font-semibold text-white mb-4'>Follow Us</h3>
        <SocialMedia className='text-slate-300 flex-wrap'
        iconClassName='border-white/20 hover:border-sky-300 hover:text-sky-300 hover:bg-white/5'
        tooltipClassName='bg-white text-brand-900 rounded-full px-2 py-1 text-xs'/>
      </div>
    </div>
    <div className='border-t border-white/10 py-6 text-center text-xs text-slate-500'>
      © {new Date().getFullYear()} JSS Atelier. All rights reserved.
    </div>
    </Container>
  </footer>
  );
};

export default Footer
