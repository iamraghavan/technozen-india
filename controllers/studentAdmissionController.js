const fs = require('fs').promises;
const path = require('path');
const sanitizeHtml = require('sanitize-html');

/**
 * Path to JSON file for storing admissions.
 * @constant {string}
 */
const admissionsFile = path.join(__dirname, '../data/admissions.json');

/**
 * Generates a unique student admission ID.
 * @param {string} subCourse - The selected sub-course.
 * @returns {string} - Format: TIND/[SOL|CNC]/5digits.
 */
function generateStudentId(subCourse) {
    const courseCode = subCourse === 'SOLIDWORKS' ? 'SOL' : 'CNC';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `TIND/${courseCode}/${randomNum}`;
}

/**
 * Initializes the admissions JSON file and its parent directory if they don't exist.
 * @returns {Promise<void>}
 * @throws {Error} - If file/directory creation fails.
 */
async function initializeAdmissionsFile() {
    try {
        // Check if file exists
        await fs.access(admissionsFile);
    } catch (error) {
        try {
            // Ensure parent directory exists
            const dir = path.dirname(admissionsFile);
            await fs.mkdir(dir, { recursive: true });
            // Create empty JSON file
            await fs.writeFile(admissionsFile, JSON.stringify([], null, 2), 'utf8');
        } catch (dirError) {
            throw new Error(`Failed to initialize admissions file: ${dirError.message}`);
        }
    }
}

/**
 * Submits and validates the admission form.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const submitAdmissionForm = async (req, res) => {
    try {
        const {
            centerName, firstName, middleName, lastName, contactNumber, emailId,
            collegeName, educationQualification, courseInterested, subCourse,
            joiningDate, joiningMonth, batchTime, currentDesignation,
            currentCompanyName, yearsOfExperience, occupation, remarks
        } = req.body;

        // Validation rules
        if (!centerName || !centerName.includes('Technozen India')) {
            return res.status(400).json({ error: 'Center name must include "Technozen India".' });
        }
        if (!firstName || !lastName || !/^[A-Za-z]+$/.test(firstName) || !/^[A-Za-z]+$/.test(lastName)) {
            return res.status(400).json({ error: 'First and Last Name must contain only letters.' });
        }
        if (middleName && !/^[A-Za-z]*$/.test(middleName)) {
            return res.status(400).json({ error: 'Middle Name must contain only letters.' });
        }
        if (!contactNumber) {
            return res.status(400).json({ error: 'Contact number is required.' });
        }
        if (!/^\+\d{1,15}$/.test(contactNumber)) {
            return res.status(400).json({ error: 'Contact number must be in international format (e.g., +919876543210).' });
        }
        if (!emailId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)) {
            return res.status(400).json({ error: 'Invalid email address.' });
        }
        if (!educationQualification || !['Diploma', 'B.E./B.Tech', 'M.E./M.Tech', 'Other'].includes(educationQualification)) {
            return res.status(400).json({ error: 'Invalid education qualification.' });
        }
        if (!courseInterested || !['Mechanical', 'Civil'].includes(courseInterested)) {
            return res.status(400).json({ error: 'Invalid course selection.' });
        }
        if (!subCourse || (courseInterested === 'Mechanical' && !['SOLIDWORKS', 'CNC Programming'].includes(subCourse)) || (courseInterested === 'Civil' && subCourse !== '')) {
            return res.status(400).json({ error: 'Invalid sub-course selection.' });
        }
        if (!joiningDate || new Date(joiningDate) < new Date()) {
            return res.status(400).json({ error: 'Joining date must be today or later.' });
        }
        if (!joiningMonth) {
            return res.status(400).json({ error: 'Joining month is required.' });
        }
        if (!batchTime || !/^\d{1,2}:00 AM - \d{1,2}:00 AM$/.test(batchTime)) {
            return res.status(400).json({ error: 'Invalid batch time format.' });
        }
        const yearsExp = parseInt(yearsOfExperience, 10);
        if (isNaN(yearsExp) || yearsExp < 0 || yearsExp > 20) {
            return res.status(400).json({ error: 'Years of experience must be between 0 and 20.' });
        }
        if (!occupation || !['Student', 'Professional', 'Fresher', 'Entrepreneur'].includes(occupation)) {
            return res.status(400).json({ error: 'Invalid occupation.' });
        }

        // Sanitize inputs
        const sanitizedData = {
            centerName: sanitizeHtml(centerName),
            firstName: sanitizeHtml(firstName),
            middleName: sanitizeHtml(middleName || ''),
            lastName: sanitizeHtml(lastName),
            contactNumber: sanitizeHtml(contactNumber),
            emailId: sanitizeHtml(emailId),
            collegeName: sanitizeHtml(collegeName || ''),
            educationQualification: sanitizeHtml(educationQualification),
            courseInterested: sanitizeHtml(courseInterested),
            subCourse: sanitizeHtml(subCourse),
            joiningDate: sanitizeHtml(joiningDate),
            joiningMonth: sanitizeHtml(joiningMonth),
            batchTime: sanitizeHtml(batchTime),
            currentDesignation: sanitizeHtml(currentDesignation || ''),
            currentCompanyName: sanitizeHtml(currentCompanyName || ''),
            yearsOfExperience: yearsExp,
            occupation: sanitizeHtml(occupation),
            remarks: sanitizeHtml(remarks || ''),
            student_admission_id: generateStudentId(subCourse),
            createdAt: new Date().toISOString(),
        };

        // Initialize file and read admissions
        await initializeAdmissionsFile();
        let admissions;
        try {
            const data = await fs.readFile(admissionsFile, 'utf8');
            admissions = JSON.parse(data || '[]');
        } catch (readError) {
            // If read fails (e.g., corrupted file), reset to empty array
            admissions = [];
            await fs.writeFile(admissionsFile, JSON.stringify(admissions, null, 2), 'utf8');
        }

        // Add new admission
        admissions.push(sanitizedData);

        // Write back to JSON file
        try {
            await fs.writeFile(admissionsFile, JSON.stringify(admissions, null, 2), 'utf8');
        } catch (writeError) {
            throw new Error(`Failed to write to admissions file: ${writeError.message}`);
        }

        // return res.status(200).json({
        //     message: 'Admission form submitted successfully!',
        //     student_admission_id: sanitizedData.student_admission_id,
        // });

        return res.redirect(`/student-desk?success=true&student_id=${sanitizedData.student_admission_id}`);

    } catch (error) {
        console.error('Error processing admission form:', error);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
};

module.exports = { submitAdmissionForm };