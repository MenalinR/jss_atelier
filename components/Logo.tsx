import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props{
  children:React.ReactNode;
  className?:string
}

const Logo = ({children,className}: Props) => {
  return <Link href={"/"}>
  <h2 className={cn("text-2xl text-darkColor font-black tracking-wider uppercase")}>{children}</h2>
  </Link>
}

export default Logo