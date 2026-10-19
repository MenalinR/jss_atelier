
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";
import Container from "./Container";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import { currentUser } from "@clerk/nextjs/server";
import { ClerkLoaded, SignedIn, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ListOrdered } from "lucide-react";
import { isAdmin } from "@/lib/admin";


const Header = async()=>{
    const user= await currentUser();
    // The admin manages the shop, so the shopping icons are hidden for them
    const admin = await isAdmin();
    return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md py-4">
        <Container  className="flex items-center justify-between gap-7 text-lightColor">
        <HeaderMenu />
        <div className="w-auto md:w-1/3 flex items-center justify-center gap-2.5">
        <MobileMenu />
        <Logo>JSS</Logo>
        </div>
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5">
           <SearchBar/>
           {!admin && <CartIcon/>}
          <ClerkLoaded>
            <SignedIn>
            {/* Customers see their own orders; the admin sees every order */}
            <Link href={admin ? "/admin/orders" : "/orders"} className='group relative' aria-label={admin ? 'All orders' : 'My orders'}>
            <ListOrdered className='w-5 h-5 group-hover:text-brand-600 hoverEffect'/>
            </Link>
            <UserButton/>
            </SignedIn>
          {!user && (
            <SignInButton mode="modal">
                 <button className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700 hoverEffect">
                Login
            </button>
            </SignInButton>
           )}
          </ClerkLoaded>
          
           </div>
        </Container>
    </header>
    )
};
export default Header;