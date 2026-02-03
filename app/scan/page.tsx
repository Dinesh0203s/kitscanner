'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function ScanPage() {
  const [serialNumber, setSerialNumber] = useState('')
  const [elcotNumber, setElcotNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSerialCamera, setShowSerialCamera] = useState(false)
  const [showElcotCamera, setShowElcotCamera] = useState(false)
  const [activeScanner, setActiveScanner] = useState<'serial' | 'elcot' | null>(null)
  
  const serialInputRef = useRef<HTMLInputElement>(null)
  const elcotInputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const router = useRouter()

  useEffect(() => {
    serialInputRef.current?.focus()
  }, [])

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  const startCameraScanner = (type: 'serial' | 'elcot') => {
    setActiveScanner(type)
    
    if (type === 'serial') {
      setShowSerialCamera(true)
    } else {
      setShowElcotCamera(true)
    }

    setTimeout(() => {
      const scannerId = type === 'serial' ? 'serial-scanner' : 'elcot-scanner'
      
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }

      scannerRef.current = new Html5QrcodeScanner(
        scannerId,
        { 
          fps: 10, 
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            // Make qrbox responsive to screen size
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
          if (type === 'serial') {
            setSerialNumber(decodedText)
            stopCameraScanner()
            toast.success('Serial number scanned!')
            elcotInputRef.current?.focus()
          } else {
            setElcotNumber(decodedText)
            stopCameraScanner()
            toast.success('ELCOT number scanned!')
            handleSubmit(serialNumber, decodedText)
          }
        },
        (error) => {
          // Ignore scanning errors (they happen continuously while scanning)
        }
      )
    }, 100)
  }

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    setShowSerialCamera(false)
    setShowElcotCamera(false)
    setActiveScanner(null)
  }

  const handleSerialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && serialNumber.trim()) {
      e.preventDefault()
      elcotInputRef.current?.focus()
    }
  }

  const handleElcotKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && elcotNumber.trim()) {
      e.preventDefault()
      await handleSubmit()
    }
  }

  const handleSubmit = async (serial?: string, elcot?: string) => {
    const serialToSubmit = serial || serialNumber
    const elcotToSubmit = elcot || elcotNumber

    if (!serialToSubmit.trim() || !elcotToSubmit.trim()) {
      toast.error('Both serial number and ELCOT number are required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/laptops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: serialToSubmit.trim(),
          elcotNumber: elcotToSubmit.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to save laptop entry')
        return
      }

      toast.success('Laptop entry saved successfully!')
      setSerialNumber('')
      setElcotNumber('')
      serialInputRef.current?.focus()
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Scan Laptop</h1>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={() => router.push('/list')}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm sm:text-base"
              >
                📋 List
              </button>
              <button
                onClick={() => router.push('/assign')}
                className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm sm:text-base"
              >
                👨‍🎓 Assign
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm sm:text-base"
              >
                🔐 Admin
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Serial Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number
              </label>
              <div className="flex gap-2">
                <input
                  ref={serialInputRef}
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  onKeyDown={handleSerialKeyDown}
                  placeholder="Scan or enter serial number"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base sm:text-lg"
                  disabled={isSubmitting || showSerialCamera}
                />
                <button
                  onClick={() => startCameraScanner('serial')}
                  disabled={isSubmitting || showSerialCamera || showElcotCamera}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center justify-center gap-2 shrink-0"
                  title="Scan with camera"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Serial Camera Scanner */}
            {showSerialCamera && (
              <div className="border-2 border-blue-500 rounded-lg p-3 sm:p-4 bg-white -mx-1 sm:mx-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Scanning Serial Number</h3>
                  <button
                    onClick={stopCameraScanner}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold shadow-md"
                  >
                    Stop
                  </button>
                </div>
                <div id="serial-scanner" className="overflow-hidden bg-gray-50 rounded-lg p-2"></div>
              </div>
            )}

            {/* ELCOT Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ELCOT Number
              </label>
              <div className="flex gap-2">
                <input
                  ref={elcotInputRef}
                  type="text"
                  value={elcotNumber}
                  onChange={(e) => setElcotNumber(e.target.value)}
                  onKeyDown={handleElcotKeyDown}
                  placeholder="Scan or enter ELCOT number"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base sm:text-lg"
                  disabled={isSubmitting || showElcotCamera}
                />
                <button
                  onClick={() => startCameraScanner('elcot')}
                  disabled={isSubmitting || showSerialCamera || showElcotCamera}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition flex items-center justify-center gap-2 shrink-0"
                  title="Scan with camera"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ELCOT Camera Scanner */}
            {showElcotCamera && (
              <div className="border-2 border-blue-500 rounded-lg p-3 sm:p-4 bg-white -mx-1 sm:mx-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Scanning ELCOT Number</h3>
                  <button
                    onClick={stopCameraScanner}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold shadow-md"
                  >
                    Stop
                  </button>
                </div>
                <div id="elcot-scanner" className="overflow-hidden bg-gray-50 rounded-lg p-2"></div>
              </div>
            )}

            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !serialNumber.trim() || !elcotNumber.trim()}
              className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition text-base sm:text-lg shadow-lg"
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>

          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Instructions:</h3>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li>• <strong>Barcode Scanner:</strong> Scan serial → Press Enter → Scan ELCOT → Press Enter</li>
              <li>• <strong>Camera Scanner:</strong> Click camera icon → Point at barcode → Auto-captures</li>
              <li>• <strong>Manual Entry:</strong> Type the numbers and press Enter</li>
              <li>• After ELCOT is entered, the entry auto-saves</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
