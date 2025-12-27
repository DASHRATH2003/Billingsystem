import React, { useState } from 'react'
import CreateBill from './pages/CreateBill.jsx'
import BillPreview from './components/BillPreview.jsx'

const App = () => {
  const [view, setView] = useState('create')
  const [billData, setBillData] = useState(null)

  const handleSubmit = (data) => {
    setBillData(data)
    setView('preview')
  }

  const handleBack = () => setView('create')

  if (view === 'preview') {
    return <BillPreview data={billData} onBack={handleBack} />
  }

  return <CreateBill onSubmit={handleSubmit} />
}

export default App
