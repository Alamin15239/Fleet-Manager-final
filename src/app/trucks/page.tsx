'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Truck, Plus, Edit, Eye, Paperclip, Trash2, Wrench, AlertTriangle, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { FileUpload } from '@/components/file-upload'
import { usePermissions } from '@/contexts/permissions-context'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

interface Truck {
  id: string
  vin: string
  make: string
  model: string
  year: number
  licensePlate: string
  currentMileage: number
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
  image?: string
  documents?: any[]
  createdAt: string
  updatedAt: string
}

interface DashboardStats {
  totalTrucks: number
  activeTrucks: number
  upcomingMaintenance: number
  overdueRepairs: number
  totalMaintenanceCost: number
}

export default function TrucksPage() {
  const { canAccess, canCreate, canUpdate, canDelete, loading: permissionsLoading } = usePermissions()
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTrucks: 0,
    activeTrucks: 0,
    upcomingMaintenance: 0,
    overdueRepairs: 0,
    totalMaintenanceCost: 0
  })
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null)
  const [truckDocuments, setTruckDocuments] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    currentMileage: 0,
    status: 'ACTIVE' as const
  })
  
  const [validationErrors, setValidationErrors] = useState({
    vin: '',
    licensePlate: ''
  })
  
  const [isCheckingVin, setIsCheckingVin] = useState(false)
  const [isCheckingLicensePlate, setIsCheckingLicensePlate] = useState(false)
  
  // Simple validation state
  const [isFormValid, setIsFormValid] = useState(false)

  // Simple validation checker
  useEffect(() => {
    const hasRequiredFields = formData.vin && formData.make && formData.model && formData.licensePlate
    const hasNoErrors = !validationErrors.vin && !validationErrors.licensePlate
    const isNotChecking = !isCheckingVin && !isCheckingLicensePlate
    const isValid = hasRequiredFields && hasNoErrors && isNotChecking
    setIsFormValid(isValid)
    
    console.log('Validation state:', {
      hasRequiredFields,
      hasNoErrors,
      isNotChecking,
      isValid,
      formData,
      validationErrors
    })
  }, [formData, validationErrors, isCheckingVin, isCheckingLicensePlate])

  useEffect(() => {
    fetchDashboardStats()
    fetchTrucks()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await apiGet('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setDashboardStats({
          totalTrucks: data.totalTrucks || 0,
          activeTrucks: data.activeTrucks || 0,
          upcomingMaintenance: data.upcomingMaintenance || 0,
          overdueRepairs: data.overdueRepairs || 0,
          totalMaintenanceCost: data.totalMaintenanceCost || 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const checkVinExists = async (vin: string) => {
    if (!vin || vin.length < 5) {
      setValidationErrors(prev => ({ ...prev, vin: '' }))
      return
    }
    
    setIsCheckingVin(true)
    try {
      const response = await apiGet(`/api/trucks?search=${vin}`)
      if (response.ok) {
        const data = await response.json()
        const existingTruck = data.data?.find((truck: any) => 
          truck.vin.toLowerCase() === vin.toLowerCase()
        )
        
        if (existingTruck && (!editingTruck || existingTruck.id !== editingTruck.id)) {
          console.log('VIN validation failed - already exists:', vin)
          setValidationErrors(prev => ({ ...prev, vin: 'This VIN already exists' }))
        } else {
          console.log('VIN validation passed:', vin)
          setValidationErrors(prev => ({ ...prev, vin: '' }))
        }
      }
    } catch (error) {
      console.error('Error checking VIN:', error)
    } finally {
      setIsCheckingVin(false)
    }
  }

  const checkLicensePlateExists = async (licensePlate: string) => {
    if (!licensePlate || licensePlate.length < 2) {
      setValidationErrors(prev => ({ ...prev, licensePlate: '' }))
      return
    }
    
    setIsCheckingLicensePlate(true)
    try {
      const response = await apiGet(`/api/trucks?search=${licensePlate}`)
      if (response.ok) {
        const data = await response.json()
        const existingTruck = data.data?.find((truck: any) => 
          truck.licensePlate.toLowerCase() === licensePlate.toLowerCase()
        )
        
        if (existingTruck && (!editingTruck || existingTruck.id !== editingTruck.id)) {
          console.log('License plate validation failed - already exists:', licensePlate)
          setValidationErrors(prev => ({ ...prev, licensePlate: 'This license plate already exists' }))
        } else {
          console.log('License plate validation passed:', licensePlate)
          setValidationErrors(prev => ({ ...prev, licensePlate: '' }))
        }
      }
    } catch (error) {
      console.error('Error checking license plate:', error)
    } finally {
      setIsCheckingLicensePlate(false)
    }
  }

  // Debounced check functions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.vin) {
        checkVinExists(formData.vin)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [formData.vin])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.licensePlate) {
        checkLicensePlateExists(formData.licensePlate)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [formData.licensePlate])

  const fetchTrucks = async () => {
    try {
      const response = await apiGet('/api/trucks')
      if (response.ok) {
        const data = await response.json()
        // API returns { success: true, data: trucks, pagination: ... }
        setTrucks(data.data || [])
        // Also refresh dashboard stats to ensure consistency
        fetchDashboardStats()
      } else {
        toast.error('Failed to fetch trucks')
      }
    } catch (error) {
      console.error('Error fetching trucks:', error)
      toast.error('Failed to fetch trucks')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission started')
    console.log('Form data:', formData)
    console.log('Validation errors:', validationErrors)
    console.log('Form validation state:', {
      isCheckingVin,
      isCheckingLicensePlate,
      isFormValid
    })
    
    // Simple validation - just check required fields
    if (!formData.vin || !formData.make || !formData.model || !formData.licensePlate) {
      console.log('Required fields missing')
      toast.error('Please fill in all required fields')
      return
    }
    
    // Check for validation errors
    if (validationErrors.vin || validationErrors.licensePlate) {
      console.log('Validation errors present:', validationErrors)
      toast.error('Please fix validation errors before submitting')
      return
    }
    
    console.log('Attempting to submit form...')
    try {
      const url = '/api/trucks'
      const response = await apiPost(url, formData)
      console.log('API response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('API response data:', result)
        toast.success('Truck added successfully')
        setIsDialogOpen(false)
        resetForm()
        fetchTrucks() // Refresh the list
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        toast.error(errorData.error || 'Failed to save truck')
      }
    } catch (error) {
      console.error('Error saving truck:', error)
      toast.error('Failed to save truck')
    }
  }

  const handleEdit = (truck: Truck) => {
    setEditingTruck(truck)
    setFormData({
      vin: truck.vin,
      make: truck.make,
      model: truck.model,
      year: truck.year,
      licensePlate: truck.licensePlate,
      currentMileage: truck.currentMileage,
      status: truck.status
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingTruck(null)
    setFormData({
      vin: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      currentMileage: 0,
      status: 'ACTIVE'
    })
    setValidationErrors({
      vin: '',
      licensePlate: ''
    })
  }

  const handleAddTruck = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleDelete = async (truckId: string) => {
    if (confirm('Are you sure you want to delete this truck?')) {
      try {
        const response = await apiDelete(`/api/trucks/${truckId}`)

        if (response.ok) {
          toast.success('Truck deleted successfully')
          fetchTrucks() // Refresh the list
        } else {
          const errorData = await response.json()
          toast.error(errorData.error || 'Failed to delete truck')
        }
      } catch (error) {
        console.error('Error deleting truck:', error)
        toast.error('Failed to delete truck')
      }
    }
  }

  const handleManageFiles = (truck: Truck) => {
    setSelectedTruck(truck)
    setTruckDocuments(truck.documents || [])
    setIsFilesDialogOpen(true)
  }

  const handleViewTruck = (truck: Truck) => {
    setSelectedTruck(truck)
    setIsViewDialogOpen(true)
  }

  const handleFilesChange = (files: any[]) => {
    setTruckDocuments(files)
    if (selectedTruck) {
      const updatedTrucks = trucks.map(truck =>
        truck.id === selectedTruck.id
          ? { ...truck, documents: files }
          : truck
      )
      setTrucks(updatedTrucks)
    }
  }

  if (permissionsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!canAccess('trucks')) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access truck management.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Truck Management</h1>
          <p className="text-muted-foreground">Manage your fleet of vehicles</p>
        </div>
        {canCreate('trucks') && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              resetForm()
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddTruck}>
                <Plus className="h-4 w-4 mr-2" />
                Add Truck
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingTruck ? 'Edit Truck' : 'Add New Truck'}
              </DialogTitle>
              <DialogDescription>
                {editingTruck ? 'Update the truck information below.' : 'Enter the details for the new truck.'}
              </DialogDescription>
            </DialogHeader>
            
            {/* Validation Error Summary */}
            {(validationErrors.vin || validationErrors.licensePlate) && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {validationErrors.vin && <li>{validationErrors.vin}</li>}
                        {validationErrors.licensePlate && <li>{validationErrors.licensePlate}</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vin" className="text-right">
                  VIN
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => setFormData({...formData, vin: e.target.value})}
                    className={validationErrors.vin ? 'border-red-500' : ''}
                    required
                    placeholder="Enter unique VIN"
                  />
                  {isCheckingVin && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!isCheckingVin && formData.vin && !validationErrors.vin && (
                    <div className="absolute right-3 top-3">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                  {validationErrors.vin && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.vin}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Vehicle Identification Number must be unique</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="make" className="text-right">
                  Make
                </Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  Model
                </Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">
                  Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="licensePlate" className="text-right">
                  License Plate
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                    className={validationErrors.licensePlate ? 'border-red-500' : ''}
                    required
                    placeholder="Enter unique license plate"
                  />
                  {isCheckingLicensePlate && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  {!isCheckingLicensePlate && formData.licensePlate && !validationErrors.licensePlate && (
                    <div className="absolute right-3 top-3">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                  {validationErrors.licensePlate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.licensePlate}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">License plate must be unique</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentMileage" className="text-right">
                  Mileage
                </Label>
                <Input
                  id="currentMileage"
                  type="number"
                  value={formData.currentMileage}
                  onChange={(e) => {
                    const value = e.target.value
                    const mileage = value === '' ? 0 : parseInt(value) || 0
                    setFormData({...formData, currentMileage: mileage})
                  }}
                  className="col-span-3"
                  required
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isFormValid}
                >
                  Add Truck
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalTrucks}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.activeTrucks} active vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.upcomingMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              Due within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Repairs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardStats.overdueRepairs}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Maintenance Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(dashboardStats.totalMaintenanceCost / 6).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">
              Average monthly cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost (6mo)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats.totalMaintenanceCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 6 months
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Files Management Dialog */}
      <Dialog open={isFilesDialogOpen} onOpenChange={setIsFilesDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Files - {selectedTruck?.year} {selectedTruck?.make} {selectedTruck?.model}
            </DialogTitle>
            <DialogDescription>
              Upload and manage documents for this truck
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTruck && (
              <FileUpload
                type="truck"
                entityId={selectedTruck.id}
                existingFiles={truckDocuments}
                onFilesChange={handleFilesChange}
                multiple={true}
                maxFiles={20}
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsFilesDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Truck Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Truck Details - {selectedTruck?.licensePlate}
            </DialogTitle>
            <DialogDescription>
              View detailed information about this truck
            </DialogDescription>
          </DialogHeader>
          {selectedTruck && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">VIN</Label>
                  <p className="text-lg font-semibold">{selectedTruck.vin}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">License Plate</Label>
                  <p className="text-lg font-semibold">{selectedTruck.licensePlate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Make</Label>
                  <p className="text-lg font-semibold">{selectedTruck.make}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Model</Label>
                  <p className="text-lg font-semibold">{selectedTruck.model}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Year</Label>
                  <p className="text-lg font-semibold">{selectedTruck.year}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Current Mileage</Label>
                  <p className="text-lg font-semibold">{selectedTruck.currentMileage.toLocaleString()} miles</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <Badge className={`mt-1 ${getStatusColor(selectedTruck.status)}`}>
                  {selectedTruck.status}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Documents</Label>
                <p className="text-sm text-gray-600">
                  {selectedTruck.documents && selectedTruck.documents.length > 0 
                    ? `${selectedTruck.documents.length} document${selectedTruck.documents.length > 1 ? 's' : ''} attached`
                    : 'No documents attached'
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-sm">{new Date(selectedTruck.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <p className="text-sm">{new Date(selectedTruck.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {canUpdate('trucks') && selectedTruck && (
              <Button onClick={() => {
                setIsViewDialogOpen(false)
                handleEdit(selectedTruck)
              }}>
                Edit Truck
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trucks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
          <CardDescription>
            Showing {trucks.length} trucks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VIN</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trucks.map((truck) => (
                  <TableRow key={truck.id}>
                    <TableCell className="font-medium">{truck.vin}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{truck.year} {truck.make} {truck.model}</div>
                        <div className="text-sm text-muted-foreground">
                          Added {new Date(truck.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{truck.licensePlate}</TableCell>
                    <TableCell>{truck.currentMileage.toLocaleString()} miles</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(truck.status)}>
                        {truck.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewTruck(truck)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleManageFiles(truck)}
                          className="relative"
                        >
                          <Paperclip className="h-4 w-4" />
                          {truck.documents && truck.documents.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {truck.documents.length}
                            </span>
                          )}
                        </Button>
                        {canUpdate('trucks') && (
                          <Button variant="outline" size="sm" onClick={() => handleEdit(truck)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete('trucks') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(truck.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}