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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [laptops, setLaptops] = useState<Laptop[]>([])
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchLaptops()
    }
  }, [isAuthenticated, search, pagination.page])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    // Simple authentication (username: admin, password: dinesh)
    if (username === 'admin' && password === 'dinesh') {
      sessionStorage.setItem('adminAuth', 'true')
      setIsAuthenticated(true)
      toast.success('Login successful!')
    } else {
      toast.error('Invalid username or password')
    }
    setIsLoggingIn(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    setIsAuthenticated(false)
    setUsername('')
    setPassword('')
    toast.success('Logged out successfully')
  }

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

  const handleDelete = async (id: string, serialNumber: string) => {
    if (!confirm(`Are you sure you want to delete laptop with serial number: ${serialNumber}?`)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/laptops/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Laptop deleted successfully')
        fetchLaptops()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete laptop')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setDeletingId(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
            <p className="text-gray-600">Enter your credentials to access admin panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition shadow-lg"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-sm text-gray-600 mt-1">Manage laptop inventory</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => router.push('/scan')}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm sm:text-base"
              >
                ➕ Scan
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium text-sm sm:text-base"
              >
                🚪 Logout
              </button>
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
                      <button
                        onClick={() => handleDelete(laptop.id, laptop.serialNumber)}
                        disabled={deletingId === laptop.id}
                        className="w-full mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm font-medium"
                      >
                        {deletingId === laptop.id ? 'Deleting...' : '🗑️ Delete'}
                      </button>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDelete(laptop.id, laptop.serialNumber)}
                            disabled={deletingId === laptop.id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                          >
                            {deletingId === laptop.id ? 'Deleting...' : '🗑️ Delete'}
                          </button>
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
