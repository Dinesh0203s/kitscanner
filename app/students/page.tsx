'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface StudentLaptop {
  id: string
  elcotNumber: string
  studentName: string
  department: string
  year: string
  createdAt: string
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

const DEPARTMENTS = [
  'AERO', 'AGRI', 'AI & DS', 'AI', 'ML', 'BME', 'BT', 'CSB', 'SCS', 'EEE', 'CE', 'MBA', 'MCA', 'MECH'
]

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentLaptop[]>([])
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
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
    fetchStudents()
  }, [search, departmentFilter, pagination.page])

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        department: departmentFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      const response = await fetch(`/api/students?${params}`)
      const data = await response.json()

      if (response.ok) {
        setStudents(data.students)
        setPagination(data.pagination)
      } else {
        toast.error('Failed to fetch students')
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
      const response = await fetch('/api/students/export')
      
      if (!response.ok) {
        toast.error('Failed to generate Excel report')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `student-assignments-${new Date().toISOString().split('T')[0]}.xlsx`
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Student Laptops</h1>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleExport}
                  disabled={isExporting || students.length === 0}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium text-sm sm:text-base"
                >
                  {isExporting ? 'Exporting...' : '📥 Excel'}
                </button>
                <button
                  onClick={() => router.push('/assign')}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium text-sm sm:text-base"
                >
                  ➕ Assign
                </button>
                <button
                  onClick={() => router.push('/scan')}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm sm:text-base"
                >
                  🏠 Home
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">Total Student Assignments</p>
                  <p className="text-white text-5xl sm:text-6xl font-bold">{pagination.total}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 sm:mb-6 space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              placeholder="Search by ELCOT number or student name..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm sm:text-base"
            />
            
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm sm:text-base bg-white"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base sm:text-lg">No student assignments found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">ELCOT Number</span>
                        <p className="text-sm font-semibold text-gray-900 break-all">{student.elcotNumber}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Student Name</span>
                        <p className="text-sm font-semibold text-gray-900">{student.studentName}</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-500 uppercase">Department</span>
                          <p className="text-sm">
                            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                              {student.department}
                            </span>
                          </p>
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-500 uppercase">Year</span>
                          <p className="text-sm">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                              {student.year}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Assigned At</span>
                        <p className="text-xs text-gray-600">{new Date(student.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ELCOT Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-purple-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.elcotNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                            {student.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                            {student.year}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Showing {students.length} of {pagination.total} entries
                  </p>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 sm:px-4 py-2 bg-purple-100 hover:bg-purple-200 disabled:bg-gray-50 disabled:text-gray-400 text-purple-700 rounded-lg transition text-sm"
                    >
                      Previous
                    </button>
                    <span className="px-2 sm:px-4 py-2 text-gray-700 text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 sm:px-4 py-2 bg-purple-100 hover:bg-purple-200 disabled:bg-gray-50 disabled:text-gray-400 text-purple-700 rounded-lg transition text-sm"
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
