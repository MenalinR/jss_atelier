import Container from './Container'
import React from 'react'
import FooterTop from './FooterTop'
import Logo from './Logo';
import SocialMedia from './SocialMedia';
import { quickLinksData, headerData } from '@/constants';
import Link from 'next/link';

const Footer = () => {
  return (
  <footer className='bg-white border-t'>
   
    <Container>
    <FooterTop/>
    <div className='py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
      <div className='space-y-4'>
        <Logo>JSS</Logo>
        <p className='text-gray-600 text-sm'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magnam tempora nobis recusandae neque quaerat veniam hic officiis quasi.</p>
        
      </div>
      <div>
        <h3 className='font-semibold text-darkColor mb-4'>Quick Links</h3>
        <div className='flex flex-col gap-3'>
          {quickLinksData?.map((item) =>(
            <Link key={item?.title} href={item?.href} className='text-gray-600 hover:text-darkColor text-sm font-medium hoverEffect'>{item?.title}</Link>
          ))}
        </div>
      </div>
      <div>
      <h3 className='font-semibold text-darkColor mb-4'>Categories</h3>
        <div className='flex flex-col gap-2'>
          {headerData?.map((item) =>(
            <Link key={item?.title} href={`/category${item?.href}`} className='text-gray-600 hover:text-darkColor text-sm font-medium hoverEffect'>{item?.title}</Link>
          ))}
        </div>
      </div>
      <div><SocialMedia className='text-darkColor/60'
        iconClassName='border-darkColor/60 hover:border-darkColor hover:text-darkColor'
        tooltipClassName='bg-darkColor text-white rounded-full p-1'/></div>
    </div>
    </Container>
  </footer>
  );
};

export default Footer