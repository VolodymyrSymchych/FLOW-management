'use client';

import { CreditCard, Download, TrendingUp } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Billing</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Pro Plan</h2>
            <p className="text-white/80 mb-4">Unlimited projects and team members</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-white/80">/month</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">API Calls</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2,847</p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">65% of monthly limit</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12.4 GB</p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '42%' }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">42% of 30 GB</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">6 / ∞</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Unlimited on Pro plan</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Payment Method</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/24</p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            Update
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Billing History</h3>
          <button className="text-sm text-primary-500 hover:text-primary-600">View All</button>
        </div>
        <div className="space-y-3">
          {[
            { date: 'Nov 1, 2024', amount: '$49.00', status: 'Paid' },
            { date: 'Oct 1, 2024', amount: '$49.00', status: 'Paid' },
            { date: 'Sep 1, 2024', amount: '$49.00', status: 'Paid' },
          ].map((invoice, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.date}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pro Plan</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{invoice.amount}</span>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                  {invoice.status}
                </span>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
