const express = require('express');
const router = express.Router();
const { db } = require('../server');
const { authenticate, requireRole } = require('../middleware/auth');

// Get company profile
router.get('/profile', authenticate, requireRole('company'), async (req, res) => {
  try {
    const companyDoc = await db.collection('companies').doc(req.user.uid).get();
    if (!companyDoc.exists) {
      // Create default company profile if it doesn't exist
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      const defaultProfile = {
        companyName: userData.companyName || '',
        email: userData.email || '',
        status: userData.status || 'pending',
        website: '',
        phone: '',
        address: '',
        description: '',
        industry: '',
        companySize: '',
        createdAt: new Date().toISOString()
      };
      await db.collection('companies').doc(req.user.uid).set(defaultProfile);
      return res.json(defaultProfile);
    }
    res.json(companyDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update company profile
router.put('/profile', authenticate, requireRole('company'), async (req, res) => {
  try {
    await db.collection('companies').doc(req.user.uid).set({
      ...req.body,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Keep user document in sync for quick access
    await db.collection('users').doc(req.user.uid).set({
      ...req.body,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post job
router.post('/jobs', authenticate, requireRole('company'), async (req, res) => {
  try {
    const userData = await db.collection('users').doc(req.user.uid).get();
    const companyData = userData.data();
    
    const jobData = {
      ...req.body,
      companyId: req.user.uid,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('jobs').add(jobData);
    
    // Find and notify qualified students
    await notifyQualifiedStudents(docRef.id, jobData);
    
    res.status(201).json({ id: docRef.id, ...jobData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company jobs
router.get('/jobs', authenticate, requireRole('company'), async (req, res) => {
  try {
    const jobsSnapshot = await db.collection('jobs')
      .where('companyId', '==', req.user.uid)
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

// Update job
router.put('/jobs/:id', authenticate, requireRole('company'), async (req, res) => {
  try {
    const jobDoc = await db.collection('jobs').doc(req.params.id).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobDoc.data().companyId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.collection('jobs').doc(req.params.id).update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete job
router.delete('/jobs/:id', authenticate, requireRole('company'), async (req, res) => {
  try {
    const jobDoc = await db.collection('jobs').doc(req.params.id).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobDoc.data().companyId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.collection('jobs').doc(req.params.id).delete();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get qualified applicants for a job
router.get('/jobs/:jobId/applicants', authenticate, requireRole('company'), async (req, res) => {
  try {
    const jobDoc = await db.collection('jobs').doc(req.params.jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobDoc.data().companyId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const job = jobDoc.data();
    
    // Get all job applications for this job
    const applicationsSnapshot = await db.collection('jobApplications')
      .where('jobId', '==', req.params.jobId)
      .get();
    
    const qualifiedApplicants = [];
    
  for (const appDoc of applicationsSnapshot.docs) {
      const appData = appDoc.data();
      const studentDoc = await db.collection('users').doc(appData.studentId).get();
      
      if (!studentDoc.exists) continue;
      
      const studentData = studentDoc.data();
      
    const isQualified = isStudentQualified(studentData, job.requirements);
    const matchScore = calculateMatchScore(studentData, job.requirements);
    
    qualifiedApplicants.push({
      applicationId: appDoc.id,
      student: {
        uid: studentData.uid,
        email: studentData.email,
        name: studentData.name,
        transcriptEntries: studentData.transcriptEntries || [],
        additionalCertificates: studentData.additionalCertificates || [],
        workExperience: studentData.workExperience || []
      },
      isQualified,
      matchScore,
      appliedAt: appData.appliedAt,
      status: appData.status
    });
    }
    
    // Sort by match score
    qualifiedApplicants.sort((a, b) => b.matchScore - a.matchScore);
    
    res.json(qualifiedApplicants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to check if student is qualified
function isStudentQualified(studentData, requirements) {
  if (!studentData.transcriptEntries || studentData.transcriptEntries.length === 0) {
    return false;
  }

  if (!requirements) {
    return true;
  }

  // Check academic performance
  if (requirements.minGPA && studentData.gpa < requirements.minGPA) {
    return false;
  }

  // Check required certificates
  if (requirements.requiredCertificates) {
    const studentCerts = (studentData.additionalCertificates || []).map(c => c.name.toLowerCase());
    for (const reqCert of requirements.requiredCertificates) {
      if (!studentCerts.includes(reqCert.toLowerCase())) {
        return false;
      }
    }
  }

  // Check work experience
  if (requirements.minExperienceYears) {
    const totalExperience = (studentData.workExperience || []).reduce((sum, exp) => {
      return sum + (exp.years || 0);
    }, 0);
    
    if (totalExperience < requirements.minExperienceYears) {
      return false;
    }
  }

  return true;
}

// Helper function to calculate match score
function calculateMatchScore(studentData, requirements) {
  let score = 0;

  // Academic performance (40%)
  if (studentData.gpa) {
    score += (studentData.gpa / 4.0) * 40;
  }

  // Certificates (30%)
  if (requirements.requiredCertificates && studentData.additionalCertificates) {
    const studentCerts = studentData.additionalCertificates.map(c => c.name.toLowerCase());
    const matchedCerts = requirements.requiredCertificates.filter(reqCert =>
      studentCerts.includes(reqCert.toLowerCase())
    ).length;
    score += (matchedCerts / requirements.requiredCertificates.length) * 30;
  }

  // Work experience (30%)
  if (studentData.workExperience && studentData.workExperience.length > 0) {
    const totalExperience = studentData.workExperience.reduce((sum, exp) => {
      return sum + (exp.years || 0);
    }, 0);
    score += Math.min((totalExperience / 5) * 30, 30); // Cap at 5 years
  }

  return Math.round(score);
}

// Helper function to notify qualified students
async function notifyQualifiedStudents(jobId, jobData) {
  try {
    const studentsSnapshot = await db.collection('users')
      .where('role', '==', 'student')
      .where('transcriptComplete', '==', true)
      .get();
    
    const qualifiedStudents = [];
    
    for (const studentDoc of studentsSnapshot.docs) {
      const studentData = studentDoc.data();
    if (isStudentQualified(studentData, jobData.requirements)) {
        qualifiedStudents.push(studentData);
      }
    }
    
    // Create notifications for qualified students
    for (const student of qualifiedStudents) {
      await db.collection('notifications').add({
        userId: student.uid,
        type: 'job_opportunity',
        title: 'New Job Opportunity',
        message: `A new job opportunity matching your profile has been posted: ${jobData.title}`,
        jobId: jobId,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error notifying students:', error);
  }
}

module.exports = router;

