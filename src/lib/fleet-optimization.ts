import { db } from './db'

interface OptimizationInput {
  trucks: any[]
  maintenanceRecords: any[]
  routes: any[]
  constraints: {
    maxDailyHours: number
    minRestTime: number
    fuelCostPerGallon: number
    laborCostPerHour: number
    maintenancePriority: 'COST' | 'DOWNTIME' | 'RELIABILITY'
  }
}

interface OptimizationResult {
  recommendations: {
    type: 'MAINTENANCE_SCHEDULING' | 'ROUTE_OPTIMIZATION' | 'FLEET_BALANCING' | 'COST_OPTIMIZATION'
    title: string
    description: string
    impact: {
      costSavings: number
      downtimeReduction: number
      efficiencyImprovement: number
    }
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    implementation: string[]
  }[]
  summary: {
    totalCostSavings: number
    totalDowntimeReduction: number
    totalEfficiencyImprovement: number
    implementationComplexity: 'LOW' | 'MEDIUM' | 'HIGH'
  }
}

interface Route {
  id: string
  truckId: string
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
  distance: number
  estimatedTime: number
  fuelConsumption: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

export class FleetOptimizationEngine {
  /**
   * Main optimization entry point
   */
  static async optimizeFleet(constraints: any): Promise<OptimizationResult> {
    try {
      // Get current fleet data
      const trucks = await db.truck.findMany({
        where: { isDeleted: false, status: 'ACTIVE' },
        include: {
          maintenanceRecords: {
            orderBy: { datePerformed: 'desc' },
            take: 10
          }
        }
      })

      const maintenanceRecords = await db.maintenanceRecord.findMany({
        where: { isDeleted: false },
        orderBy: { datePerformed: 'desc' },
        take: 100
      })

      const input: OptimizationInput = {
        trucks,
        maintenanceRecords,
        routes: [], // Would come from route planning system
        constraints
      }

      // Generate optimization recommendations
      const recommendations = await this.generateRecommendations(input)

      // Calculate summary metrics
      const summary = this.calculateSummary(recommendations)

      return { recommendations, summary }
    } catch (error) {
      console.error('Error in fleet optimization:', error)
      throw error
    }
  }

