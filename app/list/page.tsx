'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Laptop {
  id: string
  serialNumber: string
  elcotNumber: string
  createdAt: string
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ListPage() {
  const [laptops, setLaptops] = useState<Laptop[]>([])
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchLaptops()
  }, [search, pagination.page])

  const fetchLaptops = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      const response = await fetch(`/api/laptops?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLaptops(data.laptops)
        setPagination(data.pagination)
      } else {
        toast.error('Failed to fetch laptops')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/laptops/export')
      
      if (!response.ok) {
        toast.error('Failed to generate Excel report')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laptop-inventory-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Excel report downloaded!')
    } catch (error) {
      toast.error('Failed to download report')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Laptop Inventory</h1>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleExport}
                  disabled={isExporting || laptops.length === 0}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium text-sm sm:text-base"
                >
                  {isExporting ? 'Exporting...' : '📥 Excel'}
                </button>
                <button
                  onClick={() => router.push('/scan')}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm sm:text-base"
                >
                  ➕ Scan
                </button>
                <button
                  onClick={() => router.push('/admin')}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium text-sm sm:text-base"
                >
                  🔐 Admin
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Laptops in Inventory</p>
                  <p className="text-white text-5xl sm:text-6xl font-bold">{pagination.total}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              placeholder="Search by serial number or ELCOT number..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : laptops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base sm:text-lg">No laptops found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3">
                {laptops.map((laptop) => (
                  <div key={laptop.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Serial Number</span>
                        <p className="text-sm font-semibold text-gray-900 break-all">{laptop.serialNumber}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">ELCOT Number</span>
                        <p className="text-sm font-semibold text-gray-900 break-all">{laptop.elcotNumber}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Created At</span>
                        <p className="text-xs text-gray-600">{new Date(laptop.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ELCOT Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {laptops.map((laptop) => (
                      <tr key={laptop.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {laptop.serialNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {laptop.elcotNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(laptop.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Showing {laptops.length} of {pagination.total} entries
                  </p>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-2 sm:px-4 py-2 text-gray-700 text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg transition text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
