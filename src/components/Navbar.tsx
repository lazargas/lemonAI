import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import lemon from "@/assets/lemon.png"

interface NavbarProps {
  onLeadershipDashboard?: () => void
  isLeadershipView?: boolean
  onSearch?: () => void
  isSearchView?: boolean
}

export function Navbar({ onLeadershipDashboard, isLeadershipView, onSearch, isSearchView }: NavbarProps) {
  return (
    <nav className="px-4 py-3 flex items-center justify-between">
      <div className="flex gap-2 text-[30px]">
        <img src={lemon} alt="Logo" className="h-10" />
        <p className="mb-1">Lemon.ai</p>
      </div>

      <div className="flex items-center gap-3">
        <NavigationMenu>
          <NavigationMenuList />
        </NavigationMenu>

        {onSearch && (
          <Button
            onClick={onSearch}
            variant={isSearchView ? 'outline' : 'outline'}
            size="sm"
            className="gap-1.5"
          >
            <SearchIcon className="size-3.5" />
            {isSearchView ? 'Close Search' : 'Search'}
          </Button>
        )}

        {onLeadershipDashboard && !isSearchView && (
          <Button onClick={onLeadershipDashboard}>
            {isLeadershipView ? 'Back To Standup Mode' : 'Leadership Dashboard'}
          </Button>
        )}
      </div>
    </nav>
  )
}
