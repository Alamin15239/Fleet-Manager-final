import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdminUser() {
  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    console.log('Admin User Check:')
    console.log('==================')
    if (adminUser) {
      console.log('ID:', adminUser.id)
      console.log('Email:', adminUser.email)
      console.log('Name:', adminUser.name)
      console.log('Role:', adminUser.role)
      console.log('Password:', adminUser.password ? '[HASHED]' : '[MISSING]')
      console.log('isActive:', adminUser.isActive)
      console.log('isApproved:', adminUser.isApproved)
      console.log('isDeleted:', adminUser.isDeleted)
    } else {
      console.log('No admin user found!')
    }
    
    // Check all users
    const allUsers = await prisma.user.findMany()
    console.log('\nAll Users:', allUsers.length)
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Role: ${user.role}, Active: ${user.isActive}, Approved: ${user.isApproved}`)
    })
    
  } catch (error) {
    console.error('Error checking admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUser()