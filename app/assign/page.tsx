'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Html5QrcodeScanner } from 'html5-qrcode'

const DEPARTMENTS = [
  'AERO',
  'AGRI',
  'AI & DS',
  'AI',
  'ML',
  'BME',
  'BT',
  'CSB',
  'SCS',
  'EEE',
  'CE',
  'EEE',
  'MBA',
  'MCA',
  'MECH',
]

export default function AssignPage() {
  const [elcotNumber, setElcotNumber] = useState('')
  const [studentName, setStudentName] = useState('')
  const [department, setDepartment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  
  const elcotInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const router = useRouter()

  useEffect(() => {
    elcotInputRef.current?.focus()
  }, [])

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  const startCameraScanner = () => {
    setShowCamera(true)

    setTimeout(() => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }

      scannerRef.current = new Html5QrcodeScanner(
        'elcot-scanner',
        { 
          fps: 10, 
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight)
            const qrboxSize = Math.floor(minEdgeSize * 0.7)
            return {
              width: qrboxSize,
              height: qrboxSize
            }
          },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        false
      )

      scannerRef.current.render(
        (decodedText) => {
          setElcotNumber(decodedText)
          stopCameraScanner()
          toast.success('ELCOT number scanned!')
          nameInputRef.current?.focus()
        },
        (error) => {
          // Ignore scanning errors
        }
      )
    }, 100)
  }

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    setShowCamera(false)
  }

  const handleElcotKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && elcotNumber.trim()) {
      e.preventDefault()
      nameInputRef.current?.focus()
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!elcotNumber.trim() || !studentName.trim() || !department) {
      toast.error('All fields are required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elcotNumber: elcotNumber.trim(),
          studentName: studentName.trim(),
          department,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to assign laptop')
        return
      }

      toast.success('Laptop assigned successfully!')
      setElcotNumber('')
      setStudentName('')
      setDepartment('')
      elcotInputRef.current?.focus()
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-3 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Assign Laptop</h1>
              <p className="text-sm text-gray-600 mt-1">Assign laptop to student</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => router.push('/students')}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm sm:text-base"
              >
                📋 Students
              </button>
              <button
                onClick={() => router.push('/scan')}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm sm:text-base"
              >
                🏠 Home
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ELCOT Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ELCOT Number *
              </label>
              <div className="flex gap-2">
                <input
                  ref={elcotInputRef}
                  type="text"
                  value={elcotNumber}
                  onChange={(e) => setElcotNumber(e.target.value)}
                  onKeyDown={handleElcotKeyDown}
                  placeholder="Scan or enter ELCOT number"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-base sm:text-lg"
                  disabled={isSubmitting || showCamera}
                  required
                />
                <button
                  type="button"
                  onClick={startCameraScanner}
                  disabled={isSubmitting || showCamera}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center justify-center gap-2 shrink-0"
                  title="Scan with camera"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Camera Scanner */}
            {showCamera && (
              <div className="border-2 border-purple-500 rounded-lg p-3 sm:p-4 bg-white -mx-1 sm:mx-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Scanning ELCOT Number</h3>
                  <button
                    type="button"
                    onClick={stopCameraScanner}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold shadow-md"
                  >
                    Stop
                  </button>
                </div>
                <div id="elcot-scanner" className="overflow-hidden bg-gray-50 rounded-lg p-2"></div>
              </div>
            )}

            {/* Student Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-base sm:text-lg"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Department Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-base sm:text-lg bg-white"
                disabled={isSubmitting}
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !elcotNumber.trim() || !studentName.trim() || !department}
              className="w-full py-3 sm:py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition text-base sm:text-lg shadow-lg"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Laptop'}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">Instructions:</h3>
            <ul className="text-xs sm:text-sm text-purple-800 space-y-1">
              <li>• Scan or enter the ELCOT number from the laptop</li>
              <li>• Enter the student's full name</li>
              <li>• Select the student's department</li>
              <li>• Click "Assign Laptop" to save</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
