import React from "react";

const EGYPT_GOVERNORATES = [
  "Alexandria",
  "Assiut",
  "Aswan",
  "Beheira",
  "Bani Suef",
  "Cairo",
  "Dakahlia",
  "Damietta",
  "Fayyoum",
  "Gharbiya",
  "Giza",
  "Ismailia",
  "Kafr El Sheikh",
  "Luxor",
  "Marsa Matrouh",
  "Minya",
  "Monofiya",
  "New Valley",
  "North Sinai",
  "Port Said",
  "Qalioubiya",
  "Qena",
  "Red Sea",
  "Sharqiya",
  "Sohag",
  "South Sinai",
  "Suez",
];

interface BillingData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

type Props = {
  loading: boolean;
  error: string | null;
  billingData: BillingData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleProceedToPayment: () => Promise<void>;
};
const BillingForm = ({
  loading,
  error,
  billingData,
  handleInputChange,
  handleProceedToPayment,
}: Props) => {
  return (
    <>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">Billing Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={billingData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={billingData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="01xxxxxxxxx"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 01xxxxxxxxx or +201xxxxxxxxx
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={billingData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ahmed"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={billingData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mohamed"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="street"
                value={billingData.street}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Building</label>
              <input
                type="text"
                name="building"
                value={billingData.building}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Building A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Apartment
              </label>
              <input
                type="text"
                name="apartment"
                value={billingData.apartment}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apt 101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Floor</label>
              <input
                type="text"
                name="floor"
                value={billingData.floor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1st Floor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={billingData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mansoura"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Governorate *
              </label>
              <select
                name="state"
                value={billingData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Governorate</option>
                {EGYPT_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={billingData.postalCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                name="country"
                value={billingData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Egypt">Egypt</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleProceedToPayment}
            disabled={loading}
            className="mt-6 w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              "Proceed to Payment"
            )}
          </button>
        </div>
    </>
  );
};

export default BillingForm;
