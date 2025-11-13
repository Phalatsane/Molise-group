const express = require('express');
const router = express.Router();
const { db } = require('../server');
const { authenticate, requireRole } = require('../middleware/auth');

// Get all institutions
router.get('/institutions', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const institutionsSnapshot = await db.collection('institutions').get();
    const institutions = institutionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add institution
router.post('/institutions', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const institutionData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('institutions').add(institutionData);
    res.status(201).json({ id: docRef.id, ...institutionData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/institutions/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const doc = await db.collection('institutions').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Link institute user to institution
router.post('/institutions/:institutionId/link-institute', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || !req.params.institutionId) {
      return res.status(400).json({ error: 'userId and institutionId are required' });
    }

    // Allow admins to provide either Firebase UID or the user email
    let targetUserId = userId;
    let userDoc = await db.collection('users').doc(targetUserId).get();

    if (!userDoc.exists) {
      const snapshot = await db.collection('users').where('email', '==', userId).limit(1).get();
      if (snapshot.empty) {
        return res.status(404).json({ error: 'Institute user not found. Please use their Firebase UID or registered email.' });
      }
      userDoc = snapshot.docs[0];
      targetUserId = userDoc.id;
    }

    const institutionDoc = await db.collection('institutions').doc(req.params.institutionId).get();
    if (!institutionDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }


    // Write back to user document
    await db.collection('users').doc(targetUserId).set({
      institutionId: req.params.institutionId,
      institutionName: institutionDoc.data().name || ''
    }, { merge: true });

    // Also ensure the institute has a profile entry in institutes collection referencing this user
    await db.collection('institutions').doc(req.params.institutionId).set({
      linkedInstituteUserId: targetUserId
    }, { merge: true });

    res.json({ message: 'Institute linked to institution successfully' });
  } catch (error) {
    console.error('Link institute error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update institution
router.put('/institutions/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('institutions').doc(req.params.id).update(req.body);
    res.json({ message: 'Institution updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete institution
router.delete('/institutions/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('institutions').doc(req.params.id).delete();
    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add faculty to institution
router.post('/institutions/:institutionId/faculties', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const facultyData = {
      ...req.body,
      institutionId: req.params.institutionId,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('faculties').add(facultyData);
    res.status(201).json({ id: docRef.id, ...facultyData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all faculties (admin)
router.get('/faculties', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('faculties').get();
    const faculties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/institutions/:institutionId/faculties', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('faculties')
      .where('institutionId', '==', req.params.institutionId)
      .get();

    const faculties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add course to faculty
router.post('/faculties/:facultyId/courses', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      facultyId: req.params.facultyId,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('courses').add(courseData);
    res.status(201).json({ id: docRef.id, ...courseData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/courses', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/institutions/:institutionId/courses', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // First get faculties for this institution
    const facultiesSnap = await db.collection('faculties')
      .where('institutionId', '==', req.params.institutionId)
      .get();

    const facultyIds = facultiesSnap.docs.map(d => d.id);
    if (facultyIds.length === 0) {
      return res.json([]);
    }

    // Firestore 'in' supports up to 10 values; batch if needed
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < facultyIds.length; i += chunkSize) {
      chunks.push(facultyIds.slice(i, i + chunkSize));
    }

    const results = [];
    for (const ids of chunks) {
      const coursesSnap = await db.collection('courses')
        .where('facultyId', 'in', ids)
        .get();
      results.push(...coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggregated: faculties with institution names
router.get('/faculties-with-institutions', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [institutionsSnap, facultiesSnap] = await Promise.all([
      db.collection('institutions').get(),
      db.collection('faculties').get()
    ]);

    const instById = new Map(institutionsSnap.docs.map(d => [d.id, d.data().name || '']));
    const faculties = facultiesSnap.docs.map(d => {
      const f = { id: d.id, ...d.data() };
      return { ...f, institutionName: instById.get(f.institutionId) || 'N/A' };
    });
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggregated: courses with institution names
router.get('/courses-with-institutions', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [institutionsSnap, facultiesSnap, coursesSnap] = await Promise.all([
      db.collection('institutions').get(),
      db.collection('faculties').get(),
      db.collection('courses').get()
    ]);

    const instById = new Map(institutionsSnap.docs.map(d => [d.id, d.data().name || '']));
    const facultyById = new Map(facultiesSnap.docs.map(d => [d.id, d.data()]));

    const courses = coursesSnap.docs.map(d => {
      const c = { id: d.id, ...d.data() };
      const fac = facultyById.get(c.facultyId);
      const institutionName = fac ? instById.get(fac.institutionId) : 'N/A';
      return { ...c, institutionName };
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/faculties/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('faculties').doc(req.params.id).update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    res.json({ message: 'Faculty updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/faculties/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('faculties').doc(req.params.id).delete();
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course
router.put('/courses/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('courses').doc(req.params.id).update(req.body);
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course
router.delete('/courses/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('courses').doc(req.params.id).delete();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all companies
router.get('/companies', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const companiesSnapshot = await db.collection('companies').get();
    const companies = companiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve company
router.put('/companies/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('companies').doc(req.params.id).update({
      status: 'approved',
      approvedAt: new Date().toISOString()
    });
    res.json({ message: 'Company approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suspend company
router.put('/companies/:id/suspend', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('companies').doc(req.params.id).update({
      status: 'suspended',
      suspendedAt: new Date().toISOString()
    });
    res.json({ message: 'Company suspended successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete company
router.delete('/companies/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await db.collection('companies').doc(req.params.id).delete();
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system reports
router.get('/reports', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [users, institutions, companies, applications] = await Promise.all([
      db.collection('users').get(),
      db.collection('institutions').get(),
      db.collection('companies').get(),
      db.collection('applications').get()
    ]);

    res.json({
      totalUsers: users.size,
      totalInstitutions: institutions.size,
      totalCompanies: companies.size,
      totalApplications: applications.size,
      usersByRole: {
        admin: users.docs.filter(d => d.data().role === 'admin').length,
        institute: users.docs.filter(d => d.data().role === 'institute').length,
        student: users.docs.filter(d => d.data().role === 'student').length,
        company: users.docs.filter(d => d.data().role === 'company').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

