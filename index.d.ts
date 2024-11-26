declare namespace Express {
  export interface Request {
    auth: {
      user_id?: string
      partner_id?: string
      is_service?: boolean
    }
    file?: { buffer: Buffer }
  }
}

declare module 'merge-dirs'
