import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props{
  children:React.ReactNode;
  className?:string
}

const Logo = ({children,className}: Props) => {
  return <Link href={"/"}>
  <h2 className={cn("text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-brand-700 to-sky-500 bg-clip-text text-transparent",className)}>{children}</h2>
  </Link>
}

export default Logo