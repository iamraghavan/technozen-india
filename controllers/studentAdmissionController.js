const fs = require('fs').promises;
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const nodemailer = require('nodemailer');
require('dotenv').config();


// JSON admissions file path
const admissionsFile = path.join(__dirname, '../data/admissions.json');

// Generate unique student ID
function generateStudentId(subCourse) {
    const courseCode = subCourse === 'SOLIDWORKS' ? 'SOL' : 'CNC';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `TIND/${courseCode}/${randomNum}`;
}

// Initialize admissions file if not exists
async function initializeAdmissionsFile() {
    try {
        await fs.access(admissionsFile);
    } catch {
        const dir = path.dirname(admissionsFile);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(admissionsFile, JSON.stringify([], null, 2), 'utf8');
    }
}

// Nodemailer transporter config

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_ENCRYPTION === 'ssl', // true for port 465
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  },
  logger: true,
  debug: true,
  tls: {
    rejectUnauthorized: false
  }
});


// Mail template generator
function generateMailTemplate(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #ffffff;
                color: #000000;
                margin: 0;
                padding: 0;
            }
            .header {
                background-color: #FF671F;
                padding: 20px;
                text-align: center;
                color: #ffffff;
            }
            .content {
                padding: 20px;
            }
            .details {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
            }
            .details p {
                margin: 6px 0;
            }
            .footer {
                background-color: #046A38;
                color: #ffffff;
                text-align: center;
                padding: 10px;
                margin-top: 30px;
            }
            .highlight {
                color: #00928b;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Thank you for your Admission, ${data.firstName}!</h1>
        </div>
        <div class="content">
            <p>Dear ${data.firstName} ${data.middleName} ${data.lastName},</p>
            <p>We have successfully received your admission form. Below are your details:</p>
            <div class="details">
                <p><strong>Admission ID:</strong> ${data.student_admission_id}</p>
                <p><strong>Center Name:</strong> ${data.centerName}</p>
                <p><strong>Email:</strong> ${data.emailId}</p>
                <p><strong>Contact Number:</strong> ${data.contactNumber}</p>
                <p><strong>Course:</strong> ${data.courseInterested}</p>
                <p><strong>Sub Course:</strong> ${data.subCourse}</p>
                <p><strong>Joining Date:</strong> ${data.joiningDate}</p>
                <p><strong>Batch Time:</strong> ${data.batchTime}</p>
                <p><strong>Occupation:</strong> ${data.occupation}</p>
                <p><strong>Years of Experience:</strong> ${data.yearsOfExperience}</p>
            </div>
            <p style="margin-top:20px;">For any queries, feel free to contact us.</p>
            <p>Regards,<br><span class="highlight">Technozen India</span></p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Technozen India. All rights reserved.
        </div>
    </body>
    </html>
    `;
}

// Controller: Submit admission form
const submitAdmissionForm = async (req, res) => {
    try {
        const {
            centerName, firstName, middleName, lastName, contactNumber, emailId,
            collegeName, educationQualification, courseInterested, subCourse,
            joiningDate, joiningMonth, batchTime, currentDesignation,
            currentCompanyName, yearsOfExperience, occupation, remarks
        } = req.body;

        // Validation
        if (!centerName || !centerName.includes('Technozen India')) {
            return res.status(400).json({ error: 'Center name must include "Technozen India".' });
        }
        if (!firstName || !lastName || !/^[A-Za-z]+$/.test(firstName) || !/^[A-Za-z]+$/.test(lastName)) {
            return res.status(400).json({ error: 'First and Last Name must contain only letters.' });
        }
        if (middleName && !/^[A-Za-z]*$/.test(middleName)) {
            return res.status(400).json({ error: 'Middle Name must contain only letters.' });
        }
        if (!contactNumber || !/^\+\d{1,15}$/.test(contactNumber)) {
            return res.status(400).json({ error: 'Contact number must be in international format.' });
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

        // Initialize file
        await initializeAdmissionsFile();
        let admissions = [];
        try {
            const data = await fs.readFile(admissionsFile, 'utf8');
            admissions = JSON.parse(data || '[]');
        } catch {
            admissions = [];
        }
        admissions.push(sanitizedData);
        await fs.writeFile(admissionsFile, JSON.stringify(admissions, null, 2), 'utf8');

        // Send acknowledgement mail
        await transporter.sendMail({
  from: `"Technozen India" <noreply@srithiruthanibuildersandfoundation.com>`,
  to: sanitizedData.emailId,
  subject: `Acknowledgement - Admission ID: ${sanitizedData.student_admission_id}`,
  html: generateMailTemplate(sanitizedData)
});


        return res.redirect(`/student-desk?success=true&student_id=${sanitizedData.student_admission_id}`);
    } catch (error) {
        console.error('Admission form error:', error);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
};

module.exports = { submitAdmissionForm };
