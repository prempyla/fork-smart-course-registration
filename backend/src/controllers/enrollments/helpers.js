const prisma = require("../../prisma");

// Converts a time to minutes since midnight (e.g., 2:30pm → 870 min)
const getMinutes = (date) => {
    const d = new Date(date);
    return d.getUTCHours() * 60 + d.getUTCMinutes();
};

// Check if two schedules overlap on the same day
const doSchedulesClash = (scheduleA, scheduleB) => {
    if (scheduleA.dayOfWeek !== scheduleB.dayOfWeek) return false;

    const startA = getMinutes(scheduleA.startTime);
    const endA = getMinutes(scheduleA.endTime);
    const startB = getMinutes(scheduleB.startTime);
    const endB = getMinutes(scheduleB.endTime);
    
    // Both conditions needed: A starts before B ends AND A ends after B starts
    return startA < endB && endA > startB;
};

// Format time for display (e.g., 14:30 → 2:30 PM)
const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

// Find clashes between target schedules and student's existing registrations
const findTimeClashes = (targetSchedules, existingRegistrations) => {
    const clashes = [];

    for (const registration of existingRegistrations) {
        const existingSchedules = registration.section.sectionCourses.flatMap(sc => sc.schedules);

        for (const targetSch of targetSchedules) {
            for (const existingSch of existingSchedules) {
                if (doSchedulesClash(targetSch, existingSch)) {
                    const courseInfo = registration.section.sectionCourses[0]?.course;
                    clashes.push({
                        courseCode: courseInfo?.code || 'Unknown',
                        courseTitle: courseInfo?.title || 'Unknown Course',
                        day: targetSch.dayOfWeek,
                        time: `${formatTime(targetSch.startTime)} - ${formatTime(targetSch.endTime)}`
                    });
                }
            }
        }
    }
    return clashes;
};

module.exports = {
    getMinutes,
    doSchedulesClash,
    formatTime,
    findTimeClashes
};
