"use client"
import React, { useState } from 'react'
import HomeTabbar from './HomeTabbar'

const ProductGrid = () => {
    const [selectedTab,setSelectedTab] = useState("");
  return (
    <div className='mt-10 flex flex-col items-center'>
        <HomeTabbar  selectedTab={selectedTab} onTabSelect={setSelectedTab} />
    </div>
  )
}

export default ProductGrid