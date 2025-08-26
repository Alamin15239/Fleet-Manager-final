import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/vehicles - Get all vehicles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const plateOnly = searchParams.get('plateOnly') === 'true'
    const trailerOnly = searchParams.get('trailerOnly') === 'true'
    const status = searchParams.get('status') // 'active', 'inactive', or 'all'

    let whereClause: any = {}

    if (status === 'active') {
      whereClause.isActive = true
    } else if (status === 'inactive') {
      whereClause.isActive = false
    }
    // If status is 'all' or not specified, don't filter by isActive

    if (search) {
      whereClause.OR = [
        { plateNumber: { contains: search, mode: 'insensitive' } },
        { trailerNumber: { contains: search, mode: 'insensitive' } },
        { driverName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (plateOnly) {
      const vehicles = await db.vehicle.findMany({
        where: whereClause,
        select: { plateNumber: true },
        distinct: ['plateNumber'],
        orderBy: { plateNumber: 'asc' }
      })
      return NextResponse.json({ vehicles: vehicles.map(v => v.plateNumber) })
    }

    if (trailerOnly) {
      const vehicles = await db.vehicle.findMany({
        where: { 
          ...whereClause, 
          trailerNumber: { not: null } 
        },
        select: { trailerNumber: true },
        distinct: ['trailerNumber'],
        orderBy: { trailerNumber: 'asc' }
      })
      return NextResponse.json({ vehicles: vehicles.map(v => v.trailerNumber).filter(Boolean) })
    }

    const vehicles = await db.vehicle.findMany({
      where: whereClause,
      orderBy: [
        { plateNumber: 'asc' },
        { trailerNumber: 'asc' }
      ]
    })

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
}

// POST /api/vehicles - Create new vehicle
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { plateNumber, trailerNumber, driverName, isActive = true } = body

    if (!plateNumber) {
      return NextResponse.json(
        { error: 'Plate number is required' },
        { status: 400 }
      )
    }

    // Check if vehicle already exists
    const existingVehicle = await db.vehicle.findUnique({
      where: { plateNumber }
    })

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle with this plate number already exists' },
        { status: 400 }
      )
    }

    const vehicle = await db.vehicle.create({
      data: {
        plateNumber,
        trailerNumber: trailerNumber || null,
        driverName: driverName || null,
        isActive
      }
    })

    return NextResponse.json({ vehicle }, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    
    if (error instanceof Error && error.message === 'No token provided') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    )
  }
}