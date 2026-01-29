import { prisma } from './prisma';
import { hashPassword } from './auth';

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Get existing users or create them
    let users = await prisma.user.findMany({
      where: {
        username: {
          in: ['alice_creative', 'bob_artist', 'charlie_photo']
        }
      }
    });

    // If users don't exist, create them
    if (users.length === 0) {
      users = await Promise.all([
        prisma.user.create({
          data: {
            username: 'alice_creative',
            email: 'alice@example.com',
            passwordHash: await hashPassword('password123'),
            displayName: 'Alice Johnson',
            bio: 'Creative photographer and trend enthusiast',
            profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            isVerified: true,
          },
        }),
        prisma.user.create({
          data: {
            username: 'bob_artist',
            email: 'bob@example.com',
            passwordHash: await hashPassword('password123'),
            displayName: 'Bob Smith',
            bio: 'Digital artist and content creator',
            profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          },
        }),
        prisma.user.create({
          data: {
            username: 'charlie_photo',
            email: 'charlie@example.com',
            passwordHash: await hashPassword('password123'),
            displayName: 'Charlie Brown',
            bio: 'Street photographer',
            profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          },
        }),
      ]);
    }

    console.log(`✅ Found/Created ${users.length} users`);

    // Get existing trends or create them
    let trends = await prisma.trend.findMany({
      where: {
        hashtag: {
          in: ['sunsetvibes', 'urbanarch', 'minimalart']
        }
      }
    });

    if (trends.length === 0) {
      trends = await Promise.all([
        prisma.trend.create({
          data: {
            name: 'Sunset Photography',
            description: 'Capture the most beautiful sunset moments',
            hashtag: 'sunsetvibes',
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            isActive: true,
            createdBy: users[0].id,
          },
        }),
        prisma.trend.create({
          data: {
            name: 'Urban Architecture',
            description: 'Show off the best architectural shots in your city',
            hashtag: 'urbanarch',
            startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
            isActive: true,
            createdBy: users[1].id,
          },
        }),
        prisma.trend.create({
          data: {
            name: 'Minimalist Art',
            description: 'Less is more - showcase minimalist photography and art',
            hashtag: 'minimalart',
            startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            isActive: true,
            createdBy: users[2].id,
          },
        }),
      ]);
    }

    console.log(`✅ Found/Created ${trends.length} trends`);

    // Delete existing messages first to avoid duplicates
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: { in: users.map(u => u.id) } },
          { recipientId: { in: users.map(u => u.id) } }
        ]
      }
    });

    // Create some sample messages for testing
    const messages = await Promise.all([
      prisma.message.create({
        data: {
          senderId: users[0].id, // Alice
          recipientId: users[1].id, // Bob
          content: "Hey Bob! Love your latest artwork. The colors are amazing!",
          messageType: 'TEXT',
          isRead: false,
        },
      }),
      prisma.message.create({
        data: {
          senderId: users[1].id, // Bob
          recipientId: users[0].id, // Alice
          content: "Thanks Alice! Your sunset photos inspired me to try new color palettes.",
          messageType: 'TEXT',
          isRead: true,
        },
      }),
      prisma.message.create({
        data: {
          senderId: users[2].id, // Charlie
          recipientId: users[0].id, // Alice
          content: "Alice, would you be interested in collaborating on a street photography project?",
          messageType: 'TEXT',
          isRead: false,
        },
      }),
      prisma.message.create({
        data: {
          senderId: users[0].id, // Alice
          recipientId: users[2].id, // Charlie
          content: "That sounds amazing! I'd love to collaborate. When are you thinking?",
          messageType: 'TEXT',
          isRead: true,
        },
      }),
      prisma.message.create({
        data: {
          senderId: users[1].id, // Bob
          recipientId: users[2].id, // Charlie
          content: "Charlie, your minimalist approach is really inspiring. Any tips for a beginner?",
          messageType: 'TEXT',
          isRead: false,
        },
      }),
    ]);

    console.log(`✅ Created ${messages.length} sample messages`);

    // NO DUMMY POSTS - Users will create their own content!
    console.log('✅ No dummy posts created - users will create real content');

    console.log('🎉 Database seeded successfully!');
    console.log('📝 Only real user accounts created for login testing');
    console.log('🚫 No dummy posts - feed will be empty until users create content');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}