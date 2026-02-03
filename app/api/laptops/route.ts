import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serialNumber, elcotNumber } = body

    if (!serialNumber || !elcotNumber) {
      return NextResponse.json(
        { error: 'Serial number and ELCOT number are required' },
        { status: 400 }
      )
    }

    const laptop = await prisma.laptop.create({
      data: {
        serialNumber: serialNumber.trim(),
        elcotNumber: elcotNumber.trim(),
      },
    })

    return NextResponse.json(laptop, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      return NextResponse.json(
        { error: `This ${field === 'serialNumber' ? 'serial number' : 'ELCOT number'} already exists` },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save laptop entry' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { serialNumber: { contains: search, mode: 'insensitive' as const } },
            { elcotNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [laptops, total] = await Promise.all([
      prisma.laptop.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.laptop.count({ where }),
    ])

    return NextResponse.json({
      laptops,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch laptops' },
      { status: 500 }
    )
  }
}
