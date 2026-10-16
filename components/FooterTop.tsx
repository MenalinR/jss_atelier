import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import React from 'react'
import { SiteSettings } from '@/sanity/lib/siteSettings';

interface Props{
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}
const iconClassName = 'h-5 w-5';

const getData = (settings: SiteSettings): Props[] => [
{
    title:"Visit Us",
    subtitle:settings.address,
    icon:<MapPin className={iconClassName}/>,
},
{
    title:"Call Us",
    subtitle:settings.phone,
    icon:<Phone className={iconClassName}/>,
},
{
    title:"Business Hours",
    subtitle:settings.businessHours,
    icon:<Clock className={iconClassName}/>,
},
{
    title:"Email Us",
    subtitle:settings.email,
    icon:<Mail className={iconClassName}/>,
},
]

const FooterTop = ({settings}:{settings: SiteSettings}) => {
  const data = getData(settings);
  return <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-white/10 py-10'>{data?.map((item,index) =>( <ContactItem key={index} icon={item?.icon} title={item?.title} subtitle={item?.subtitle}/>))}</div>

};
const ContactItem=({icon,title,subtitle}: Props)=>{
    return <div className='flex items-start gap-4 group rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 hover:bg-white/10 transition-colors'>
        <div className='rounded-xl bg-brand-600 p-3 text-white shadow-lg shadow-brand-600/30'>{icon}</div>
        <div>
            <h3 className='font-semibold text-white'>{title}</h3>
            <p className='text-slate-300 text-sm mt-1'>{subtitle}</p>
        </div>
        </div>
}

export default FooterTop
