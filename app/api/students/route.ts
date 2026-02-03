import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { elcotNumber, studentName, department, year } = body

    if (!elcotNumber || !studentName || !department || !year) {
      return NextResponse.json(
        { error: 'ELCOT number, student name, department, and year are required' },
        { status: 400 }
      )
    }

    // Check if ELCOT number exists in Laptop table
    const laptop = await prisma.laptop.findUnique({
      where: { elcotNumber: elcotNumber.trim() },
    })

    if (!laptop) {
      return NextResponse.json(
        { error: 'This ELCOT number is not found in the laptop inventory. Please scan the laptop first.' },
        { status: 404 }
      )
    }

    // Check if already assigned
    const existingAssignment = await prisma.studentLaptop.findUnique({
      where: { elcotNumber: elcotNumber.trim() },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: `This laptop is already assigned to ${existingAssignment.studentName}` },
        { status: 409 }
      )
    }

    const student = await prisma.studentLaptop.create({
      data: {
        elcotNumber: elcotNumber.trim(),
        studentName: studentName.trim(),
        department: department.trim(),
        year: year.trim(),
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error: any) {
    console.error('Assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to assign laptop' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { elcotNumber: { contains: search, mode: 'insensitive' as const } },
        { studentName: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    if (department) {
      where.department = department
    }

    const [students, total] = await Promise.all([
      prisma.studentLaptop.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.studentLaptop.count({ where }),
    ])

    return NextResponse.json({
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}
