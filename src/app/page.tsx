import Image from "next/image";
import Header from "./layouts/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const signInFormSelectItems = [
  {
    title: '+971',
    img: 'https://static.uacdn.net/thumbnail/country-flag-icons/ae.png'
  },
  {
    title: '+61',
    img: 'https://static.uacdn.net/thumbnail/country-flag-icons/au.png'
  },
  {
    title: '+1',
    img: 'https://static.uacdn.net/thumbnail/country-flag-icons/ca.png'
  },
  {
    title: '+91',
    img: 'https://static.uacdn.net/thumbnail/country-flag-icons/in.png'
  },
  {
    title: '+966',
    img: 'https://static.uacdn.net/thumbnail/country-flag-icons/sa.png'
  },
  {
    title: '+65',
    img: 'https://static.uacdn.net/thumbnail/country-flag-icons/sg.png'
  },
  {
    title: '+1',
    img: 'https://static.uacdn.net/thumbnail/country-flag-icons/us.png'
  }
]

export default function Home() {
  return (
    <>
      <Header />
      <main className="xl:px-48 p-10 w-full">
        {/* Hero sectionm */}
        <section className=" flex justify-between items-center h-[80vh]">
          {/* Login Form */}
          <div className="bg-white w-[460px] space-y-3">
            <h1 className="text-[44px] font-bold text-primary">Crack your goal with India’s top educators</h1>
            <p className="font-medium">Over <span className="text-[#68CDA5]">10 crore</span> learners trust us for their preparation</p>
            <div className="flex justify-center items-center gap-2 border-gray-500 border rounded-md">
              <Select defaultValue="+91" >
                <SelectTrigger className="w-[100px] border-0">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {signInFormSelectItems.map(({ title, img }, index) => {
                    return <SelectItem value={title} key={index}>
                      <span className="flex items-center gap-2 text-xs font-medium">
                        <img className="text-sm w-5" src={img} /> {title}
                      </span>
                    </SelectItem>
                  })}
                </SelectContent>
              </Select>
              <Input className="flex-1 border-0" placeholder="Enter your mobile number" type="tel" />
            </div>
            <p className="text-sm text-gray-500">We&apos;ll send an OTP for verification</p>
            <Button className="w-full" size="lg">
              Join for free
            </Button>
          </div>
          {/* Image */}
          <div><Image src='/hero.svg' alt='hero-image' width={550} height={550} /></div>
        </section>
      </main>
    </>
  );
}
