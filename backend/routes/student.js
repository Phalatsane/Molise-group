const express = require('express');
const router = express.Router();
const { db } = require('../server');
const { authenticate, requireRole } = require('../middleware/auth');

// Get student profile
router.get('/profile', authenticate, requireRole('student'), async (req, res) => {
  try {
    const studentDoc = await db.collection('users').doc(req.user.uid).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(studentDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student profile
router.put('/profile', authenticate, requireRole('student'), async (req, res) => {
  try {
    await db.collection('users').doc(req.user.uid).update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add HEIS results
router.post('/heis-results', authenticate, requireRole('student'), async (req, res) => {
  try {
    const { results } = req.body; // Array of { subject, grade, points }
    
    await db.collection('users').doc(req.user.uid).update({
      heisResults: results,
      heisResultsAdded: true,
      heisResultsAddedAt: new Date().toISOString()
    });
    
    res.json({ message: 'HEIS results added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get qualified institutions
router.get('/qualified-institutions', authenticate, requireRole('student'), async (req, res) => {
  try {
    const studentDoc = await db.collection('users').doc(req.user.uid).get();
    const studentData = studentDoc.data();
    
    if (!studentData.heisResults || !studentData.heisResultsAdded) {
      return res.status(400).json({ error: 'Please add your HEIS results first' });
    }

    const institutionsSnapshot = await db.collection('institutions').get();
    const qualifiedInstitutions = [];

    for (const instDoc of institutionsSnapshot.docs) {
      const institution = { id: instDoc.id, ...instDoc.data() };
      
      // Get faculties
      const facultiesSnapshot = await db.collection('faculties')
        .where('institutionId', '==', instDoc.id)
        .get();
      
      const qualifiedCourses = [];
      
      for (const facultyDoc of facultiesSnapshot.docs) {
        const coursesSnapshot = await db.collection('courses')
          .where('facultyId', '==', facultyDoc.id)
          .get();
        
        for (const courseDoc of coursesSnapshot.docs) {
          const course = { id: courseDoc.id, ...courseDoc.data() };
          
          // Check if student qualifies
          if (checkQualification(studentData.heisResults, course.requirements)) {
            qualifiedCourses.push({
              ...course,
              faculty: { id: facultyDoc.id, ...facultyDoc.data() }
            });
          }
        }
      }
      
      if (qualifiedCourses.length > 0) {
        institution.qualifiedCourses = qualifiedCourses;
        qualifiedInstitutions.push(institution);
      }
    }
    
    res.json(qualifiedInstitutions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to check qualification
function checkQualification(heisResults, requirements) {
  if (!requirements || !requirements.subjects || !requirements.minPoints) {
    return true; // No requirements specified
  }

  const totalPoints = heisResults.reduce((sum, result) => {
    const gradePoints = {
      'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0
    };
    return sum + (gradePoints[result.grade] || 0);
  }, 0);

  if (totalPoints < requirements.minPoints) {
    return false;
  }

  // Check required subjects
  for (const requiredSubject of requirements.subjects) {
    const studentSubject = heisResults.find(r => 
      r.subject.toLowerCase() === requiredSubject.subject.toLowerCase()
    );
    
    if (!studentSubject) {
      return false;
    }
    
    const gradePoints = {
      'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0
    };
    
    if ((gradePoints[studentSubject.grade] || 0) < requiredSubject.minGrade) {
      return false;
    }
  }

  return true;
}

// Apply for course
router.post('/apply', authenticate, requireRole('student'), async (req, res) => {
  try {
    const { courseId, institutionId } = req.body;
    
    // Check if student has HEIS results
    const studentDoc = await db.collection('users').doc(req.user.uid).get();
    const studentData = studentDoc.data();
    
    if (!studentData.heisResults || !studentData.heisResultsAdded) {
      return res.status(400).json({ error: 'Please add your HEIS results first' });
    }

    // Check existing applications to this institution
    const existingApps = await db.collection('applications')
      .where('studentId', '==', req.user.uid)
      .where('institutionId', '==', institutionId)
      .get();
    
    if (existingApps.size >= 2) {
      return res.status(400).json({ 
        error: 'You can only apply for a maximum of 2 courses per institution' 
      });
    }

    // Check if already applied to this course
    const existingApp = existingApps.docs.find(doc => doc.data().courseId === courseId);
    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied for this course' });
    }

    // Get course to check qualification
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseDoc.data();
    
    // Verify qualification
    if (!checkQualification(studentData.heisResults, course.requirements)) {
      return res.status(400).json({ error: 'You do not meet the requirements for this course' });
    }

    // Create application
    const applicationData = {
      studentId: req.user.uid,
      courseId,
      institutionId,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    const docRef = await db.collection('applications').add(applicationData);
    res.status(201).json({ id: docRef.id, ...applicationData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my applications
router.get('/applications', authenticate, requireRole('student'), async (req, res) => {
  try {
    const applicationsSnapshot = await db.collection('applications')
      .where('studentId', '==', req.user.uid)
      .get();
    
    const applications = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
      const appData = doc.data();
      const courseDoc = await db.collection('courses').doc(appData.courseId).get();
      const institutionDoc = await db.collection('institutions').doc(appData.institutionId).get();
      
      return {
        id: doc.id,
        ...appData,
        course: courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null,
        institution: institutionDoc.exists ? { id: institutionDoc.id, ...institutionDoc.data() } : null
      };
    }));
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Select admission (when admitted to multiple institutions)
router.post('/select-admission', authenticate, requireRole('student'), async (req, res) => {
  try {
    const { applicationId } = req.body;
    
    // Get all admitted applications
    const admittedApps = await db.collection('applications')
      .where('studentId', '==', req.user.uid)
      .where('status', '==', 'admitted')
      .get();
    
    if (admittedApps.empty) {
      return res.status(400).json({ error: 'No admitted applications found' });
    }

    // Find the selected application
    const selectedApp = admittedApps.docs.find(doc => doc.id === applicationId);
    if (!selectedApp) {
      return res.status(404).json({ error: 'Selected application not found' });
    }

    const selectedData = selectedApp.data();
    
    // Reject all other admitted applications
    for (const appDoc of admittedApps.docs) {
      if (appDoc.id !== applicationId) {
        await db.collection('applications').doc(appDoc.id).update({
          status: 'rejected',
          reason: 'Student selected another institution',
          updatedAt: new Date().toISOString()
        });

        // Move first student from waiting list to main list
        const waitingList = await db.collection('applications')
          .where('courseId', '==', appDoc.data().courseId)
          .where('status', '==', 'pending')
          .orderBy('appliedAt', 'asc')
          .limit(1)
          .get();
        
        if (!waitingList.empty) {
          await db.collection('applications').doc(waitingList.docs[0].id).update({
            status: 'admitted',
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    res.json({ message: 'Admission selected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload transcript / academic results
router.post('/upload-transcript', authenticate, requireRole('student'), async (req, res) => {
  try {
    const { transcriptEntries = [], additionalCertificates = [] } = req.body;

    if (!Array.isArray(transcriptEntries) || transcriptEntries.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one academic result.' });
    }

    const sanitizedResults = transcriptEntries
      .filter(entry => entry.subject && entry.score)
      .map(entry => ({
        subject: entry.subject,
        score: entry.score
      }));

    const sanitizedCertificates = (additionalCertificates || [])
      .filter(cert => cert.name && cert.url)
      .map(cert => ({
        name: cert.name,
        url: cert.url
      }));

    if (sanitizedResults.length === 0) {
      return res.status(400).json({ error: 'Please provide valid academic results.' });
    }

    await db.collection('users').doc(req.user.uid).set({
      transcriptEntries: sanitizedResults,
      additionalCertificates: sanitizedCertificates,
      transcriptComplete: true,
      transcriptUpdatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({ message: 'Academic results saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available jobs
router.get('/jobs', authenticate, requireRole('student'), async (req, res) => {
  try {
    const jobsSnapshot = await db.collection('jobs')
      .where('status', '==', 'active')
      .get();
    
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply for job
router.post('/jobs/:jobId/apply', authenticate, requireRole('student'), async (req, res) => {
  try {
    const jobDoc = await db.collection('jobs').doc(req.params.jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const studentDoc = await db.collection('users').doc(req.user.uid).get();
    const studentData = studentDoc.data();
    
    if (!studentData.transcriptEntries || studentData.transcriptEntries.length === 0) {
      return res.status(400).json({ error: 'Please enter your academic results before applying.' });
    }

    // Check if already applied
    const existingApplication = await db.collection('jobApplications')
      .where('jobId', '==', req.params.jobId)
      .where('studentId', '==', req.user.uid)
      .get();
    
    if (!existingApplication.empty) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    const jobApplicationData = {
      jobId: req.params.jobId,
      studentId: req.user.uid,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };

    const docRef = await db.collection('jobApplications').add(jobApplicationData);
    res.status(201).json({ id: docRef.id, ...jobApplicationData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my job applications
router.get('/job-applications', authenticate, requireRole('student'), async (req, res) => {
  try {
    const applicationsSnapshot = await db.collection('jobApplications')
      .where('studentId', '==', req.user.uid)
      .get();
    
    const applications = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
      const appData = doc.data();
      const jobDoc = await db.collection('jobs').doc(appData.jobId).get();
      
      return {
        id: doc.id,
        ...appData,
        job: jobDoc.exists ? { id: jobDoc.id, ...jobDoc.data() } : null
      };
    }));
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

