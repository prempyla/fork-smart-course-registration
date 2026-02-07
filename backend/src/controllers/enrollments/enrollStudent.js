const prisma = require("../../prisma");
const { findTimeClashes } = require("./helpers");

const enrollStudent = async (req, res) => {
  try {
    const { studentId, sectionId } = req.body;

    // Get the section the student wants to enroll in
    const targetSection = await prisma.section.findUnique({
      where: { id: parseInt(sectionId) },
      include: {
        term: true,
        sectionCourses: {
          include: { schedules: true, course: true }
        }
      }
    });

    if (!targetSection) {
      return res.status(404).json({ error: "Section not found" });
    }

    // Get student's existing registrations for this term
    const existingRegistrations = await prisma.registration.findMany({
      where: {
        studentId: studentId,
        section: { termId: targetSection.termId }
      },
      include: {
        section: {
          include: {
            sectionCourses: { include: { schedules: true, course: true } }
          }
        }
      }
    });

    // Check if already enrolled in this section
    const alreadyEnrolled = existingRegistrations.some(
      reg => reg.sectionId === parseInt(sectionId)
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        error: "Already registered",
        message: "You are already enrolled in this section."
      });
    }

    // Check for time clashes with existing schedule
    const targetSchedules = targetSection.sectionCourses.flatMap(sc => sc.schedules);
    const clashes = findTimeClashes(targetSchedules, existingRegistrations);

    if (clashes.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Time clash detected",
        message: "This section conflicts with your existing schedule.",
        clashes
      });
    }
    const result = await prisma.$transaction(async (tx) => {
      const currentCount = await tx.registration.count({
        where: { sectionId: parseInt(sectionId) }
      });

      if (currentCount < targetSection.capacity) {
        const enrollment = await tx.registration.create({
          data: { studentId, sectionId: parseInt(sectionId) }
        });
        return { status: 201, body: { message: "Enrollment successful", enrollment } };

      } else {
        const existingWaitlist = await tx.waitlist.findFirst({
          where: {
            studentId: studentId, sectionId: parseInt(sectionId)
          }
        });

        if (existingWaitlist) {
          const position = await tx.waitlist.count({
            where: {
              sectionId: parseInt(sectionId), createdAt: { lte: existingWaitlist.createdAt }
            }
          });

          return {
            status: 200, body: {
              message: "You are already on the waitlist for this section.", waitlistPosition: position, waitlistEntry: existingWaitlist
            }
          };
        }
        const waitlistCount = await tx.waitlist.count({
          where: { sectionId: parseInt(sectionId) }
        });
        const waitlistEntry = await tx.waitlist.create({
          data: { studentId, sectionId: parseInt(sectionId) }
        });

        return {
          status: 200, body: {
            message: "Section full. Added to waitlist.", waitlistPosition: waitlistCount + 1, waitlistEntry
          }
        };
      }
    });

    res.status(result.status).json(result.body);

  } catch (error) {
    console.error("enrollStudent Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = enrollStudent;
