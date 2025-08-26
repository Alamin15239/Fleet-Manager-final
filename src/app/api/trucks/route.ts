import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all trucks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const skip = (page - 1) * limit

    const whereClause: any = {
      isDeleted: false
    }

    if (search) {
      whereClause.OR = [
        { vin: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
        { licensePlate: { contains: search } }
      ]
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (!includeInactive) {
      whereClause.status = { not: 'INACTIVE' }
    }

    const [trucks, totalCount] = await Promise.all([
      db.truck.findMany({
        where: whereClause,
        include: {
          maintenanceRecords: {
            take: 5,
            orderBy: { datePerformed: 'desc' }
          },
          _count: {
            select: {
              maintenanceRecords: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.truck.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: trucks,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching trucks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trucks' },
      { status: 500 }
    )
  }
}

// POST create new truck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received truck data:', body)

    // TEMPORARY: Remove all validation to test if truck creation works
    console.log('Skipping validation for testing')

    // Check if VIN already exists
    const existingTruck = await db.truck.findFirst({
      where: { 
        vin: body.vin,
        isDeleted: false
      }
    })

    if (existingTruck) {
      console.log('VIN already exists:', body.vin)
      return NextResponse.json(
        { error: 'Truck with this VIN already exists' },
        { status: 400 }
      )
    }

    // Check if license plate already exists
    const existingLicensePlate = await db.truck.findFirst({
      where: { 
        licensePlate: body.licensePlate,
        isDeleted: false
      }
    })

    if (existingLicensePlate) {
      console.log('License plate already exists:', body.licensePlate)
      return NextResponse.json(
        { error: 'Truck with this license plate already exists' },
        { status: 400 }
      )
    }

    // Create truck
    const truck = await db.truck.create({
      data: {
        vin: body.vin,
        make: body.make,
        model: body.model,
        year: parseInt(body.year),
        licensePlate: body.licensePlate,
        currentMileage: parseInt(body.currentMileage) || 0,
        status: body.status || 'ACTIVE',
        image: body.image,
        documents: body.documents,
        engineHours: body.engineHours ? parseInt(body.engineHours) : null,
        healthScore: body.healthScore ? parseFloat(body.healthScore) : null,
        riskLevel: body.riskLevel || 'LOW',
        fuelEfficiency: body.fuelEfficiency ? parseFloat(body.fuelEfficiency) : null,
        avgDailyMileage: body.avgDailyMileage ? parseFloat(body.avgDailyMileage) : null,
        lastOilChange: body.lastOilChange ? new Date(body.lastOilChange) : null,
        nextOilChange: body.nextOilChange ? new Date(body.nextOilChange) : null,
        lastInspection: body.lastInspection ? new Date(body.lastInspection) : null,
        nextInspection: body.nextInspection ? new Date(body.nextInspection) : null
      },
      include: {
        maintenanceRecords: {
          take: 5,
          orderBy: { datePerformed: 'desc' }
        }
      }
    })

    console.log('Truck created successfully:', truck.id)
    return NextResponse.json({
      success: true,
      data: truck,
      message: 'Truck created successfully'
    })

  } catch (error) {
    console.error('Error creating truck:', error)
    return NextResponse.json(
      { error: 'Failed to create truck' },
      { status: 500 }
    )
  }
}