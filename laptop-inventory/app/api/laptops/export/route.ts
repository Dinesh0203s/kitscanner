import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export async function GET() {
  try {
    const laptops = await prisma.laptop.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Laptop Inventory')

    worksheet.columns = [
      { header: 'Serial Number', key: 'serialNumber', width: 25 },
      { header: 'ELCOT Number', key: 'elcotNumber', width: 25 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    }

    laptops.forEach((laptop) => {
      worksheet.addRow({
        serialNumber: laptop.serialNumber,
        elcotNumber: laptop.elcotNumber,
        createdAt: new Date(laptop.createdAt).toLocaleString(),
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=laptop-inventory-${new Date().toISOString().split('T')[0]}.xlsx`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate Excel report' },
      { status: 500 }
    )
  }
}
