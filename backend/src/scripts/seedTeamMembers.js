const mongoose = require('mongoose');
const TeamMemberModel = require('../models/TeamMember');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yantradaan', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleTeamMembers = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@yantradaan.com",
    contact: "+1 (555) 123-4567",
    role: "Founder & CEO",
    bio: "Passionate about bridging the digital divide in education. Founded YantraDaan in 2019 with a vision to make technology accessible to every student.",
    status: "active"
  },
  {
    name: "Michael Chen",
    email: "michael.chen@yantradaan.com",
    contact: "+1 (555) 234-5678",
    role: "Operations Director",
    bio: "Ensures smooth donation and distribution processes. Manages logistics and coordinates with donors and recipients across the country.",
    status: "active"
  },
  {
    name: "Emily Rodriguez",
    email: "emily.rodriguez@yantradaan.com",
    contact: "+1 (555) 345-6789",
    role: "Community Manager",
    bio: "Builds relationships with students and donors nationwide. Focuses on community engagement and partnership development.",
    status: "active"
  },
  {
    name: "David Kim",
    email: "david.kim@yantradaan.com",
    contact: "+1 (555) 456-7890",
    role: "Technical Lead",
    bio: "Leads the technical development team. Ensures the platform runs smoothly and implements new features for better user experience.",
    status: "active"
  },
  {
    name: "Lisa Thompson",
    email: "lisa.thompson@yantradaan.com",
    contact: "+1 (555) 567-8901",
    role: "Support Staff",
    bio: "Provides customer support and assistance to donors and recipients. Helps resolve issues and ensures smooth operations.",
    status: "active"
  }
];

async function seedTeamMembers() {
  try {
    // Clear existing team members
    await TeamMemberModel.deleteMany({});
    console.log('Cleared existing team members');

    // Insert sample team members
    const insertedMembers = await TeamMemberModel.insertMany(sampleTeamMembers);
    console.log(`Successfully inserted ${insertedMembers.length} team members`);

    // Display inserted members
    insertedMembers.forEach(member => {
      console.log(`- ${member.name} (${member.role})`);
    });

    console.log('\nTeam members seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding team members:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedTeamMembers();
