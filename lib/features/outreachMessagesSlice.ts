import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface MessageVariation {
  content: string
  platform: string
  tone: string
}

interface OutreachMessage {
  roleId: string
  recipientName: string
  recipientTitle?: string
  recipientCompany: string
  context: string
  connectionPoints: string[]
  platform: string
  variations: MessageVariation[]
  generatedAt: string
}

interface OutreachMessagesState {
  messages: { [roleId: string]: OutreachMessage }
}

const initialState: OutreachMessagesState = {
  messages: {}
}

const outreachMessagesSlice = createSlice({
  name: 'outreachMessages',
  initialState,
  reducers: {
    setOutreachMessage: (state, action: PayloadAction<OutreachMessage>) => {
      state.messages[action.payload.roleId] = action.payload
    },
    updateOutreachRecipient: (state, action: PayloadAction<{
      roleId: string
      recipientName: string
      recipientTitle?: string
      recipientCompany: string
    }>) => {
      const { roleId, recipientName, recipientTitle, recipientCompany } = action.payload
      if (state.messages[roleId]) {
        state.messages[roleId].recipientName = recipientName
        state.messages[roleId].recipientTitle = recipientTitle
        state.messages[roleId].recipientCompany = recipientCompany
      }
    },
    updateOutreachConnectionPoints: (state, action: PayloadAction<{
      roleId: string
      connectionPoints: string[]
    }>) => {
      const { roleId, connectionPoints } = action.payload
      if (state.messages[roleId]) {
        state.messages[roleId].connectionPoints = connectionPoints
      }
    },
    clearOutreachMessage: (state, action: PayloadAction<string>) => {
      delete state.messages[action.payload]
    },
    clearAllOutreachMessages: (state) => {
      state.messages = {}
    }
  }
})

export const {
  setOutreachMessage,
  updateOutreachRecipient,
  updateOutreachConnectionPoints,
  clearOutreachMessage,
  clearAllOutreachMessages
} = outreachMessagesSlice.actions

// Selectors
export const selectOutreachMessage = (state: RootState, roleId: string) =>
  state.outreachMessages.messages[roleId]

export const selectAllOutreachMessages = (state: RootState) =>
  state.outreachMessages.messages

export default outreachMessagesSlice.reducer