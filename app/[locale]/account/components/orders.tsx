import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAccountDetails } from "@/server/db/prisma";
import { auth } from "@/auth";

interface ProductVariant {
  product: {
    name: string;
  };
  size: {
    name: string;
  };
  color: {
    name: string;
  };
}

interface OrderItem {
  id: string;
  productVariantId: string;
  quantity: number;
  priceAtPurchase: number;
  productVariant: ProductVariant;
}

interface Order {
  id: string;
  orderDate: Date;
  totalAmount: number;
  shippingAddress: string | null;
  governorate: string | null;
  status: string;
  paymentMethod: string | null;
  orderItems: OrderItem[];
}

interface UserData {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  phone: string | null;
  name: string | null;
  orders: Order[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Orders = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <section className="container mx-auto p-4 sm:p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <p className="text-red-600 text-lg">Please log in to view your orders.</p>
        </div>
      </section>
    );
  }

  let userData: UserData | null = null;

  try {
    userData = await getAccountDetails(session.user.id);
  } catch (error) {
    console.error("Error fetching account details:", error);
    return (
      <section className="container mx-auto p-4 sm:p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <p className="text-red-600 text-lg">Failed to load orders. Please try again later.</p>
        </div>
      </section>
    );
  }

  if (!userData || !userData.orders || userData.orders.length === 0) {
    return (
      <section className="container mx-auto p-4 sm:p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
          </div>
          <div className="p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">No orders found.</p>
            <p className="text-gray-500 text-sm mt-2">Your order history will appear here once you make a purchase.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto p-4 sm:p-6 overflow-x-scroll lg:overflow-hidden">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
          <p className="text-gray-600 mt-1">Track and manage your order history</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-left text-gray-900 font-semibold">Order ID</TableHead>
                <TableHead className="text-left text-gray-900 font-semibold">Date</TableHead>
                <TableHead className="text-left text-gray-900 font-semibold">Items</TableHead>
                <TableHead className="text-left text-gray-900 font-semibold">Status</TableHead>
                <TableHead className="text-left text-gray-900 font-semibold">Shipping</TableHead>
                <TableHead className="text-left text-gray-900 font-semibold">Payment</TableHead>
                <TableHead className="text-right text-gray-900 font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userData.orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {new Date(order.orderDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    <div className="space-y-1">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="text-sm">
                          <div className="font-medium text-gray-900">
                            {item.productVariant.product.name}
                          </div>
                          <div className="text-gray-500">
                            {item.productVariant.size.name} • {item.productVariant.color.name} • Qty: {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    <div className="text-sm">
                      <div>{order.shippingAddress || "N/A"}</div>
                      {order.governorate && (
                        <div className="text-gray-500">{order.governorate}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {order.paymentMethod || "N/A"}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-900">
                    {order.totalAmount.toFixed(2)} EGP
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default Orders;