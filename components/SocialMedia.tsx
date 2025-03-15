import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@radix-ui/react-tooltip";
import React from 'react'
import Link from "next/link";
import { Github ,Instagram, Facebook, Youtube, Linkedin} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props{
    className?: string;
    iconClassName?: string;
    tooltipClassName?: string;
}

const socialLink = [
    {
        title: "Youtube",
        href: "youtube.com",
        icon: <Youtube className="w-5 h-5"/>,
    },
    {
        title: "Github",
        href: "github.com",
        icon: <Github className="w-5 h-5"/>,
    },
    {
        title: "Linkedin",
        href: "#",
        icon: <Linkedin className="w-5 h-5"/>,
    },
    {
        title: "Facebook",
        href: "#",
        icon: <Facebook className="w-5 h-5"/>,
    },
    {
        title: "Instagram",
        href: "#",
        icon: <Instagram className="w-5 h-5"/>,
    },
    
]

const SocialMedia = ({className,iconClassName,tooltipClassName}: Props) => {
  return <TooltipProvider>
    <div className={cn("flex items-center gap-3.5", className)}>
        {socialLink?.map((item)=>(
            <Tooltip key={item?.title}>
            <TooltipTrigger asChild>
                <Link href={item?.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("p-2 border rounded-full hover:text-white hover:border-white hoverEffect",iconClassName)}>
                {item?.icon}
                </Link>
            </TooltipTrigger>
            <TooltipContent className={cn(" text-white font-semibold ",tooltipClassName)}>{item?.title}</TooltipContent>
        </Tooltip>
        ))}
    </div>

  </TooltipProvider>
}

export default SocialMedia