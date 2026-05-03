import { useState } from 'react'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { donationService } from '../../services/donationService'
import toast from 'react-hot-toast'

export const DonationCard = () => {
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const presetAmounts = [100, 500, 1000, 5000]

  const handleDonate = async (e) => {
    e.preventDefault()
    if (!amount || !phone) { toast.error('Please enter amount and phone number'); return }
    setIsLoading(true)
    try {
      await donationService.initiateMpesa(parseFloat(amount), phone)
      toast.success('M-PESA prompt sent to your phone!')
      setAmount('')
      setPhone('')
    } catch { toast.error('Donation failed') }
    finally { setIsLoading(false) }
  }

  return (
    <form onSubmit={handleDonate} className="space-y-4">
      {/* Amount */}
      <div>
        <p className="text-gray-300 text-sm mb-2">Amount (KES)</p>
        <div className="flex gap-2 mb-3">
          {presetAmounts.map(amt => (
            <button key={amt} type="button" onClick={() => setAmount(amt.toString())}
              className={`flex-1 py-2 rounded-lg text-sm transition ${amount === amt.toString() ? 'bg-red-500 text-white' : 'glass-card text-white'}`}>
              {amt}
            </button>
          ))}
        </div>
        <Input name="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />
      </div>

      <Input label="M-PESA Phone Number" name="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254700000000" />

      <Button type="submit" fullWidth isLoading={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
        Donate via M-PESA
      </Button>

      <p className="text-xs text-gray-500 text-center">Till Number: 5489901</p>

      {/* KES Goal | KES raised - layout matches image, count starts at 0 */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-white font-bold">KES 50,000 Goal</p>
        <p className="text-gray-400 text-sm">KES 0 raised this month</p>
      </div>
    </form>
  )
}

export default DonationCard
