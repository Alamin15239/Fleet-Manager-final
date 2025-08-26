'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  RefreshCw,
  Settings,
  Eye,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Truck,
  User,
  Package,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react'
import { format } from 'date-fns'
import { apiGet } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'summary' | 'detailed' | 'analytical' | 'custom'
  sections: string[]
}

interface ReportConfig {
  template: string
  dateRange: {
    start: string
    end: string
  }
  filters: {
    manufacturer?: string
    origin?: string
    plateNumber?: string
    driverName?: string
  }
  includeCharts: boolean
  format: 'pdf' | 'excel' | 'csv'
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview for management',
    type: 'summary',
    sections: ['overview', 'key-metrics', 'top-performers', 'recommendations']
  },
  {
    id: 'detailed-inventory',
    name: 'Detailed Inventory Report',
    description: 'Complete tire inventory with all details',
    type: 'detailed',
    sections: ['inventory-list', 'vehicle-breakdown', 'cost-analysis', 'maintenance-schedule']
  },
  {
    id: 'manufacturer-analysis',
    name: 'Manufacturer Analysis',
    description: 'Performance analysis by tire manufacturer',
    type: 'analytical',
    sections: ['manufacturer-stats', 'cost-comparison', 'durability-analysis', 'recommendations']
  },
  {
    id: 'vehicle-performance',
    name: 'Vehicle Performance Report',
    description: 'Tire usage and performance by vehicle',
    type: 'analytical',
    sections: ['vehicle-stats', 'usage-patterns', 'cost-per-vehicle', 'maintenance-needs']
  },
  {
    id: 'custom-report',
    name: 'Custom Report',
    description: 'Build your own custom report',
    type: 'custom',
    sections: []
  }
]

