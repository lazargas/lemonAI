import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import lemon from "@/assets/lemon.png"

export function Navbar() {
  return (
    <nav className="px-4 py-3 flex items-center justify-start flex">
      <div className="flex gap-2 text-[30px]">
        <img src={lemon} alt="Logo" className="h-10" />
        <p className="mb-1" >Lemon.ai</p>
      </div>

      <NavigationMenu>
        <NavigationMenuList />
      </NavigationMenu>
    </nav>
  )
}
