import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Laptop ID is required' },
        { status: 400 }
      )
    }

    // Check if laptop exists
    const laptop = await prisma.laptop.findUnique({
      where: { id },
    })

    if (!laptop) {
      return NextResponse.json(
        { error: 'Laptop not found' },
        { status: 404 }
      )
    }

    // Delete the laptop
    await prisma.laptop.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Laptop deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete laptop' },
      { status: 500 }
    )
  }
}