export default function ProfessionalReportGenerator() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    template: '',
    dateRange: {
      start: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 90 days ago instead of 30
      end: format(new Date(), 'yyyy-MM-dd')
    },
    filters: {},
    includeCharts: true,
    format: 'pdf'
  })
  const [showPreview, setShowPreview] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Available filter options
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [origins] = useState(['CHINESE', 'JAPANESE', 'EUROPEAN', 'AMERICAN', 'OTHER'])
  const [plates, setPlates] = useState<string[]>([])
  const [drivers, setDrivers] = useState<string[]>([])

  useEffect(() => {
    console.log('ProfessionalReportGenerator mounted')
    console.log('Authentication state:', { isAuthenticated, isLoading, user })
    
    if (isLoading) return
    
    if (!isAuthenticated) {
      console.log('User not authenticated, component should not be visible')
      return
    }
    
    console.log('User is authenticated, fetching filter options')
    fetchFilterOptions()
  }, [isAuthenticated, isLoading, user])

  const fetchFilterOptions = async () => {
    console.log('Fetching filter options...')
    try {
      const response = await apiGet('/api/tires?limit=1000')
      console.log('Filter options response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Filter options data received:', data)
        const allTires = data.tires || []

        const uniqueManufacturers = [...new Set(allTires.map((t: any) => t.manufacturer))]
        const uniquePlates = [...new Set(allTires.map((t: any) => t.plateNumber))]
        const uniqueDrivers = [...new Set(allTires.map((t: any) => t.driverName).filter(Boolean))]

        console.log('Unique manufacturers:', uniqueManufacturers)
        console.log('Unique plates:', uniquePlates)
        console.log('Unique drivers:', uniqueDrivers)

        setManufacturers(uniqueManufacturers.sort())
        setPlates(uniquePlates.sort())
        setDrivers(uniqueDrivers.sort())
      } else {
        console.error('Failed to fetch filter options:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const generateReport = async () => {
    if (!reportConfig.template) {
      setError('Please select a report template')
      return
    }

    setGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('Starting report generation...')
      // Build query parameters
      const params = new URLSearchParams({
        template: reportConfig.template,
        startDate: reportConfig.dateRange.start,
        endDate: reportConfig.dateRange.end,
        includeCharts: reportConfig.includeCharts.toString(),
        format: reportConfig.format
      })

      Object.entries(reportConfig.filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value)
      })

      const apiUrl = `/api/tires/reports/generate?${params}`
      console.log('Making request to:', apiUrl)

      const response = await apiGet(apiUrl)
      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Report data received:', data)
        
        // Check if we have valid data
        if (!data.tires || data.tires.length === 0) {
          setReportData({
            ...data,
            isEmpty: true
          })
          setSuccess('Report generated successfully - no data found for selected criteria')
        } else {
          setReportData(data)
          setSuccess('Report generated successfully')
        }
        setShowPreview(true)
      } else {
        const errorData = await response.json()
        console.error('Report generation error:', errorData)
        setError(errorData.error || 'Failed to generate report')
        if (errorData.details) {
          console.error('Error details:', errorData.details)
        }
      }
    } catch (error) {
      console.error('Report generation exception:', error)
      setError('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = async () => {
    if (!reportData) return

    // Check if data is empty
    if (reportData.isEmpty) {
      setError('Cannot download report - no data available')
      return
    }

    try {
      // Create report content based on format
      let content: string | Blob
      let filename: string
      let mimeType: string

      if (reportConfig.format === 'csv') {
        content = generateCSVContent()
        filename = `tire-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
        mimeType = 'text/csv'
      } else if (reportConfig.format === 'excel') {
        content = generateExcelContent()
        filename = `tire-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      } else {
        content = await generatePDFContent()
        filename = `tire-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
        
        // Check if content is a Blob (PDF) or string (fallback)
        if (content instanceof Blob) {
          mimeType = 'application/pdf'
        } else {
          mimeType = 'text/plain'
          filename = `tire-report-${format(new Date(), 'yyyy-MM-dd')}.txt`
        }
      }

      // Create and download file
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setSuccess('Report downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      setError('Failed to download report')
    }
  }

  const generateCSVContent = () => {
    const headers = ['Report Date', 'Template', 'Date Range', 'Total Tires', 'Total Vehicles', 'Total Drivers']
    const rows = [
      headers.join(','),
      [
        format(new Date(), 'yyyy-MM-dd'),
        reportConfig.template,
        `${reportConfig.dateRange.start} to ${reportConfig.dateRange.end}`,
        reportData.summary?.totalTires || 0,
        reportData.summary?.totalVehicles || 0,
        reportData.summary?.totalDrivers || 0
      ].join(',')
    ]

    if (reportData.tires) {
      rows.push('')
      rows.push(['Tire Size', 'Manufacturer', 'Origin', 'Plate Number', 'Driver Name', 'Quantity', 'Created Date'].join(','))
      reportData.tires.forEach((tire: any) => {
        rows.push([
          tire.tireSize,
          tire.manufacturer,
          tire.origin,
          tire.plateNumber,
          tire.driverName || '',
          tire.quantity,
          format(new Date(tire.createdAt), 'yyyy-MM-dd')
        ].join(','))
      })
    }

    return rows.join('\n')
  }

  const generateExcelContent = () => {
    // Simplified Excel content (in real app, use a library like xlsx)
    return generateCSVContent()
  }

  const generatePDFContent = async () => {
    // Import jsPDF dynamically to avoid SSR issues
    let jsPDF: any = null
    
    if (typeof window !== 'undefined') {
      try {
        const pdfModule = await import('jspdf')
        jsPDF = pdfModule.jsPDF
      } catch (error) {
        console.error('Failed to load jsPDF:', error)
      }
    }
    
    if (!jsPDF) {
      // Fallback to text content if jsPDF is not available
      return generateTextContent()
    }

    try {
      const doc = new jsPDF()
      
      // Set up the document
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // Helper function to add text with word wrap
      const addText = (text: string, x: number, y: number, size: number = 12, isBold: boolean = false) => {
        doc.setFontSize(size)
        doc.setFont(isBold ? 'helvetica' : 'helvetica', isBold ? 'bold' : 'normal')
        
        const lines = doc.splitTextToSize(text, pageWidth - 40)
        doc.text(lines, x, y)
        return lines.length * size * 0.5 + 5
      }

      // Add title
      yPosition += addText('TIRE MANAGEMENT REPORT', 20, yPosition, 20, true)
      yPosition += 10

      // Add subtitle
      yPosition += addText(`${reportTemplates.find(t => t.id === reportConfig.template)?.name}`, 20, yPosition, 14, true)
      yPosition += 5

      // Add date range
      yPosition += addText(`Date Range: ${reportConfig.dateRange.start} to ${reportConfig.dateRange.end}`, 20, yPosition, 10)
      yPosition += addText(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, yPosition, 10)
      yPosition += 15

      // Add Executive Summary
      yPosition += addText('EXECUTIVE SUMMARY', 20, yPosition, 16, true)
      yPosition += 10

      // Add summary statistics
      if (reportData.summary) {
        const summaryText = [
          `Total Tires: ${reportData.summary?.totalTires || 0}`,
          `Total Vehicles: ${reportData.summary?.totalVehicles || 0}`,
          `Total Drivers: ${reportData.summary?.totalDrivers || 0}`,
          `Average Tires per Vehicle: ${reportData.summary?.averageTiresPerVehicle || 0}`,
          `Manufacturers: ${reportData.summary?.manufacturers || 0}`,
          `Origins: ${reportData.summary?.origins || 0}`
        ]

        summaryText.forEach(text => {
          yPosition += addText(text, 20, yPosition, 11)
        })
      }

      yPosition += 15

      // Add Detailed Inventory section
      yPosition += addText('DETAILED INVENTORY', 20, yPosition, 16, true)
      yPosition += 10

      if (reportData.tires && reportData.tires.length > 0) {
        // Add table headers
        const headers = ['Tire Details', 'Vehicle', 'Driver', 'Origin', 'Qty', 'Created']
        const colWidths = [40, 30, 25, 20, 15, 30]
        let xPosition = 20

        headers.forEach((header, index) => {
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text(header, xPosition, yPosition)
          xPosition += colWidths[index]
        })
        yPosition += 8

        // Add table rows
        reportData.tires.slice(0, 20).forEach((tire: any) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = 20
          }

          xPosition = 20
          const row = [
            `${tire.manufacturer} ${tire.tireSize}`,
            tire.plateNumber,
            tire.driverName || 'N/A',
            tire.origin,
            tire.quantity.toString(),
            format(new Date(tire.createdAt), 'MMM dd')
          ]

          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          
          row.forEach((cell, index) => {
            doc.text(cell, xPosition, yPosition)
            xPosition += colWidths[index]
          })
          yPosition += 6
        })

        if (reportData.tires.length > 20) {
          yPosition += addText(`Showing first 20 of ${reportData.tires.length} records`, 20, yPosition, 9)
        }
      } else {
        yPosition += addText('No tire data available', 20, yPosition, 11)
      }

      yPosition += 15

      // Add Recommendations section
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 20
      }

      yPosition += addText('RECOMMENDATIONS', 20, yPosition, 16, true)
      yPosition += 10

      const recommendations = [
        '• Implement regular tire maintenance schedule',
        '• Monitor tire wear patterns and replace proactively',
        '• Maintain detailed records for warranty claims',
        '• Consider bulk purchasing for cost optimization',
        '• Train drivers on proper tire inspection procedures'
      ]

      recommendations.forEach(rec => {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
        yPosition += addText(rec, 20, yPosition, 10)
      })

      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10)
        doc.text('Generated by Tire Management System', 20, pageHeight - 10)
      }

      // Return the PDF as a blob
      return doc.output('blob')
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to text content
      return generateTextContent()
    }
  }

  const generateTextContent = () => {
    // Fallback text content
    return `
TIRE MANAGEMENT REPORT
========================

Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}
Template: ${reportConfig.template}
Date Range: ${reportConfig.dateRange.start} to ${reportConfig.dateRange.end}

EXECUTIVE SUMMARY
================
Total Tires: ${reportData.summary?.totalTires || 0}
Total Vehicles: ${reportData.summary?.totalVehicles || 0}
Total Drivers: ${reportData.summary?.totalDrivers || 0}

DETAILED INVENTORY
==================
${reportData.tires ? reportData.tires.map((tire: any, index: number) => `
${index + 1}. ${tire.manufacturer} ${tire.tireSize}
   Vehicle: ${tire.plateNumber}
   Driver: ${tire.driverName || 'N/A'}
   Origin: ${tire.origin}
   Quantity: ${tire.quantity}
   Created: ${format(new Date(tire.createdAt), 'yyyy-MM-dd')}
`).join('') : 'No tire data available'}

RECOMMENDATIONS
==============
1. Regular tire maintenance schedule should be followed
2. Monitor tire wear and replace as needed
3. Keep detailed records for warranty claims
4. Consider bulk purchasing for cost savings
    `
  }

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'summary': return <BarChart3 className="h-5 w-5" />
      case 'detailed': return <FileText className="h-5 w-5" />
      case 'analytical': return <TrendingUp className="h-5 w-5" />
      case 'custom': return <Settings className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const resetFilters = () => {
    setReportConfig({
      template: '',
      dateRange: {
        start: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
      },
      filters: {},
      includeCharts: true,
      format: 'pdf'
    })
    setError(null)
    setSuccess(null)
    setReportData(null)
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-gray-600 mb-4">
            Please log in to access the report generator.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Generator</h1>
          <p className="text-muted-foreground">Generate professional tire management reports</p>
        </div>
        <Button variant="outline" onClick={() => {
          console.log('Reset button clicked')
          resetFilters()
        }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Report Template</Label>
              {reportConfig.template && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Selected: {reportTemplates.find(t => t.id === reportConfig.template)?.name}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                    reportConfig.template === template.id
                      ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => {
                    console.log('Template clicked:', template.id)
                    setReportConfig({ ...reportConfig, template: template.id })
                    // Add visual feedback
                    setError(null)
                    setSuccess(`Selected: ${template.name}`)
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getTemplateIcon(template.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{template.type}</Badge>
                      {reportConfig.template === template.id && (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={reportConfig.dateRange.start}
                onChange={(e) => setReportConfig({
                  ...reportConfig,
                  dateRange: { ...reportConfig.dateRange, start: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={reportConfig.dateRange.end}
                onChange={(e) => setReportConfig({
                  ...reportConfig,
                  dateRange: { ...reportConfig.dateRange, end: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters (Optional)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Select value={reportConfig.filters.manufacturer || ''} onValueChange={(value) => 
                  setReportConfig({
                    ...reportConfig,
                    filters: { ...reportConfig.filters, manufacturer: value === 'all' ? undefined : value }
                  })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All manufacturers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All manufacturers</SelectItem>
                    {manufacturers.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Origin</Label>
                <Select value={reportConfig.filters.origin || ''} onValueChange={(value) => 
                  setReportConfig({
                    ...reportConfig,
                    filters: { ...reportConfig.filters, origin: value === 'all' ? undefined : value }
                  })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All origins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All origins</SelectItem>
                    {origins.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Plate Number</Label>
                <Select value={reportConfig.filters.plateNumber || ''} onValueChange={(value) => 
                  setReportConfig({
                    ...reportConfig,
                    filters: { ...reportConfig.filters, plateNumber: value === 'all' ? undefined : value }
                  })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All vehicles</SelectItem>
                    {plates.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Driver Name</Label>
                <Select value={reportConfig.filters.driverName || ''} onValueChange={(value) => 
                  setReportConfig({
                    ...reportConfig,
                    filters: { ...reportConfig.filters, driverName: value === 'all' ? undefined : value }
                  })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="All drivers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All drivers</SelectItem>
                    {drivers.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Output Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Include Charts</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => setReportConfig({ ...reportConfig, includeCharts: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="includeCharts">Include charts and graphs in report</Label>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Output Format</Label>
              <Select value={reportConfig.format} onValueChange={(value: any) => 
                setReportConfig({ ...reportConfig, format: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Preview button clicked')
                console.log('Report data available:', !!reportData)
                setShowPreview(true)
              }}
              disabled={!reportData}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button 
              onClick={() => {
                console.log('Generate Report button clicked')
                console.log('Current config:', reportConfig)
                generateReport()
              }}
              disabled={generating || !reportConfig.template}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              Preview of your generated report
            </DialogDescription>
          </DialogHeader>
          
          {reportData && (
            <>
              {/* Empty Data Message */}
              {reportData.isEmpty && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
                  <p className="text-gray-600 mb-4">
                    No tire data found for the selected criteria and date range.
                  </p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your filters or date range to include more data.
                  </p>
                </div>
              )}

              {/* Report Content - Only show if not empty */}
              {!reportData.isEmpty && (
                <div className="space-y-6">
                  {/* Report Header */}
                  <div className="text-center space-y-2 border-b pb-4">
                    <h1 className="text-2xl font-bold">TIRE MANAGEMENT REPORT</h1>
                    <p className="text-gray-600">
                      {reportTemplates.find(t => t.id === reportConfig.template)?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reportConfig.dateRange.start} to {reportConfig.dateRange.end}
                    </p>
                  </div>

                  {/* Executive Summary */}
                  {reportData.summary && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Executive Summary</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {reportData.summary.totalTires || 0}
                          </div>
                          <div className="text-sm text-gray-600">Total Tires</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {reportData.summary.totalVehicles || 0}
                          </div>
                          <div className="text-sm text-gray-600">Vehicles</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {reportData.summary.totalDrivers || 0}
                          </div>
                          <div className="text-sm text-gray-600">Drivers</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {reportData.summary.averageTiresPerVehicle || 0}
                          </div>
                          <div className="text-sm text-gray-600">Avg Tires/Vehicle</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Data */}
                  {reportData.tires && reportData.tires.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Detailed Tire Inventory</h2>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tire Details</TableHead>
                              <TableHead>Vehicle</TableHead>
                              <TableHead>Driver</TableHead>
                              <TableHead>Origin</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Created</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reportData.tires.slice(0, 10).map((tire: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{tire.manufacturer}</div>
                                    <div className="text-sm text-gray-500">{tire.tireSize}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-gray-400" />
                                    {tire.plateNumber}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    {tire.driverName || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{tire.origin}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-400" />
                                    {tire.quantity}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {format(new Date(tire.createdAt), 'MMM dd, yyyy')}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {reportData.tires.length > 10 && (
                        <p className="text-sm text-gray-500 text-center">
                          Showing first 10 of {reportData.tires.length} records
                        </p>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Recommendations</h2>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <ul className="space-y-2 text-sm">
                        <li>• Implement regular tire maintenance schedule</li>
                        <li>• Monitor tire wear patterns and replace proactively</li>
                        <li>• Maintain detailed records for warranty claims</li>
                        <li>• Consider bulk purchasing for cost optimization</li>
                        <li>• Train drivers on proper tire inspection procedures</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button onClick={downloadReport} disabled={reportData?.isEmpty}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}