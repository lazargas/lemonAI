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
  isManager?: boolean
  avatar?: string
}

export const users: User[] = [
  { id: 1, name: "User Alpha", jobTitle: "Software Development Manager", city: "City A", avatar: user1Img },
  { id: 2, name: "User Beta", jobTitle: "Sr Mgr, Supply Chain Mgmt", city: "City B", avatar: user2Img },
  { id: 3, name: "User Gamma", jobTitle: "Software Development Manager", city: "City A", avatar: user3Img },
  { id: 4, name: "User Delta", jobTitle: "SDE II", city: "City A", avatar: user4Img },
  { id: 5, name: "User Epsilon", jobTitle: "Software Dev Engineer I", city: "City A", avatar: user5Img },
  { id: 6, name: "User Zeta", jobTitle: "Software Dev Engineer", city: "City A", avatar: user6Img },
  { id: 7, name: "User Eta", jobTitle: "SDE I", city: "City A", avatar: user7Img },
  { id: 8, name: "User Theta", jobTitle: "Programmer Analyst I", city: "City A", avatar: user8Img },
  { id: 9, name: "User Iota", jobTitle: "Manager", city: "City A", isManager: true },
]
