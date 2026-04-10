import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import lemon from "@/assets/lemon.png"

export function Navbar() {
  return (
    <nav className="border-b px-4 py-4 shadow-md flex items-center">
      <img src={lemon} alt="Logo" className="h-10 ml-4" />
      <NavigationMenu>
        <NavigationMenuList />
      </NavigationMenu>
    </nav>
  )
}
