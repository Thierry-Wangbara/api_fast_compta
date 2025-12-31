// src/pages/api-docs/types.ts
export interface FieldParam {
  name: string
  type: string
  required: boolean
  description: string
}

export interface FieldQuery {
  name: string
  type: string
  description: string
}

export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  params?: FieldParam[]
  body?: FieldParam[]
  query?: FieldQuery[]
  requestExample?: any
  responseExample?: any
}
