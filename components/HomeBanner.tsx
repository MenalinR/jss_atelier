import Title from './Title'
import React from 'react'

const HomeBanner = () => {
  return (
    <div className='flex flex-col items-center justify-center gap-5'>
        <Title className='text-3xl md:text-4xl uppercase font-bold text-center '>Best Painting Collections</Title>
        <p className='text-sm text-center text-lightColor/80 font-medium max-w-[480px]'>
        Welcome to JSS – where every painting tells a story. Explore a world of colors, creativity, and inspiration.
        </p>
    </div>
  )
}

export default HomeBanner