  /**
   * Generate comprehensive optimization recommendations
   */
  private static async generateRecommendations(input: OptimizationInput): Promise<any[]> {
    const recommendations: any[] = []

    // Maintenance Scheduling Optimization
    const maintenanceRecs = await this.optimizeMaintenanceScheduling(input)
    recommendations.push(...maintenanceRecs)

    // Route Optimization
    const routeRecs = await this.optimizeRoutes(input)
    recommendations.push(...routeRecs)

    // Fleet Balancing
    const balancingRecs = await this.optimizeFleetBalance(input)
    recommendations.push(...balancingRecs)

    // Cost Optimization
    const costRecs = await this.optimizeCosts(input)
    recommendations.push(...costRecs)

    // Sort by priority and impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return b.impact.costSavings - a.impact.costSavings
    })
  }

  /**
   * Optimize maintenance scheduling
   */
  private static async optimizeMaintenanceScheduling(input: OptimizationInput): Promise<any[]> {
    const recommendations: any[] = []

    // Analyze maintenance patterns
    const maintenancePatterns = this.analyzeMaintenancePatterns(input.maintenanceRecords)
    
    // Identify trucks needing immediate attention
    const criticalTrucks = input.trucks.filter(truck => {
      return truck.riskLevel === 'CRITICAL' || (truck.healthScore || 0) < 40
    })

    if (criticalTrucks.length > 0) {
      recommendations.push({
        type: 'MAINTENANCE_SCHEDULING',
        title: 'Critical Maintenance Scheduling',
        description: `${criticalTrucks.length} trucks require immediate maintenance attention to prevent breakdowns`,
        impact: {
          costSavings: criticalTrucks.length * 2500, // Average cost of breakdown
          downtimeReduction: criticalTrucks.length * 8, // Hours
          efficiencyImprovement: 15
        },
        priority: 'CRITICAL',
        implementation: [
          'Schedule maintenance for critical trucks within 24 hours',
          'Prioritize high-risk components (engine, transmission, brakes)',
          'Prepare backup vehicles for critical routes',
          'Monitor trucks closely after maintenance'
        ]
      })
    }

    // Optimize preventive maintenance schedule
    const optimizedSchedule = this.generateOptimizedMaintenanceSchedule(input.trucks, maintenancePatterns)
    
    recommendations.push({
      type: 'MAINTENANCE_SCHEDULING',
      title: 'Preventive Maintenance Optimization',
      description: `Optimized schedule can reduce unplanned downtime by ${optimizedSchedule.downtimeReduction}%`,
      impact: {
        costSavings: optimizedSchedule.costSavings,
        downtimeReduction: optimizedSchedule.downtimeReduction,
        efficiencyImprovement: 12
      },
      priority: 'HIGH',
      implementation: [
        'Implement new maintenance schedule based on usage patterns',
        'Use predictive analytics to time maintenance optimally',
        'Schedule maintenance during off-peak hours',
        'Track maintenance effectiveness and adjust schedule'
      ]
    })

    return recommendations
  }

  /**
   * Optimize routes and fuel efficiency
   */
  private static async optimizeRoutes(input: OptimizationInput): Promise<any[]> {
    const recommendations: any[] = []

    // Analyze fuel efficiency patterns
    const fuelEfficiencyAnalysis = this.analyzeFuelEfficiency(input.trucks)
    
    // Identify inefficient routes
    const inefficientTrucks = input.trucks.filter(truck => {
      return (truck.fuelEfficiency || 0) < 15 // Below 15 MPG
    })

    if (inefficientTrucks.length > 0) {
      recommendations.push({
        type: 'ROUTE_OPTIMIZATION',
        title: 'Fuel Efficiency Improvement',
        description: `${inefficientTrucks.length} trucks show poor fuel efficiency`,
        impact: {
          costSavings: inefficientTrucks.length * 1200, // Annual fuel savings
          downtimeReduction: 0,
          efficiencyImprovement: 8
        },
        priority: 'MEDIUM',
        implementation: [
          'Conduct fuel efficiency audits on underperforming trucks',
          'Optimize routes to reduce idling and stop-and-go traffic',
          'Implement driver training for fuel-efficient driving',
          'Consider vehicle replacement for chronically inefficient trucks'
        ]
      })
    }

    // Route clustering optimization
    const routeOptimization = this.optimizeRouteClustering(input.trucks)
    
    recommendations.push({
      type: 'ROUTE_OPTIMIZATION',
      title: 'Route Clustering Optimization',
      description: `Optimize route assignments to reduce total travel distance by ${routeOptimization.distanceReduction}%`,
      impact: {
        costSavings: routeOptimization.fuelSavings,
        downtimeReduction: routeOptimization.timeSavings,
        efficiencyImprovement: 10
      },
      priority: 'MEDIUM',
      implementation: [
        'Group nearby destinations together',
        'Optimize delivery sequences',
        'Use real-time traffic data for dynamic routing',
        'Implement route optimization software'
      ]
    })

    return recommendations
  }

  /**
   * Optimize fleet balance and utilization
   */
  private static async optimizeFleetBalance(input: OptimizationInput): Promise<any[]> {
    const recommendations: any[] = []

    // Analyze fleet utilization
    const utilizationAnalysis = this.analyzeFleetUtilization(input.trucks)
    
    // Identify underutilized vehicles
    const underutilized = input.trucks.filter(truck => {
      return utilizationAnalysis.utilization.get(truck.id) || 0 < 0.3 // Less than 30% utilization
    })

    if (underutilized.length > 0) {
      recommendations.push({
        type: 'FLEET_BALANCING',
        title: 'Fleet Right-Sizing',
        description: `${underutilized.length} trucks are underutilized, consider downsizing or reallocating`,
        impact: {
          costSavings: underutilized.length * 8000, // Annual cost per underutilized truck
          downtimeReduction: 0,
          efficiencyImprovement: 5
        },
        priority: 'MEDIUM',
        implementation: [
          'Sell or lease underutilized vehicles',
          'Reallocate trucks to high-demand routes',
          'Implement flexible scheduling to improve utilization',
          'Consider rental options for peak demand periods'
        ]
      })
    }

    // Age-based fleet renewal
    const agingTrucks = input.trucks.filter(truck => {
      const age = new Date().getFullYear() - truck.year
      return age > 10 // Older than 10 years
    })

    if (agingTrucks.length > 0) {
      recommendations.push({
        type: 'FLEET_BALANCING',
        title: 'Fleet Renewal Program',
        description: `${agingTrucks.length} trucks are over 10 years old, consider replacement`,
        impact: {
          costSavings: agingTrucks.length * 3000, // Maintenance cost reduction
          downtimeReduction: agingTrucks.length * 5,
          efficiencyImprovement: 15
        },
        priority: 'HIGH',
        implementation: [
          'Develop phased replacement plan for aging trucks',
          'Prioritize replacement of high-mileage vehicles',
          'Consider newer, more fuel-efficient models',
          'Calculate total cost of ownership for replacement decisions'
        ]
      })
    }

    return recommendations
  }

  /**
   * Optimize costs across the fleet
   */
  private static async optimizeCosts(input: OptimizationInput): Promise<any[]> {
    const recommendations: any[] = []

    // Maintenance cost optimization
    const costAnalysis = this.analyzeMaintenanceCosts(input.maintenanceRecords)
    
    recommendations.push({
      type: 'COST_OPTIMIZATION',
      title: 'Maintenance Cost Optimization',
      description: `Implement cost-saving measures to reduce maintenance expenses by ${costAnalysis.potentialSavings}%`,
      impact: {
        costSavings: costAnalysis.potentialSavings,
        downtimeReduction: costAnalysis.downtimeReduction,
        efficiencyImprovement: 8
      },
      priority: 'HIGH',
      implementation: [
        'Negotiate bulk purchasing discounts with parts suppliers',
        'Implement preventive maintenance to reduce emergency repairs',
        'Train in-house mechanics for common repairs',
        'Use predictive maintenance to optimize timing'
      ]
    })

    // Fuel cost optimization
    const fuelOptimization = this.optimizeFuelCosts(input.trucks)
    
    recommendations.push({
      type: 'COST_OPTIMIZATION',
      title: 'Fuel Cost Management',
      description: `Implement fuel management strategies to reduce fuel costs by ${fuelOptimization.savings}%`,
      impact: {
        costSavings: fuelOptimization.savings,
        downtimeReduction: 0,
        efficiencyImprovement: 6
      },
      priority: 'MEDIUM',
      implementation: [
        'Implement fuel card program with discounts',
        'Monitor fuel consumption and identify anomalies',
        'Optimize routes to reduce fuel consumption',
        'Consider alternative fuel vehicles for new purchases'
      ]
    })

    return recommendations
  }

  /**
   * Analyze maintenance patterns
   */
  private static analyzeMaintenancePatterns(maintenanceRecords: any[]) {
    const patterns = {
      averageCostPerMaintenance: 0,
      frequencyByType: new Map<string, number>(),
      seasonalTrends: new Map<string, number>(),
      commonFailureModes: new Map<string, number>()
    }

    if (maintenanceRecords.length === 0) return patterns

    // Calculate average cost
    patterns.averageCostPerMaintenance = maintenanceRecords.reduce(
      (sum, record) => sum + (record.totalCost || 0), 0
    ) / maintenanceRecords.length

    // Analyze frequency by type
    maintenanceRecords.forEach(record => {
      const type = record.serviceType
      patterns.frequencyByType.set(type, (patterns.frequencyByType.get(type) || 0) + 1)
    })

    // Analyze seasonal trends
    maintenanceRecords.forEach(record => {
      const month = new Date(record.datePerformed).getMonth()
      const season = Math.floor(month / 3) // 0: Winter, 1: Spring, 2: Summer, 3: Fall
      const seasonName = ['Winter', 'Spring', 'Summer', 'Fall'][season]
      patterns.seasonalTrends.set(seasonName, (patterns.seasonalTrends.get(seasonName) || 0) + 1)
    })

    // Analyze common failure modes
    maintenanceRecords.forEach(record => {
      if (record.failureMode) {
        patterns.commonFailureModes.set(record.failureMode, (patterns.commonFailureModes.get(record.failureMode) || 0) + 1)
      }
    })

    return patterns
  }

  /**
   * Generate optimized maintenance schedule
   */
  private static generateOptimizedMaintenanceSchedule(trucks: any[], patterns: any) {
    // This is a simplified version - in practice, this would use sophisticated algorithms
    const costSavings = trucks.length * 500 // Average savings per truck
    const downtimeReduction = 15 // Percentage reduction in downtime

    return { costSavings, downtimeReduction }
  }

  /**
   * Analyze fuel efficiency
   */
  private static analyzeFuelEfficiency(trucks: any[]) {
    const analysis = {
      averageFuelEfficiency: 0,
      efficientTrucks: 0,
      inefficientTrucks: 0,
      potentialSavings: 0
    }

    const trucksWithFuelData = trucks.filter(t => t.fuelEfficiency)
    
    if (trucksWithFuelData.length === 0) return analysis

    analysis.averageFuelEfficiency = trucksWithFuelData.reduce(
      (sum, truck) => sum + (truck.fuelEfficiency || 0), 0
    ) / trucksWithFuelData.length

    analysis.efficientTrucks = trucksWithFuelData.filter(t => (t.fuelEfficiency || 0) >= 20).length
    analysis.inefficientTrucks = trucksWithFuelData.filter(t => (t.fuelEfficiency || 0) < 15).length

    // Calculate potential savings
    analysis.potentialSavings = analysis.inefficientTrucks * 1200 // Annual savings per truck

    return analysis
  }

  /**
   * Optimize route clustering
   */
  private static optimizeRouteClustering(trucks: any[]) {
    // Simplified route optimization
    return {
      distanceReduction: 12, // Percentage
      fuelSavings: trucks.length * 800,
      timeSavings: trucks.length * 2 // Hours per truck
    }
  }

  /**
   * Analyze fleet utilization
   */
  private static analyzeFleetUtilization(trucks: any[]) {
    const utilization = new Map<string, number>()
    
    // Simplified utilization calculation
    trucks.forEach(truck => {
      // In practice, this would be based on actual usage data
      const simulatedUtilization = 0.3 + Math.random() * 0.6 // 30-90% utilization
      utilization.set(truck.id, simulatedUtilization)
    })

    return { utilization }
  }

  /**
   * Analyze maintenance costs
   */
  private static analyzeMaintenanceCosts(maintenanceRecords: any[]) {
    if (maintenanceRecords.length === 0) {
      return { potentialSavings: 0, downtimeReduction: 0 }
    }

    const totalCost = maintenanceRecords.reduce((sum, record) => sum + (record.totalCost || 0), 0)
    const potentialSavings = totalCost * 0.15 // 15% potential savings
    const downtimeReduction = 10 // 10% reduction in downtime

    return { potentialSavings, downtimeReduction }
  }

  /**
   * Optimize fuel costs
   */
  private static optimizeFuelCosts(trucks: any[]) {
    const totalTrucks = trucks.length
    const savings = totalTrucks * 600 // Average fuel savings per truck
    
    return { savings }
  }

  /**
   * Calculate optimization summary
   */
  private static calculateSummary(recommendations: any[]) {
    const summary = {
      totalCostSavings: 0,
      totalDowntimeReduction: 0,
      totalEfficiencyImprovement: 0,
      implementationComplexity: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH'
    }

    recommendations.forEach(rec => {
      summary.totalCostSavings += rec.impact.costSavings
      summary.totalDowntimeReduction += rec.impact.downtimeReduction
      summary.totalEfficiencyImprovement += rec.impact.efficiencyImprovement
    })

    // Determine implementation complexity
    const highComplexityRecs = recommendations.filter(r => r.implementation.length > 4).length
    const totalRecs = recommendations.length
    
    if (highComplexityRecs / totalRecs > 0.5) {
      summary.implementationComplexity = 'HIGH'
    } else if (highComplexityRecs / totalRecs > 0.25) {
      summary.implementationComplexity = 'MEDIUM'
    }

    return summary
  }

  /**
   * Get fleet optimization dashboard data
   */
  static async getOptimizationDashboard() {
    try {
      const constraints = {
        maxDailyHours: 12,
        minRestTime: 8,
        fuelCostPerGallon: 3.50,
        laborCostPerHour: 65,
        maintenancePriority: 'COST'
      }

      const optimization = await this.optimizeFleet(constraints)
      
      // Get current fleet metrics
      const trucks = await db.truck.findMany({
        where: { isDeleted: false, status: 'ACTIVE' },
        select: {
          id: true,
          vin: true,
          make: true,
          model: true,
          licensePlate: true,
          healthScore: true,
          fuelEfficiency: true,
          currentMileage: true,
          year: true
        }
      })

      const fleetMetrics = {
        totalTrucks: trucks.length,
        averageHealthScore: trucks.reduce((sum, t) => sum + (t.healthScore || 0), 0) / trucks.length,
        averageFuelEfficiency: trucks.reduce((sum, t) => sum + (t.fuelEfficiency || 0), 0) / trucks.filter(t => t.fuelEfficiency).length,
        averageAge: new Date().getFullYear() - trucks.reduce((sum, t) => sum + t.year, 0) / trucks.length,
        totalMileage: trucks.reduce((sum, t) => sum + (t.currentMileage || 0), 0)
      }

      return {
        optimization,
        fleetMetrics,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting optimization dashboard:', error)
      throw error
    }
  }
}