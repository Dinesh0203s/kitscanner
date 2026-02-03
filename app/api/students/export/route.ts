import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export async function GET() {
  try {
    const students = await prisma.studentLaptop.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Student Laptop Assignments')

    worksheet.columns = [
      { header: 'ELCOT Number', key: 'elcotNumber', width: 25 },
      { header: 'Student Name', key: 'studentName', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Assigned At', key: 'createdAt', width: 20 },
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    }

    students.forEach((student) => {
      worksheet.addRow({
        elcotNumber: student.elcotNumber,
        studentName: student.studentName,
        department: student.department,
        year: student.year,
        createdAt: new Date(student.createdAt).toLocaleString(),
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=student-assignments-${new Date().toISOString().split('T')[0]}.xlsx`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate Excel report' },
      { status: 500 }
    )
  }
}
