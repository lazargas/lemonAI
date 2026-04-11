import user1Img from '@/assets/201583141.jpeg'
import user2Img from '@/assets/204859503.jpeg'
import user3Img from '@/assets/205052873.jpeg'
import user4Img from '@/assets/205550393.jpeg'
import user5Img from '@/assets/113246472.jpeg'
import user6Img from '@/assets/110170933.jpeg'
import user7Img from '@/assets/106143303.jpeg'
import user8Img from '@/assets/205537428.jpeg'

export interface User {
  id: number
  name: string
  jobTitle: string
  city: string
  alias: string
  isManager?: boolean
  avatar?: string
}

export const users: User[] = [
  { id: 1, name: "Piyush Bansal",   jobTitle: "SDE-1", city: "Chandigarh", alias: "pibansal",   avatar: user1Img },
  { id: 2, name: "Vaishnavi Bhattaru",    jobTitle: "PA-1",    city: "Hyderabad", alias: "bspvaish",    avatar: user2Img },
  { id: 3, name: "Niharika Walia",   jobTitle: "UX-1", city: "Ambala", alias: "niwalia",   avatar: user3Img },
  { id: 4, name: "Aman Advani",   jobTitle: "PA-1",                       city: "Kanpur", alias: "advaniam",   avatar: user4Img },
  { id: 5, name: "Valentina Roy", jobTitle: "SDE-1",      city: "Kolkata", alias: "valroy", avatar: user5Img },
  { id: 6, name: "Meghana Kasireddy",    jobTitle: "SDE-1",        city: "Hyderabad", alias: "mkasired",    avatar: user6Img },
  { id: 7, name: "Chaitanya Sharma ",     jobTitle: "PA-1",                        city: "Gwalior", alias: "sharchai",     avatar: user7Img },
  { id: 8, name: "Arkoprovo Datta",   jobTitle: "PA-1",         city: "Kolkata", alias: "arkodatt",   avatar: user8Img },
  { id: 9, name: "Manoj Kumar Vallamkondu",    jobTitle: "Manager",                      city: "Hyderabad", alias: "valmanoj",    isManager: true },
]
