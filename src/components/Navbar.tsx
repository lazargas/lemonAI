import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import lemon from "@/assets/lemon.png"

interface NavbarProps {
  onLeadershipDashboard?: () => void
  isLeadershipView?: boolean
}

export function Navbar({ onLeadershipDashboard, isLeadershipView }: NavbarProps) {
  return (
    <nav className="px-4 py-3 flex items-center justify-between">
      <div className="flex gap-2 text-[30px]">
        <img src={lemon} alt="Logo" className="h-10" />
        <p className="mb-1">Lemon.ai</p>
      </div>

      <div className="flex items-center gap-4">
        <NavigationMenu>
          <NavigationMenuList />
        </NavigationMenu>

        {onLeadershipDashboard && (
          <Button onClick={onLeadershipDashboard}>
            {isLeadershipView ? 'Back To Standup Mode' : 'Leadership Dashboard'}
          </Button>
        )}
      </div>
    </nav>
  )
}
