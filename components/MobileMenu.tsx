"use client"
import { AlignLeft} from 'lucide-react'
import React, { useState } from 'react'
import Sidebar from './Sidebar'

const MobileMenu = () => {
    const [isSidebarOPen,setIsSidebarOpen] = useState(false);
  return (
   <>
    <button onClick={() => setIsSidebarOpen(!isSidebarOPen)}>
        <AlignLeft className='hover:text-darkColor hoverEffect md:hidden'/>
    </button>
    <div className='md:hidden'>
        <Sidebar 
        isOpen={isSidebarOPen} 
        onClose={() => setIsSidebarOpen(false)}/>
    </div>
   </>
  )
}

export default MobileMenu