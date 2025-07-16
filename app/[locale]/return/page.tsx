// checkout/return/page.tsx
import { redirect } from 'next/navigation'
import { retrieveCheckoutSession, handleSuccessfulPayment } from '../../../server/actions/stripe'
import Link from 'next/link'

interface ReturnProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function Return({ searchParams }: ReturnProps) {
  const { session_id } = await searchParams

  if (!session_id) {
    throw new Error('Please provide a valid session_id (`cs_test_...`)')
  }

  const { session, error } = await retrieveCheckoutSession(session_id)

  if (error || !session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Payment Error</h1>
        <p>There was an error processing your payment. Please try again.</p>
        <a href="/cart" className="text-blue-600 hover:underline">
          Return to Cart
        </a>
      </div>
    )
  }

  const { status, customer_details } = session

  if (status === 'open') {
    return redirect('/checkout')
  }

  if (status === 'complete') {
    // Handle successful payment
    const paymentResult = await handleSuccessfulPayment(session_id)
    
    if (paymentResult.success) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Thank you for your purchase.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Order Details</h2>
              <p className="text-sm text-gray-600 mb-2">
                Order ID: <span className="font-mono">{paymentResult.orderId}</span>
              </p>
              <p className="text-sm text-gray-600">
                A confirmation email will be sent to{' '}
                <span className="font-medium">{customer_details?.email}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                If you have any questions, please email{' '}
                <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                  support@sekra.com
                </a>
              </p>
              
              <div className="flex gap-4 justify-center">
                <a 
                  href="/account/orders" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Orders
                </a>
                <Link
                  href="/" 
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    } 
  }

  return null
}