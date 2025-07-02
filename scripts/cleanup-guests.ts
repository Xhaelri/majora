// This script is intended to be run by a scheduler (e.g., cron job)

import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function cleanupInactiveGuests() {
  console.log('Starting cleanup of inactive guest users...')

  // Calculate the date 30 days ago
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    // Find guest users older than 30 days
    const oldGuests = await db.user.findMany({
      where: {
        isGuest: true,
        createdAt: {
          lt: thirtyDaysAgo, // 'lt' means "less than"
        },
      },
      include: {
        cart: {
          include: {
            items: true,
          },
        },
      },
    })

    const usersToDelete = []

    for (const guest of oldGuests) {
        // We can delete guests regardless of cart content, as they are expired.
        // Or, you could add logic to only delete if their cart is empty:
        // if (!guest.cart || guest.cart.items.length === 0) {
        //   usersToDelete.push(guest.id)
        // }
        usersToDelete.push(guest.id)
    }

    if (usersToDelete.length > 0) {
      console.log(`Found ${usersToDelete.length} inactive guest users to delete.`)
      
      // The `onDelete: Cascade` in the schema will handle deleting related carts and cart items
      const deleteResult = await db.user.deleteMany({
        where: {
          id: {
            in: usersToDelete,
          },
        },
      })
      console.log(`Successfully deleted ${deleteResult.count} guest users.`)
    } else {
      console.log('No inactive guest users found to delete.')
    }
  } catch (error) {
    console.error('Error during guest user cleanup:', error)
  } finally {
    await db.$disconnect()
  }
}

cleanupInactiveGuests()