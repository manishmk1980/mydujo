import "dotenv/config";
import argon2 from "argon2";
import { prisma } from "../src/db.js";

/**
 * Seed script for a dummy instructor and related test data.
 * Usage: node scripts/seed-instructor-demo.js
 */

const DUMMY_INSTRUCTOR = {
    fullName: "Sensei Demo",
    email: "instructor.demo@mdpl.local",
    password: "Instructor@123",
    phone: "9876543210",
    bio: "Experienced martial arts instructor specializing in Shotokan Karate.",
    city: "San Francisco",
    state: "CA",
};

async function main() {
    console.log("🌱 Seeding dummy instructor data...");

    // 1. Ensure roles exist
    const instructorRole = await prisma.role.upsert({
        where: { name: "INSTRUCTOR" },
        update: {},
        create: { name: "INSTRUCTOR" },
    });

    const studentRole = await prisma.role.upsert({
        where: { name: "STUDENT" },
        update: {},
        create: { name: "STUDENT" },
    });

    // 2. Create/Update Instructor User
    const passwordHash = await argon2.hash(DUMMY_INSTRUCTOR.password);

    const user = await prisma.user.upsert({
        where: { email: DUMMY_INSTRUCTOR.email },
        update: { passwordHash },
        create: {
            email: DUMMY_INSTRUCTOR.email,
            passwordHash,
        },
    });

    // Assign role
    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: instructorRole.id } },
        update: {},
        create: { userId: user.id, roleId: instructorRole.id },
    });

    // 3. Create/Update Instructor Profile
    const instructor = await prisma.instructor.upsert({
        where: { userId: user.id },
        update: {
            fullName: DUMMY_INSTRUCTOR.fullName,
            email: DUMMY_INSTRUCTOR.email,
            phone: DUMMY_INSTRUCTOR.phone,
            bio: DUMMY_INSTRUCTOR.bio,
            city: DUMMY_INSTRUCTOR.city,
            state: DUMMY_INSTRUCTOR.state,
            isActive: true,
            canLogin: true,
        },
        create: {
            userId: user.id,
            fullName: DUMMY_INSTRUCTOR.fullName,
            email: DUMMY_INSTRUCTOR.email,
            phone: DUMMY_INSTRUCTOR.phone,
            bio: DUMMY_INSTRUCTOR.bio,
            city: DUMMY_INSTRUCTOR.city,
            state: DUMMY_INSTRUCTOR.state,
        },
    });

    // 4. Get or Create Students
    let students = await prisma.student.findMany({ take: 5 });

    if (students.length === 0) {
        console.log("  - No existing students found, creating dummy students...");
        const dummyStudentData = [
            { fullName: "John Doe", email: "john@example.com" },
            { fullName: "Jane Smith", email: "jane@example.com" },
            { fullName: "Mark Wilson", email: "mark@example.com" },
        ];

        for (const s of dummyStudentData) {
            const studentUser = await prisma.user.create({
                data: {
                    email: s.email,
                    passwordHash: await argon2.hash("Password@123"),
                },
            });
            await prisma.userRole.create({
                data: { userId: studentUser.id, roleId: studentRole.id },
            });
            const student = await prisma.student.create({
                data: {
                    userId: studentUser.id,
                    fullName: s.fullName,
                    email: s.email,
                    status: "approved",
                },
            });
            students.push(student);
        }
    }

    // 5. Assign Students to Instructor
    console.log(`  - Assigning ${students.length} students to instructor...`);
    for (const student of students) {
        await prisma.instructorStudentAssignment.upsert({
            where: {
                instructorId_studentId: {
                    instructorId: instructor.id,
                    studentId: student.id,
                },
            },
            update: {},
            create: {
                instructorId: instructor.id,
                studentId: student.id,
                assignedAt: new Date(),
            },
        });

        // Seed Grading Progress
        await prisma.gradingProgress.upsert({
            where: { studentId: student.id },
            update: {
                syllabusCompletionPercent: Math.floor(Math.random() * 100),
            },
            create: {
                studentId: student.id,
                syllabusCompletionPercent: Math.floor(Math.random() * 100),
                readinessStatus: "Developing",
                instructorNotes: "Showing good improvement in Katas.",
            },
        });
    }

    // 6. Create Class Session
    console.log("  - Creating an instructor-linked class session...");
    await prisma.classSession.create({
        data: {
            title: "Advanced Shotokan",
            classType: "Standard",
            instructorId: instructor.id,
            instructorName: instructor.fullName,
            discipline: "karate_shotokan",
            sessionDate: new Date(),
            startTime: new Date(),
            status: "scheduled",
        },
    });

    console.log("\n✅ Demo Instructor seeded successfully!");
    console.log("-----------------------------------------");
    console.log(`Email:    ${DUMMY_INSTRUCTOR.email}`);
    console.log(`Password: ${DUMMY_INSTRUCTOR.password}`);
    console.log("-----------------------------------------\n");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
