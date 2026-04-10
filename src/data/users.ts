export interface User {
  id: number
  name: string
  jobTitle: string
  city: string
  isManager?: boolean
}

export const users: User[] = [
  { id: 1, name: "User Alpha", jobTitle: "Software Development Manager", city: "City A" },
  { id: 2, name: "User Beta", jobTitle: "Sr Mgr, Supply Chain Mgmt", city: "City B" },
  { id: 3, name: "User Gamma", jobTitle: "Software Development Manager", city: "City A" },
  { id: 4, name: "User Delta", jobTitle: "SDE II", city: "City A" },
  { id: 5, name: "User Epsilon", jobTitle: "Software Dev Engineer I", city: "City A" },
  { id: 6, name: "User Zeta", jobTitle: "Software Dev Engineer", city: "City A" },
  { id: 7, name: "User Eta", jobTitle: "SDE I", city: "City A" },
  { id: 8, name: "User Theta", jobTitle: "Programmer Analyst I", city: "City A" },
  { id: 9, name: "User Iota", jobTitle: "Manager", city: "City A", isManager: true },
]
