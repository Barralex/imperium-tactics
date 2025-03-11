export interface Match {
  id: string
  status: string
  created_at: string
  player1_id: string
  player2_id: string | null
  total_units: number
  match_title: string
}

export interface Player {
  id: string
  email: string
  avatar: string
}

export interface MatchDetails {
  id: string
  status: string
  match_title: string
  player: Player
  playerByPlayer2Id?: Player | null
  total_units: number
  turn?: string
}

export interface UnitSelectionProps {
  isOpen: boolean
  onClose: () => void
  maxUnits: number
  playerId: string | undefined
  matchId: string | undefined
  playerId1: string | undefined
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  isLoading: boolean
  onSubmit: (name: string, totalUnits: number) => void
}

export interface ButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
  title?: string
  children: React.ReactNode
}

export interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean
  loadingText: string
  icon?: React.ReactNode
}

export type Piece = {
  id: string
  pos_x: number
  pos_y: number
  type: 'melee' | 'ranged' | 'normal'
  hp: number
  range: number
  movement?: number
  player_id?: string
  match_id?: string
}
