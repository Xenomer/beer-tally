export interface Room {
  id: string
  name: string
  users: Record<string, RoomUser>
}
export interface RoomUser {
  id: string
  name: string
  editToken: string
  count: number
}