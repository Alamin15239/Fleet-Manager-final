import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function createCorrectAdmin() {
  try {
    console.log('Creating correct admin user...')
    
    // Delete existing admin user
    await prisma.user.deleteMany({
      where: { role: 'ADMIN' }
    })
    console.log('Deleted existing admin users')
    
    // Create new admin user
    const hashedPassword = await hashPassword('admin123')
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@fleetmanager.com',
        name: 'Fleet Manager',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        isApproved: true,
        isDeleted: false
      }
    })
    
    console.log('✅ Created admin user:')
    console.log('   Email:', adminUser.email)
    console.log('   Name:', adminUser.name)
    console.log('   Role:', adminUser.role)
    console.log('   Password: admin123')
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createCorrectAdmin()