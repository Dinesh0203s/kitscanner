import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { elcotNumber, studentName, department } = body

    if (!elcotNumber || !studentName || !department) {
      return NextResponse.json(
        { error: 'ELCOT number, student name, and department are required' },
        { status: 400 }
      )
    }

    const student = await prisma.studentLaptop.create({
      data: {
        elcotNumber: elcotNumber.trim(),
        studentName: studentName.trim(),
        department: department.trim(),
      },
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This ELCOT number is already assigned to a student' },
        { status: 409 }
      )
    }

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
