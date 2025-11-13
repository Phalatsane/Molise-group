const express = require('express');
const router = express.Router();
const { db } = require('../server');
const { authenticate, requireRole } = require('../middleware/auth');

const ensureInstitutionLink = async (uid) => {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  const userData = userSnap.data();
  let { institutionId, institutionName = '' } = userData || {};

  if (!institutionId) {
    const institutionPayload = {
      name: institutionName || 'New Institution',
      description: '',
      address: '',
      website: '',
      phone: '',
      createdAt: new Date().toISOString(),
      createdBy: uid
    };

    const instRef = await db.collection('institutions').add(institutionPayload);
    institutionId = instRef.id;
    await userRef.set({ institutionId }, { merge: true });
  }

  return { institutionId, userData };
};

// Get institute profile
router.get('/profile', authenticate, requireRole('institute'), async (req, res) => {
  try {
    const instituteDoc = await db.collection('users').doc(req.user.uid).get();
    if (!instituteDoc.exists) {
      return res.status(404).json({ error: 'Institute not found' });
    }
    res.json(instituteDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update institute profile
router.put('/profile', authenticate, requireRole('institute'), async (req, res) => {
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

// Get institution data
router.get('/institution', authenticate, requireRole('institute'), async (req, res) => {
  try {
    const { institutionId } = await ensureInstitutionLink(req.user.uid);

    const institutionDoc = await db.collection('institutions').doc(institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    res.json({ id: institutionDoc.id, ...institutionDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get faculties
router.get('/faculties', authenticate, requireRole('institute'), async (req, res) => {
  try {
    const { institutionId } = await ensureInstitutionLink(req.user.uid);

    const facultiesSnapshot = await db.collection('faculties')
      .where('institutionId', '==', institutionId)
      .get();
    
    const faculties = facultiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add faculty
router.post('/faculties', authenticate, requireRole('institute'), async (req, res) => {
  try {
    const { institutionId } = await ensureInstitutionLink(req.user.uid);

    const facultyData = {
      ...req.body,
      institutionId,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('faculties').add(facultyData);
    res.status(201).json({ id: docRef.id, ...facultyData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update faculty
router.put('/faculties/:id', authenticate, requireRole('institute'), async (req, res) => {
  try {
    await db.collection('faculties').doc(req.params.id).update(req.body);
    res.json({ message: 'Faculty updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete faculty
router.delete('/faculties/:id', authenticate, requireRole('institute'), async (req, res) => {
  try {
    await db.collection('faculties').doc(req.params.id).delete();
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get courses
router.get('/courses', authenticate, requireRole('institute'), async (req, res) => {
  try {
    const { institutionId } = await ensureInstitutionLink(req.user.uid);

    const facultiesSnapshot = await db.collection('faculties')
      .where('institutionId', '==', institutionId)
      .get();
    
    const facultyIds = facultiesSnapshot.docs.map(doc => doc.id);
    
    if (facultyIds.length === 0) {
      return res.json([]);
    }
    
    const coursesSnapshot = await db.collection('courses')
      .where('facultyId', 'in', facultyIds)
      .get();
    
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add course
router.post('/courses', authenticate, requireRole('institute'), async (req, res) => {
  try {
    const { institutionId } = await ensureInstitutionLink(req.user.uid);
    const courseData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    if (!courseData.facultyId) {
      return res.status(400).json({ error: 'facultyId is required' });
    }

    const docRef = await db.collection('courses').add(courseData);
    res.status(201).json({ id: docRef.id, ...courseData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course
router.put('/courses/:id', authenticate, requireRole('institute'), async (req, res) => {
  try {
    await db.collection('courses').doc(req.params.id).update(req.body);
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course
router.delete('/courses/:id', authenticate, requireRole('institute'), async (req, res) => {
  try {
    await db.collection('courses').doc(req.params.id).delete();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get applications
router.get('/applications', authenticate, requireRole('institute'), async (req, res) => {
  try {
    const { institutionId } = await ensureInstitutionLink(req.user.uid);

    const applicationsSnapshot = await db.collection('applications')
      .where('institutionId', '==', institutionId)
      .get();
    
    const applications = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
      const appData = doc.data();
      const studentDoc = await db.collection('users').doc(appData.studentId).get();
      const courseDoc = await db.collection('courses').doc(appData.courseId).get();
      
      return {
        id: doc.id,
        ...appData,
        student: studentDoc.exists ? studentDoc.data() : null,
        course: courseDoc.exists ? { id: courseDoc.id, ...courseDoc.data() } : null
      };
    }));
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update application status
router.put('/applications/:id/status', authenticate, requireRole('institute'), async (req, res) => {
  try {
    const { status } = req.body; // 'admitted', 'rejected', 'pending'
    
    const applicationDoc = await db.collection('applications').doc(req.params.id).get();
    if (!applicationDoc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const appData = applicationDoc.data();
    
    // If admitting, check if student is already admitted to another program
    if (status === 'admitted') {
      const existingAdmissions = await db.collection('applications')
        .where('studentId', '==', appData.studentId)
        .where('status', '==', 'admitted')
        .get();
      
      if (!existingAdmissions.empty) {
        return res.status(400).json({ 
          error: 'Student is already admitted to another program. They must select one first.' 
        });
      }
    }

    await db.collection('applications').doc(req.params.id).update({
      status,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish admissions
router.post('/publish-admissions', authenticate, requireRole('institute'), async (req, res) => {
  try {
    const userData = await db.collection('users').doc(req.user.uid).get();
    const institutionId = userData.data().institutionId;
    
    await db.collection('institutions').doc(institutionId).update({
      admissionsPublished: true,
      admissionsPublishedAt: new Date().toISOString()
    });
    
    res.json({ message: 'Admissions published successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

