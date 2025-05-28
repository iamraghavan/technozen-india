const fs = require('fs').promises;
const path = require('path');
const sanitizeHtml = require('sanitize-html');

// Path to JSON file for storing admissions
const admissionsFile = path.join(__dirname, '../data/admissions.json');

// Generate unique student admission ID (TIND/[SOL|CNC]/5digits)
function generateStudentId(subCourse) {
    const courseCode = subCourse === 'SOLIDWORKS' ? 'SOL' : 'CNC';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `TIND/${courseCode}/${randomNum}`;
}

// Initialize JSON file
async function initializeAdmissionsFile() {
    try {
        await fs.access(admissionsFile);
    } catch (error) {
        await fs.writeFile(admissionsFile, JSON.stringify([]));
    }
}

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
            return res.status(400).json({ error: 'Invalid center name.' });
        }
        if (!firstName || !lastName || !/^[A-Za-z]+$/.test(firstName) || !/^[A-Za-z]+$/.test(lastName)) {
            return res.status(400).json({ error: 'First and Last Name must contain only letters.' });
        }
        if (middleName && !/^[A-Za-z]*$/.test(middleName)) {
            return res.status(400).json({ error: 'Middle Name must contain only letters.' });
        }
        // Updated validation for international phone numbers (E.164 format: + followed by 1-15 digits)
        if (!contactNumber || !/^\+\d{1,15}$/.test(contactNumber)) {
            return res.status(400).json({ error: 'Contact number must be a valid international number (e.g., +1234567890).' });
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
        if (!batchTime || !batchTime.match(/^\d{1,2}:00 AM - \d{1,2}:00 AM$/)) {
            return res.status(400).json({ error: 'Invalid batch time.' });
        }
        if (!yearsOfExperience || isNaN(yearsOfExperience) || yearsOfExperience < 0 || yearsOfExperience > 20) {
            return res.status(400).json({ error: 'Invalid years of experience.' });
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
            yearsOfExperience: parseInt(yearsOfExperience),
            occupation: sanitizeHtml(occupation),
            remarks: sanitizeHtml(remarks || ''),
            student_admission_id: generateStudentId(subCourse),
            createdAt: new Date().toISOString()
        };

        // Read existing admissions
        await initializeAdmissionsFile();
        const admissions = JSON.parse(await fs.readFile(admissionsFile));

        // Add new admission
        admissions.push(sanitizedData);

        // Write back to JSON file
        await fs.writeFile(admissionsFile, JSON.stringify(admissions, null, 2));

        // Respond with success
        res.status(200).json({ message: 'Admission form submitted successfully!', student_admission_id: sanitizedData.student_admission_id });
    } catch (error) {
        console.error('Error processing admission form:', error);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

module.exports = {
    submitAdmissionForm
};