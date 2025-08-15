import { useTranslations } from "next-intl";
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
  const  t  = useTranslations('common');

  return (
    <>
      <div className="bg-white p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-6">{t('checkout.billingInformation')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.email')} {t('checkout.billing.required')}
            </label>
            <input
              type="email"
              name="email"
              value={billingData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.emailPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.phoneNumber')} {t('checkout.billing.required')}
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={billingData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.phoneNumberPlaceholder')}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('checkout.billing.phoneFormat')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.firstName')} {t('checkout.billing.required')}
            </label>
            <input
              type="text"
              name="firstName"
              value={billingData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.firstNamePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.lastName')} {t('checkout.billing.required')}
            </label>
            <input
              type="text"
              name="lastName"
              value={billingData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.lastNamePlaceholder')}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.streetAddress')} {t('checkout.billing.required')}
            </label>
            <input
              type="text"
              name="street"
              value={billingData.street}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.streetAddressPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.building')}
            </label>
            <input
              type="text"
              name="building"
              value={billingData.building}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.buildingPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.apartment')}
            </label>
            <input
              type="text"
              name="apartment"
              value={billingData.apartment}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.apartmentPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.floor')}
            </label>
            <input
              type="text"
              name="floor"
              value={billingData.floor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.floorPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.city')} {t('checkout.billing.required')}
            </label>
            <input
              type="text"
              name="city"
              value={billingData.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.cityPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.governorate')} {t('checkout.billing.required')}
            </label>
            <select
              name="state"
              value={billingData.state}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('checkout.billing.selectGovernorate')}</option>
              {EGYPT_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.postalCode')}
            </label>
            <input
              type="text"
              name="postalCode"
              value={billingData.postalCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('checkout.billing.postalCodePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('checkout.billing.country')}
            </label>
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
          className="mt-6 w-full bg-black text-white py-3 px-4 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {t('checkout.billing.processing')}
            </div>
          ) : (
            t('checkout.billing.proceedToPayment')
          )}
        </button>
      </div>
    </>
  );
};

export default BillingForm;