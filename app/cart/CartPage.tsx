"use client"

import { useCart } from "@/context/CartContext"

export function CartPage() {
  const { items: cartItems, count } = useCart()

  // if (isLoading) {
  //   return (
  //     <div className="container mx-auto p-4">
  //       <h1 className=" mb-6 uppercase">Shopping Bag</h1>
  //       <p>Loading cart...</p>
  //     </div>
  //   )
  // }
  
  return (
    <div className="">
        <h1 className=" mb-6 uppercase p-6">Shopping Bag ({count})</h1>
      
      {count === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="border p-4 rounded">
                <p>Product: {item.productVariant.product.name}</p>
                <p>Size: {item.productVariant.size.name}</p>
                <p>Color: {item.productVariant.color.name}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Cart Item ID: {item.id}</p>
              </div>
            ))}
          </div>
          
          {/* <CheckoutButton /> */}
          
        </>
      )}
    </div>
  )
}