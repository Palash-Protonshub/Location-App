import { createSlice } from '@reduxjs/toolkit'

export const locationSlice = createSlice({
  name: 'location',
  initialState: {
    locations: []
  },
  reducers: {
    setlocations: (state,action) => {
      state.locations = [...state.locations,action.payload]
    },
  }
})

export const { setlocations } = locationSlice.actions

export default locationSlice.reducer