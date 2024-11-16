import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Header = () => {
    return (
        <header className="border-b xl:px-48 px-10 py-1">
            <div className=" w-full flex h-16 items-center justify-between">
                <Link href='/'>
                    <Image src='/logo.svg' alt='logo' width={160} height={40} />
                </Link>
                <div className="flex items-center gap-4">
                    <div className='w-10 h-10 rounded-full border flex justify-center items-center hover:bg-gray-100 cursor-pointer'>
                        <Image src='/gift.svg' alt='gift' height={18} width={18} />
                    </div>
                    <Button variant="outline" className='border-gray-500 px-8'>Log in</Button>
                    <Button >Join for free</Button>
                </div>
            </div>
        </header>
    )
}

export default Header
