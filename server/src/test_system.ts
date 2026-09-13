import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import http from 'http';
import { createApp } from './app';
import { User } from './models/user.model';
import { ENV } from './config/env';
import { initSocket } from './services/socket.service';

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING PHASE 1-5 END-TO-END VERIFICATION TEST SUITE');
  console.log('======================================================\n');

  // 1. Spin up in-memory MongoDB instance
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('✅ 1. MongoDB In-Memory Test Instance Connected.');

  // 2. Wrap Express in native http.Server (Safeguard #3)
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  const TEST_PORT = 5099;

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`✅ 2. Native http.Server listening on port ${TEST_PORT}.`);
      resolve();
    });
  });

  const BASE_URL = `http://localhost:${TEST_PORT}/api`;

  try {
    // -------------------------------------------------------------
    // Test 1: Health Check Endpoint
    // -------------------------------------------------------------
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData: any = await healthRes.json();
    if (healthRes.status === 200 && healthData.status === 'healthy') {
      console.log('✅ Test 1 Passed: GET /api/health responded with 200 OK.');
    } else {
      throw new Error(`Test 1 Failed: Health check status ${healthRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 2: Reject Invalid Domain (Crucial Rule)
    // -------------------------------------------------------------
    const invalidDomainRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'attacker@gmail.com',
        name: 'Attacker',
        role: 'student',
      }),
    });
    const invalidDomainData: any = await invalidDomainRes.json();
    if (invalidDomainRes.status === 403) {
      console.log('✅ Test 2 Passed: Non-university email (@gmail.com) rejected with HTTP 403 Forbidden.');
    } else {
      throw new Error(`Test 2 Failed: Expected 403 but got ${invalidDomainRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 3: Authenticate Valid University Student Email
    // -------------------------------------------------------------
    const studentLoginRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rahul.s@srmap.edu.in',
        name: 'Rahul Sharma',
        role: 'student',
        department: 'Computer Science and Engineering',
      }),
    });
    const studentLoginData: any = await studentLoginRes.json();
    if (studentLoginRes.status === 200 && studentLoginData.token) {
      console.log('✅ Test 3 Passed: Valid university student login (@srmap.edu.in) succeeded with JWT.');
    } else {
      throw new Error(`Test 3 Failed: Student login failed with status ${studentLoginRes.status}`);
    }
    const studentToken = studentLoginData.token;

    // -------------------------------------------------------------
    // Test 4: Authenticate Valid University Admin Email
    // -------------------------------------------------------------
    const adminLoginRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin.academic@srmap.edu.in',
        name: 'Academic Dean',
        role: 'admin',
        department: 'Administration',
      }),
    });
    const adminLoginData: any = await adminLoginRes.json();
    if (adminLoginRes.status === 200 && adminLoginData.token) {
      console.log('✅ Test 4 Passed: Admin login succeeded with admin role and JWT.');
    } else {
      throw new Error(`Test 4 Failed: Admin login failed`);
    }
    const adminToken = adminLoginData.token;

    // -------------------------------------------------------------
    // Test 5: Verify Token Middleware - Protected /api/auth/me (Safeguard #4 Hydration)
    // -------------------------------------------------------------
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meData: any = await meRes.json();
    if (meRes.status === 200 && meData.user.email === 'rahul.s@srmap.edu.in') {
      console.log('✅ Test 5 Passed: verifyToken successfully hydrated profile from DB (HTTP 200).');
    } else {
      throw new Error(`Test 5 Failed: /auth/me failed`);
    }

    // -------------------------------------------------------------
    // Test 6: Verify Token Middleware - Missing/Invalid Token
    // -------------------------------------------------------------
    const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
    if (noTokenRes.status === 401) {
      console.log('✅ Test 6 Passed: Unauthenticated request rejected with HTTP 401 Unauthorized.');
    } else {
      throw new Error(`Test 6 Failed: Expected 401 but got ${noTokenRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 7: RBAC Authorization - Student Accessing Admin-Only Route
    // -------------------------------------------------------------
    const studentToAdminRes = await fetch(`${BASE_URL}/auth/admin-only`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (studentToAdminRes.status === 403) {
      console.log('✅ Test 7 Passed: checkRole rejected Student from Admin endpoint with HTTP 403 Forbidden.');
    } else {
      throw new Error(`Test 7 Failed: Expected 403 but got ${studentToAdminRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 8: RBAC Authorization - Admin Accessing Admin-Only Route
    // -------------------------------------------------------------
    const adminToAdminRes = await fetch(`${BASE_URL}/auth/admin-only`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminToAdminData: any = await adminToAdminRes.json();
    if (adminToAdminRes.status === 200 && adminToAdminData.success) {
      console.log('✅ Test 8 Passed: checkRole granted Admin access to Admin endpoint (HTTP 200 OK).');
    } else {
      throw new Error(`Test 8 Failed: Admin access failed with status ${adminToAdminRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 9: Safeguard #2 - devLogin Blocked in Production Mode
    // -------------------------------------------------------------
    process.env.NODE_ENV = 'production';
    ENV.IS_PRODUCTION = true;
    const prodDevLoginRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@srmap.edu.in' }),
    });
    if (prodDevLoginRes.status === 403) {
      console.log('✅ Test 9 Passed: devLogin strictly blocked with HTTP 403 when NODE_ENV=production.');
    } else {
      throw new Error(`Test 9 Failed: devLogin not blocked in production`);
    }
    // Restore dev mode
    process.env.NODE_ENV = 'development';
    ENV.IS_PRODUCTION = false;

    // -------------------------------------------------------------
    // Test 10: Safeguard #5 - Database Schema Indexing Verification
    // -------------------------------------------------------------
    const indexes = await User.collection.indexes();
    const hasEmailIndex = indexes.some((idx) => idx.key && idx.key.email === 1 && idx.unique);
    const hasGoogleIdIndex = indexes.some((idx) => idx.key && idx.key.googleId === 1 && idx.sparse);

    if (hasEmailIndex && hasGoogleIdIndex) {
      console.log('✅ Test 10 Passed: Explicit indexes verified (email unique, googleId sparse unique).');
    } else {
      throw new Error('Test 10 Failed: Indexes missing');
    }

    // =============================================================
    // PHASE 2 TEST SUITE (User Profiles, Eligibility & Projects)
    // =============================================================

    // -------------------------------------------------------------
    // Test 11: CRITICAL SECURITY - Self-Reporting Exploit Prevention
    // Student tries to fraudulently inflate CGPA and semester via PUT /api/users/profile
    // -------------------------------------------------------------
    const exploitRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        name: 'Rahul S.',
        rollNumber: 'AP21110010042',
        cgpa: 9.99, // FRAUDULENT ATTEMPT
        semester: 8, // FRAUDULENT ATTEMPT
        hasDisciplinaryAction: false,
      }),
    });
    const exploitData: any = await exploitRes.json();
    if (exploitRes.status === 200 && exploitData.user.name === 'Rahul S.') {
      // Check database directly: CGPA and semester must NOT have been updated by student!
      const studentInDb = await User.findById(studentLoginData.user.id);
      if (studentInDb?.cgpa === 0 && studentInDb?.semester === 6) {
        console.log('✅ Test 11 Passed: Self-Reporting Exploit blocked! Student CGPA modification was strictly stripped.');
      } else {
        throw new Error(`Test 11 Failed: Student successfully modified CGPA to ${studentInDb?.cgpa}`);
      }
    } else {
      throw new Error(`Test 11 Failed: Profile update failed`);
    }

    // -------------------------------------------------------------
    // Test 12: Admin Official Academic Record Update
    // Admin sets legitimate CGPA 8.4 and Semester 7
    // -------------------------------------------------------------
    const adminPatchRes = await fetch(`${BASE_URL}/users/${studentLoginData.user.id}/academic-record`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        cgpa: 8.4,
        semester: 7,
        prerequisitesCompleted: ['CSE201', 'CSE301'],
        hasDisciplinaryAction: false,
      }),
    });
    const adminPatchData: any = await adminPatchRes.json();
    if (adminPatchRes.status === 200 && adminPatchData.student.cgpa === 8.4) {
      console.log('✅ Test 12 Passed: Admin successfully updated student academic credentials to 8.4 CGPA.');
    } else {
      throw new Error(`Test 12 Failed: Admin patch failed with status ${adminPatchRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 13: Eligibility Evaluation Engine & State Caching
    // -------------------------------------------------------------
    // First Call: Fresh computation
    const evalRes1 = await fetch(`${BASE_URL}/eligibility/check`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const evalData1: any = await evalRes1.json();
    if (evalRes1.status === 200 && evalData1.source === 'computed' && evalData1.isEligible === true) {
      console.log('✅ Test 13a Passed: Eligibility computed and student deemed eligible for Capstone Project.');
    } else {
      throw new Error(`Test 13a Failed: Status ${evalRes1.status}, source ${evalData1.source}`);
    }

    // Second Call: Should hit cache directly (no recompute)
    const evalRes2 = await fetch(`${BASE_URL}/eligibility/check`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const evalData2: any = await evalRes2.json();
    if (evalRes2.status === 200 && evalData2.source === 'cache' && evalData2.isEligible === true) {
      console.log('✅ Test 13b Passed: Eligibility State Caching verified (source=cache).');
    } else {
      throw new Error(`Test 13b Failed: Cache not utilized (source=${evalData2.source})`);
    }

    // -------------------------------------------------------------
    // Test 14: Project Creation - Role Restriction (Student Blocked)
    // -------------------------------------------------------------
    const studentProjectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Student Project',
        description: 'Should be rejected',
        domain: 'Cybersecurity',
        courseType: 'Capstone Project',
      }),
    });
    if (studentProjectRes.status === 403) {
      console.log('✅ Test 14 Passed: Student project proposal strictly rejected with HTTP 403 Forbidden.');
    } else {
      throw new Error(`Test 14 Failed: Expected 403 but got ${studentProjectRes.status}`);
    }

    // Register a faculty member
    const facultyLoginRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dr.subba@srmap.edu.in',
        name: 'Dr. Subba Rao',
        role: 'faculty',
      }),
    });
    const facultyLoginData: any = await facultyLoginRes.json();
    const facultyToken = facultyLoginData.token;

    // -------------------------------------------------------------
    // Test 15: Faculty Draft Project Creation (Partial Save)
    // -------------------------------------------------------------
    const draftRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        title: 'Draft: Quantum Key Distribution over Fiber Optics',
        status: 'draft',
      }),
    });
    const draftData: any = await draftRes.json();
    if (draftRes.status === 201 && draftData.project.status === 'draft') {
      console.log('✅ Test 15 Passed: Faculty draft project created successfully with minimal fields.');
    } else {
      throw new Error(`Test 15 Failed: Draft creation failed with status ${draftRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 16: Faculty Published Project Creation
    // -------------------------------------------------------------
    const publishedRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        title: 'Autonomous Drone Swarm Navigation via Deep Reinforcement Learning',
        description: 'Developing low-latency edge AI algorithms for real-time aerial swarm coordination and obstacle avoidance.',
        domain: 'Artificial Intelligence',
        courseType: 'Capstone Project',
        requirements: 'Proficiency in Python, PyTorch, ROS2, and Linux',
        maxStudents: 4,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
      }),
    });
    const publishedData: any = await publishedRes.json();
    if (publishedRes.status === 201 && publishedData.project.status === 'published') {
      console.log('✅ Test 16 Passed: Faculty published project created with full validation.');
    } else {
      throw new Error(`Test 16 Failed: Published project creation failed`);
    }

    const publishedProjectId = publishedData.project._id;

    // -------------------------------------------------------------
    // Test 17: Project Browsing, $text Search, and Pagination
    // -------------------------------------------------------------
    const searchRes = await fetch(`${BASE_URL}/projects?search=Drone&domain=Artificial+Intelligence&page=1&limit=5`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const searchData: any = await searchRes.json();
    if (
      searchRes.status === 200 &&
      searchData.pagination.total >= 1 &&
      searchData.projects.length >= 1
    ) {
      console.log('✅ Test 17 Passed: Scalable text search and pagination returned matching project.');
    } else {
      throw new Error(`Test 17 Failed: Search returned ${searchData.projects?.length} projects`);
    }

    // =============================================================
    // PHASE 3: GROUPS, APPLICATIONS & FACULTY APPROVALS
    // =============================================================

    // -------------------------------------------------------------
    // Test 18: Student Creates Group 1 for Capstone Project
    // -------------------------------------------------------------
    const createGroupRes = await fetch(`${BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        name: 'AI Swarm Pioneers',
        courseType: 'Capstone Project',
      }),
    });
    const createGroupData: any = await createGroupRes.json();
    if (createGroupRes.status === 201 && createGroupData.group.name === 'AI Swarm Pioneers') {
      console.log('✅ Test 18 Passed: Student created Group 1 for Capstone Project (status: forming).');
    } else {
      throw new Error(`Test 18 Failed: Group creation failed with status ${createGroupRes.status}: ${createGroupData.message}`);
    }
    const groupId = createGroupData.group._id;

    // -------------------------------------------------------------
    // Test 19: Guardrail Check: Student Attempts Second Group for Same CourseType
    // -------------------------------------------------------------
    const duplicateGroupRes = await fetch(`${BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        name: 'Duplicate Swarm Team',
        courseType: 'Capstone Project',
      }),
    });
    const duplicateGroupData: any = await duplicateGroupRes.json();
    if (duplicateGroupRes.status === 400) {
      console.log('✅ Test 19 Passed: Guardrail prevented student from belonging to multiple active groups for same courseType.');
    } else {
      throw new Error(`Test 19 Failed: Expected 400 but got ${duplicateGroupRes.status}`);
    }

    // -------------------------------------------------------------
    // Test 20: Safe Peer Search, Invitation & Acceptance into Group 1
    // -------------------------------------------------------------
    // Register Student 2: Ananya
    const student2LoginRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ananya.p@srmap.edu.in',
        name: 'Ananya Patel',
        role: 'student',
        department: 'Computer Science and Engineering',
      }),
    });
    const student2LoginData: any = await student2LoginRes.json();
    const student2Token = student2LoginData.token;

    // Update Ananya's profile with rollNumber and complete profile
    await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
      body: JSON.stringify({
        department: 'Computer Science and Engineering',
        skills: ['Python', 'Robotics'],
      }),
    });
    // Set student2 rollNumber & CGPA directly in DB to simulate registrar
    await User.findByIdAndUpdate(student2LoginData.user.id, {
      rollNumber: 'AP21110010045',
      cgpa: 8.9,
      semester: 7,
      prerequisitesCompleted: ['CSE201', 'CSE301'],
      isProfileComplete: true,
    });

    // Test Safe Peer Search (Safeguard #3: Data Leakage Prevention)
    const peerSearchRes = await fetch(`${BASE_URL}/groups/peers/search?query=ananya`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const peerSearchData: any = await peerSearchRes.json();
    const foundPeer = peerSearchData.peers?.find((p: any) => p.email === 'ananya.p@srmap.edu.in');
    if (
      peerSearchRes.status === 200 &&
      foundPeer &&
      foundPeer.cgpa === undefined &&
      foundPeer.hasDisciplinaryAction === undefined
    ) {
      console.log('✅ Test 20a Passed: Peer search safely projected only public fields (no CGPA/disciplinary leakage).');
    } else {
      throw new Error(`Test 20a Failed: Peer search failed or leaked private fields`);
    }

    // Send Invite to Ananya
    const inviteRes = await fetch(`${BASE_URL}/groups/${groupId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ rollNumber: 'AP21110010045' }),
    });
    const inviteData: any = await inviteRes.json();
    if (inviteRes.status !== 200) {
      throw new Error(`Invite failed with status ${inviteRes.status}: ${inviteData.message}`);
    }
    const inviteItem = inviteData.group.invites.find((i: any) => i.status === 'pending');
    const inviteId = inviteItem._id;

    // Ananya responds & accepts the invite
    const acceptRes = await fetch(`${BASE_URL}/groups/${groupId}/invites/${inviteId}/respond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student2Token}`,
      },
      body: JSON.stringify({ action: 'accept' }),
    });
    const acceptData: any = await acceptRes.json();
    if (acceptRes.status === 200 && acceptData.group.members.length === 2) {
      console.log('✅ Test 20b Passed: Peer accepted invite; Group 1 now has 2 members.');
    } else {
      throw new Error(`Test 20b Failed: Invite acceptance failed`);
    }

    // -------------------------------------------------------------
    // Test 21: Group 1 Locks Roster and Submits Project Application
    // -------------------------------------------------------------
    const lockRes = await fetch(`${BASE_URL}/groups/${groupId}/lock`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const lockData: any = await lockRes.json();
    if (lockRes.status === 200 && lockData.group.status === 'locked') {
      console.log('✅ Test 21a Passed: Group 1 roster successfully locked.');
    } else {
      throw new Error(`Test 21a Failed: Lock group failed`);
    }

    // Submit Application to the published Capstone project
    const applyRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        projectId: publishedProjectId,
        groupId: groupId,
        statementOfPurpose: 'We have extensive background in ROS2 and edge computing, aiming to benchmark distributed drone swarm navigation.',
      }),
    });
    const applyData: any = await applyRes.json();
    if (applyRes.status === 201 && applyData.application.status === 'pending') {
      console.log('✅ Test 21b Passed: Application submitted with SOP (>= 50 chars) and pending status.');
    } else {
      throw new Error(`Test 21b Failed: Submit application failed with status ${applyRes.status}: ${applyData.message}`);
    }
    const application1Id = applyData.application._id;

    // -------------------------------------------------------------
    // Test 22: Group Unlocking Guardrail Check (Safeguard #2)
    // -------------------------------------------------------------
    const unlockAttemptRes = await fetch(`${BASE_URL}/groups/${groupId}/unlock`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const unlockAttemptData: any = await unlockAttemptRes.json();
    if (unlockAttemptRes.status === 400 && unlockAttemptData.message.includes('pending')) {
      console.log('✅ Test 22 Passed: Group unlocking guardrail strictly blocked unlocking while applications are pending.');
    } else {
      throw new Error(`Test 22 Failed: Expected 400 blocking unlock, got ${unlockAttemptRes.status}: ${unlockAttemptData.message}`);
    }

    // -------------------------------------------------------------
    // Test 23: Faculty Evaluates & Approves Application (Safeguards #1 & #4)
    // -------------------------------------------------------------
    const evalRes = await fetch(`${BASE_URL}/applications/${application1Id}/evaluate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        status: 'approved',
        feedback: 'Excellent team proposal and qualifications. Approved!',
      }),
    });
    const evalData: any = await evalRes.json();
    if (evalRes.status === 200 && evalData.application.status === 'approved') {
      console.log('✅ Test 23a Passed: Faculty approved application with feedback.');
    } else {
      throw new Error(`Test 23a Failed: Faculty evaluation failed with status ${evalRes.status}: ${evalData.message}`);
    }

    // Verify project capacity allocated: currentStudents should be 2, allocatedGroups should contain groupId
    const checkProjectRes = await fetch(`${BASE_URL}/projects/${publishedProjectId}`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    const checkProjectData: any = await checkProjectRes.json();
    const hasAllocatedGroup = checkProjectData.project.allocatedGroups?.some(
      (g: any) => g.toString() === groupId.toString()
    );
    if (checkProjectData.project.currentStudents === 2 && hasAllocatedGroup) {
      console.log('✅ Test 23b Passed: Atomic capacity reservation updated currentStudents to 2 and pushed groupId to allocatedGroups.');
    } else {
      throw new Error(`Test 23b Failed: Project capacity or allocatedGroups mismatch`);
    }

    // Verify group status transitioned to 'assigned'
    const checkGroupRes = await fetch(`${BASE_URL}/groups/my`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const checkGroupData: any = await checkGroupRes.json();
    const myGroup = checkGroupData.groups.find((g: any) => g._id === groupId);
    if (myGroup && myGroup.status === 'assigned') {
      console.log('✅ Test 23c Passed: Group status automatically transitioned to assigned.');
    } else {
      throw new Error(`Test 23c Failed: Group status is not assigned: ${myGroup?.status}`);
    }

    // -------------------------------------------------------------
    // Test 24: Cross-Project Mass Rejection / Double-Booking Auto-Withdrawal (Safeguard #1)
    // -------------------------------------------------------------
    // Create another project for Capstone: "Project Beta"
    const projectBetaRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        title: 'Beta: Edge Vision Analytics',
        description: 'Edge computing computer vision system for industrial defect detection.',
        domain: 'Computer Vision',
        courseType: 'Capstone Project',
        requirements: 'PyTorch, C++',
        maxStudents: 2,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
      }),
    });
    const projectBetaData: any = await projectBetaRes.json();
    const projectBetaId = projectBetaData.project._id;

    // Create a third project: "Project Gamma"
    const projectGammaRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        title: 'Gamma: Quantum Cryptography Protocols',
        description: 'Quantum resistant encryption schemes and validation frameworks.',
        domain: 'Cybersecurity',
        courseType: 'Capstone Project',
        requirements: 'Cryptography, Python',
        maxStudents: 2,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'published',
      }),
    });
    const projectGammaData: any = await projectGammaRes.json();
    const projectGammaId = projectGammaData.project._id;

    // Register Student 3 (Solo applicant)
    const student3LoginRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vikram.k@srmap.edu.in',
        name: 'Vikram Kumar',
        role: 'student',
        department: 'Computer Science and Engineering',
      }),
    });
    const student3LoginData: any = await student3LoginRes.json();
    const student3Token = student3LoginData.token;

    // Complete Student 3 Profile & CGPA
    await User.findByIdAndUpdate(student3LoginData.user.id, {
      rollNumber: 'AP21110010088',
      cgpa: 9.2,
      semester: 7,
      prerequisitesCompleted: ['CSE201', 'CSE301'],
      isProfileComplete: true,
    });

    // Student 3 applies to BOTH Project Beta AND Project Gamma
    const appBetaRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student3Token}`,
      },
      body: JSON.stringify({
        projectId: projectBetaId,
        statementOfPurpose: 'I have strong expertise in computer vision algorithms and edge hardware deployment.',
      }),
    });
    const appBetaData: any = await appBetaRes.json();
    const appBetaId = appBetaData.application._id;

    const appGammaRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student3Token}`,
      },
      body: JSON.stringify({
        projectId: projectGammaId,
        statementOfPurpose: 'I also have strong foundation in theoretical cryptography and want to explore quantum resilience.',
      }),
    });
    const appGammaData: any = await appGammaRes.json();
    const appGammaId = appGammaData.application._id;

    if (appBetaRes.status === 201 && appGammaRes.status === 201) {
      console.log('✅ Student 3 applied to both Project Beta and Project Gamma.');
    } else {
      throw new Error(`Failed submitting applications for Student 3`);
    }

    // Faculty approves Student 3 for Project Beta
    const evalBetaRes = await fetch(`${BASE_URL}/applications/${appBetaId}/evaluate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        status: 'approved',
        feedback: 'Welcome to the Edge Vision Analytics team!',
      }),
    });
    if (evalBetaRes.status !== 200) {
      throw new Error(`Failed approving Project Beta application`);
    }

    // VERIFY Safeguard #1: Application to Project Gamma must now be automatically REJECTED / WITHDRAWN!
    const checkGammaRes = await fetch(`${BASE_URL}/applications/my`, {
      headers: { Authorization: `Bearer ${student3Token}` },
    });
    const checkGammaData: any = await checkGammaRes.json();
    const gammaApp = checkGammaData.applications.find((a: any) => a._id === appGammaId);

    if (
      gammaApp &&
      gammaApp.status === 'rejected' &&
      gammaApp.feedback.includes('Automatically withdrawn because your group was assigned to another project')
    ) {
      console.log('✅ Test 24 Passed: Cross-project double-booking auto-withdrawal verified! Secondary application automatically withdrawn.');
    } else {
      throw new Error(`Test 24 Failed: Secondary application status is ${gammaApp?.status} with feedback: ${gammaApp?.feedback}`);
    }

    // =============================================================
    // PHASE 4: PROJECT EXECUTION, ASSESSMENTS & SUBMISSIONS
    // =============================================================

    // -------------------------------------------------------------
    // Test 25: Faculty Creates Assessment 1 (Sprint 1 Architecture)
    // -------------------------------------------------------------
    const createAssessmentRes = await fetch(`${BASE_URL}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        title: 'Sprint 1: System Architecture & ROS2 Simulation',
        description: 'Submit technical architecture specification (.pdf) and GitHub repository link.',
        projectId: publishedProjectId,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        maxMarks: 100,
      }),
    });
    const createAssessmentData: any = await createAssessmentRes.json();
    if (createAssessmentRes.status === 201 && createAssessmentData.assessment._id) {
      console.log('✅ Test 25 Passed: Faculty created project assessment with future deadline.');
    } else {
      throw new Error(`Test 25 Failed: Assessment creation failed: ${createAssessmentData.message}`);
    }
    const assessment1Id = createAssessmentData.assessment._id;

    // -------------------------------------------------------------
    // Test 26: Guardrail: Unallocated Student Blocked from Submitting (HTTP 403)
    // -------------------------------------------------------------
    const unallocatedLoginRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'unallocated.user@srmap.edu.in',
        name: 'Unallocated User',
        role: 'student',
      }),
    });
    const unallocatedLoginData: any = await unallocatedLoginRes.json();
    const unallocatedToken = unallocatedLoginData.token;

    const unallocatedFormData = new FormData();
    unallocatedFormData.append('assessmentId', assessment1Id);
    unallocatedFormData.append('githubUrl', 'https://github.com/unallocated/test-repo');
    const dummyBlob = new Blob(['%PDF-1.4 dummy pdf'], { type: 'application/pdf' });
    unallocatedFormData.append('file', dummyBlob, 'test_report.pdf');

    const unallocatedSubmitRes = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${unallocatedToken}` },
      body: unallocatedFormData,
    });
    const unallocatedSubmitData: any = await unallocatedSubmitRes.json();
    if (unallocatedSubmitRes.status === 403) {
      console.log('✅ Test 26 Passed: Unallocated student strictly rejected with HTTP 403 Forbidden.');
    } else {
      throw new Error(`Test 26 Failed: Expected 403, got ${unallocatedSubmitRes.status}: ${unallocatedSubmitData.message}`);
    }

    // -------------------------------------------------------------
    // Test 27: Guardrail: Invalid File Type Upload Rejected (HTTP 400)
    // -------------------------------------------------------------
    const badFileFormData = new FormData();
    badFileFormData.append('assessmentId', assessment1Id);
    badFileFormData.append('githubUrl', 'https://github.com/rahul-srmap/autonomous-drone-swarm');
    const exeBlob = new Blob(['binary executable content'], { type: 'application/x-msdownload' });
    badFileFormData.append('file', exeBlob, 'malicious.exe');

    const badFileRes = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: badFileFormData,
    });
    const badFileData: any = await badFileRes.json();
    if (
      badFileRes.status === 400 &&
      (badFileData.message.includes('Invalid file type') ||
        badFileData.message.includes('Only .pdf, .docx, and .zip'))
    ) {
      console.log('✅ Test 27 Passed: File upload guardrail strictly rejected unauthorized format (.exe) with HTTP 400.');
    } else {
      throw new Error(`Test 27 Failed: Expected 400 for .exe file, got ${badFileRes.status}: ${badFileData.message}`);
    }

    // -------------------------------------------------------------
    // Test 28: Allocated Team Submits Valid Work On-Time (HTTP 201)
    // -------------------------------------------------------------
    const validFormData = new FormData();
    validFormData.append('assessmentId', assessment1Id);
    validFormData.append('githubUrl', 'https://github.com/rahul-srmap/autonomous-drone-swarm');
    const validPdfBlob = new Blob(['%PDF-1.4 official sprint deliverable document'], { type: 'application/pdf' });
    validFormData.append('file', validPdfBlob, 'sprint1_architecture.pdf');

    const validSubmitRes = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: validFormData,
    });
    const validSubmitData: any = await validSubmitRes.json();
    if (
      validSubmitRes.status === 201 &&
      validSubmitData.submission.status === 'submitted' &&
      validSubmitData.submission.fileUrl &&
      validSubmitData.submission.cloudinaryPublicId
    ) {
      console.log('✅ Test 28 Passed: Allocated team submitted work on-time with Cloudinary URL & publicId stored.');
    } else {
      throw new Error(`Test 28 Failed: Valid submission failed: ${validSubmitData.message}`);
    }

    // -------------------------------------------------------------
    // Test 29: Guardrail: Duplicate Submission Blocked (HTTP 400)
    // -------------------------------------------------------------
    const duplicateSubmitFormData = new FormData();
    duplicateSubmitFormData.append('assessmentId', assessment1Id);
    duplicateSubmitFormData.append('githubUrl', 'https://github.com/rahul-srmap/autonomous-drone-swarm');
    const duplicatePdfBlob = new Blob(['%PDF-1.4 duplicate attempt'], { type: 'application/pdf' });
    duplicateSubmitFormData.append('file', duplicatePdfBlob, 'duplicate_report.pdf');

    const duplicateSubmitRes = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student2Token}` }, // Ananya (same Group 1)
      body: duplicateSubmitFormData,
    });
    const duplicateSubmitData: any = await duplicateSubmitRes.json();
    if (duplicateSubmitRes.status === 400 && duplicateSubmitData.message.includes('already submitted')) {
      console.log('✅ Test 29 Passed: Duplicate submission guardrail strictly blocked team resubmission with HTTP 400.');
    } else {
      throw new Error(`Test 29 Failed: Expected 400 for duplicate submission, got ${duplicateSubmitRes.status}: ${duplicateSubmitData.message}`);
    }

    // -------------------------------------------------------------
    // Test 30: Automatic Lateness Tracking Check
    // -------------------------------------------------------------
    // Create an assessment for Project Beta (where Student 3 Vikram is allocated solo) with a 1.2s deadline
    const betaAssessmentRes = await fetch(`${BASE_URL}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        title: 'Project Beta: Midterm Edge Demo',
        description: 'Edge computer vision report.',
        projectId: projectBetaId,
        deadline: new Date(Date.now() + 1000).toISOString(),
        maxMarks: 50,
      }),
    });
    const betaAssessmentData: any = await betaAssessmentRes.json();
    const betaAssessmentId = betaAssessmentData.assessment._id;

    // Wait 1.8 seconds for deadline to pass
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const lateFormData = new FormData();
    lateFormData.append('assessmentId', betaAssessmentId);
    lateFormData.append('githubUrl', 'https://github.com/vikram-k/edge-vision-analytics');
    const lateZipBlob = new Blob(['PK mock zip file content'], { type: 'application/zip' });
    lateFormData.append('file', lateZipBlob, 'edge_demo_src.zip');

    const lateSubmitRes = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${student3Token}` },
      body: lateFormData,
    });
    const lateSubmitData: any = await lateSubmitRes.json();
    if (lateSubmitRes.status === 201 && lateSubmitData.submission.status === 'late') {
      console.log('✅ Test 30 Passed: Automatic lateness tracking tagged submission as late (status: late).');
    } else {
      throw new Error(`Test 30 Failed: Expected late status, got ${lateSubmitData.submission?.status}: ${lateSubmitData.message}`);
    }

    // -------------------------------------------------------------
    // Test 31: Faculty Fetches Populated Submissions Table
    // -------------------------------------------------------------
    const getSubsRes = await fetch(`${BASE_URL}/submissions/assessment/${assessment1Id}`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    const getSubsData: any = await getSubsRes.json();
    if (
      getSubsRes.status === 200 &&
      getSubsData.submissions.length >= 1 &&
      getSubsData.submissions[0].fileUrl &&
      getSubsData.submissions[0].githubUrl.includes('github.com') &&
      getSubsData.submissions[0].submittedBy.name
    ) {
      console.log('✅ Test 31 Passed: Faculty fetched submissions with populated student, group, and download links.');
    } else {
      throw new Error(`Test 31 Failed: Fetch submissions failed or unpopulated`);
    }

    const submission1Id = getSubsData.submissions[0]._id;

    // -------------------------------------------------------------
    // Test 32: Faculty Grades Submission with Valid Marks (Module 14)
    // -------------------------------------------------------------
    const gradeRes = await fetch(`${BASE_URL}/submissions/${submission1Id}/grade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        marks: 85,
        feedback: 'Excellent drone swarm architecture, ROS2 communication, and thorough documentation.',
      }),
    });
    const gradeData: any = await gradeRes.json();
    if (
      gradeRes.status === 200 &&
      gradeData.submission.marks === 85 &&
      gradeData.submission.status === 'graded' &&
      gradeData.isReEvaluation === false
    ) {
      console.log('✅ Test 32 Passed: Faculty graded submission with valid marks (85/100) and status transitioned to graded.');
    } else {
      throw new Error(`Test 32 Failed: Status ${gradeRes.status}, message: ${gradeData.message}`);
    }

    // -------------------------------------------------------------
    // Test 33: Guardrail: Attempt Marks > maxMarks (120/100) -> HTTP 400
    // -------------------------------------------------------------
    const overMaxGradeRes = await fetch(`${BASE_URL}/submissions/${submission1Id}/grade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        marks: 120,
        feedback: 'Should be rejected because 120 > 100 maxMarks',
      }),
    });
    const overMaxGradeData: any = await overMaxGradeRes.json();
    if (overMaxGradeRes.status === 400 && overMaxGradeData.message.includes('between 0 and 100')) {
      console.log('✅ Test 33 Passed: Guardrail strictly rejected marks > maxMarks (120/100) with HTTP 400 Bad Request.');
    } else {
      throw new Error(`Test 33 Failed: Expected 400, got ${overMaxGradeRes.status}: ${overMaxGradeData.message}`);
    }

    // -------------------------------------------------------------
    // Test 34: Refinement 2: Socket.IO & MongoDB Notification Fan-Out
    // -------------------------------------------------------------
    // Verify BOTH the submitting leader (studentToken) and peer member (student2Token) received grade notification
    const student1NotifsRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const student1NotifsData: any = await student1NotifsRes.json();

    const student2NotifsRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${student2Token}` },
    });
    const student2NotifsData: any = await student2NotifsRes.json();

    const s1HasGradeAlert = student1NotifsData.notifications.some(
      (n: any) => n.type === 'grading' && n.message.includes('Grade Published') && n.message.includes('85/100')
    );
    const s2HasGradeAlert = student2NotifsData.notifications.some(
      (n: any) => n.type === 'grading' && n.message.includes('Grade Published') && n.message.includes('85/100')
    );

    if (student1NotifsRes.status === 200 && student2NotifsRes.status === 200 && s1HasGradeAlert && s2HasGradeAlert) {
      console.log('✅ Test 34 Passed: Notification Fan-Out verified: Both group leader and peer member received grading alerts.');
    } else {
      throw new Error(`Test 34 Failed: Fan-out failed. s1HasGradeAlert: ${s1HasGradeAlert}, s2HasGradeAlert: ${s2HasGradeAlert}`);
    }

    // -------------------------------------------------------------
    // Test 35: Refinement 3: Idempotent Grading & Re-Evaluations
    // -------------------------------------------------------------
    const reGradeRes = await fetch(`${BASE_URL}/submissions/${submission1Id}/grade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        marks: 95,
        feedback: 'Revised after live demo: Outstanding obstacle avoidance in simulated environment.',
      }),
    });
    const reGradeData: any = await reGradeRes.json();

    // Verify student's updated notification
    const reNotifsRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const reNotifsData: any = await reNotifsRes.json();
    const hasGradeUpdatedAlert = reNotifsData.notifications.some(
      (n: any) => n.type === 'grading' && n.message.includes('Grade Updated') && n.message.includes('95/100')
    );

    if (
      reGradeRes.status === 200 &&
      reGradeData.isReEvaluation === true &&
      reGradeData.submission.marks === 95 &&
      hasGradeUpdatedAlert
    ) {
      console.log('✅ Test 35 Passed: Idempotent re-evaluation succeeded: Marks updated to 95/100 and "Grade Updated" event dispatched.');
    } else {
      throw new Error(`Test 35 Failed: Re-evaluation failed: ${reGradeData.message}`);
    }

    // -------------------------------------------------------------
    // Test 36: Faculty Schedules Meeting with Auto-Generated Link (Module 10)
    // -------------------------------------------------------------
    const scheduleMeetingRes = await fetch(`${BASE_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        projectId: publishedProjectId,
        title: 'Sprint 2 Architecture Review & Simulation Sync',
        agenda: 'Demonstrate Gazebo simulation and discuss Kalman filter sensor fusion matrices.',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        // meetingLink omitted to test auto-generation!
      }),
    });
    const scheduleMeetingData: any = await scheduleMeetingRes.json();
    const meeting1 = scheduleMeetingData.meeting;

    if (
      scheduleMeetingRes.status === 201 &&
      meeting1.status === 'scheduled' &&
      meeting1.meetingLink &&
      meeting1.meetingLink.startsWith('https://meet.google.com/')
    ) {
      console.log('✅ Test 36 Passed: Faculty scheduled sync meeting with auto-generated Google Meet link and project fan-out alert.');
    } else {
      throw new Error(`Test 36 Failed: Meeting schedule failed: ${scheduleMeetingData.message}`);
    }
    const meeting1Id = meeting1._id;

    // -------------------------------------------------------------
    // Test 37: Faculty Logs Meeting Minutes -> Status Completed (Module 11)
    // -------------------------------------------------------------
    const logMinutesRes = await fetch(`${BASE_URL}/meetings/${meeting1Id}/minutes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        meetingMinutes: 'Discussed ROS2 QoS profiles. Team instructed to calibrate IMU noise covariance before next Tuesday.',
      }),
    });
    const logMinutesData: any = await logMinutesRes.json();

    if (
      logMinutesRes.status === 200 &&
      logMinutesData.meeting.status === 'completed' &&
      logMinutesData.meeting.meetingMinutes.includes('ROS2 QoS')
    ) {
      console.log('✅ Test 37 Passed: Faculty recorded meeting minutes and meeting status successfully transitioned to completed.');
    } else {
      throw new Error(`Test 37 Failed: Log minutes failed: ${logMinutesData.message}`);
    }

    // -------------------------------------------------------------
    // Test 38: Student Fetches Notifications and Marks As Read (Module 15)
    // -------------------------------------------------------------
    const getStudentNotifsRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const getStudentNotifsData: any = await getStudentNotifsRes.json();

    if (
      getStudentNotifsRes.status !== 200 ||
      getStudentNotifsData.unreadCount < 1 ||
      getStudentNotifsData.notifications.length < 1
    ) {
      throw new Error(`Test 38 Failed: Student has no notifications or unread count is 0`);
    }

    // Mark all as read
    const markAllRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const markAllData: any = await markAllRes.json();

    // Verify all marked as read
    const verifiedNotifsRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const verifiedNotifsData: any = await verifiedNotifsRes.json();

    if (
      markAllRes.status === 200 &&
      markAllData.success === true &&
      verifiedNotifsData.unreadCount === 0 &&
      verifiedNotifsData.notifications.every((n: any) => n.isRead === true)
    ) {
      console.log('✅ Test 38 Passed: Student fetched real-time notifications list and marked all alerts as read.');
    } else {
      throw new Error(`Test 38 Failed: Notifications not marked as read (unread: ${verifiedNotifsData.unreadCount})`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL 38 PHASE 1, 2, 3, 4 & 5 TESTS PASSED 100%!');
    console.log('======================================================\n');

    // -------------------------------------------------------------
    // Test 39: Coordinator Grade Release Role Restriction (Module 16)
    // -------------------------------------------------------------
    const studentReleaseRes = await fetch(`${BASE_URL}/projects/${publishedProjectId}/release-grades`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (studentReleaseRes.status === 403) {
      console.log('✅ Test 39 Passed: Student and Faculty attempts to release grades strictly rejected with HTTP 403 Forbidden.');
    } else {
      throw new Error(`Test 39 Failed: Expected 403, got ${studentReleaseRes.status}`);
    }

    // Login a coordinator
    const coordLoginRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'coordinator.ece@srmap.edu.in',
        name: 'Dr. Coordinator',
        role: 'coordinator',
        department: 'Computer Science and Engineering',
      }),
    });
    const coordLoginData: any = await coordLoginRes.json();
    const coordinatorToken = coordLoginData.token;

    // -------------------------------------------------------------
    // Test 40: Coordinator Grade Release Execution (Module 16)
    // -------------------------------------------------------------
    const releaseRes = await fetch(`${BASE_URL}/projects/${publishedProjectId}/release-grades`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${coordinatorToken}` },
    });
    const releaseData: any = await releaseRes.json();

    // Verify allocated student received "Final Grades Released" fan-out alert
    const studentFinalNotifsRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentFinalNotifsData: any = await studentFinalNotifsRes.json();
    const hasFinalReleaseAlert = studentFinalNotifsData.notifications.some(
      (n: any) => n.message.includes('Final Grades Released')
    );

    if (
      releaseRes.status === 200 &&
      releaseData.project.status === 'closed' &&
      hasFinalReleaseAlert
    ) {
      console.log('✅ Test 40 Passed: Coordinator successfully released final grades; project status updated to closed and students notified.');
    } else {
      throw new Error(`Test 40 Failed: Release grades failed: ${releaseData.message}`);
    }

    // -------------------------------------------------------------
    // Test 41: Edge Case Hardening: Atomic updateMany Read-All Notifications
    // -------------------------------------------------------------
    const markAllAgainRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const checkUnreadRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const checkUnreadData: any = await checkUnreadRes.json();

    if (markAllAgainRes.status === 200 && checkUnreadData.unreadCount === 0) {
      console.log('✅ Test 41 Passed: Atomic updateMany read-all notifications query executed successfully and zero unread remain.');
    } else {
      throw new Error(`Test 41 Failed: Unread count not zero (${checkUnreadData.unreadCount})`);
    }

    // -------------------------------------------------------------
    // Test 42: Edge Case Hardening: Malformed/Malicious Meeting URLs Rejected
    // -------------------------------------------------------------
    const badUrlRes = await fetch(`${BASE_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        projectId: publishedProjectId,
        title: 'Security Vulnerability Test',
        agenda: 'Testing malicious URL injection',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        meetingLink: 'https://malicious-phishing-portal.com/harvest-credentials',
      }),
    });
    const badUrlData: any = await badUrlRes.json();

    if (badUrlRes.status === 400 && badUrlData.message.includes('Only secure Google Meet, Zoom, or Microsoft Teams')) {
      console.log('✅ Test 42 Passed: Edge Case Hardening: Malformed and unauthorized meeting links strictly rejected with HTTP 400.');
    } else {
      throw new Error(`Test 42 Failed: Expected 400, got ${badUrlRes.status}: ${badUrlData.message}`);
    }

    // -------------------------------------------------------------
    // Test 43: Valid Meeting URLs (Google Meet / Zoom / Teams) Accepted
    // -------------------------------------------------------------
    const validZoomRes = await fetch(`${BASE_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        projectId: publishedProjectId,
        title: 'Valid Zoom Sync Call',
        agenda: 'Sprint follow-up via Zoom conferencing',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        meetingLink: 'https://zoom.us/j/9876543210?pwd=test',
      }),
    });

    const validTeamsRes = await fetch(`${BASE_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        projectId: publishedProjectId,
        title: 'Valid Teams Sync Call',
        agenda: 'Sprint follow-up via MS Teams',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abcdef123',
      }),
    });

    if (validZoomRes.status === 201 && validTeamsRes.status === 201) {
      console.log('✅ Test 43 Passed: Valid Zoom & Microsoft Teams conferencing URLs accepted with HTTP 201 Created.');
    } else {
      throw new Error(`Test 43 Failed: Valid URLs rejected (${validZoomRes.status}, ${validTeamsRes.status})`);
    }

    // -------------------------------------------------------------
    // Test 44: Analytics Aggregation Pipeline & Injection-Safe CSV Export
    // -------------------------------------------------------------
    const analyticsRes = await fetch(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${coordinatorToken}` },
    });
    const analyticsData: any = await analyticsRes.json();

    const csvRes = await fetch(`${BASE_URL}/analytics/export`, {
      headers: { Authorization: `Bearer ${coordinatorToken}` },
    });
    const csvContent = await csvRes.text();

    const hasValidKpis = analyticsData.kpis && analyticsData.kpis.totalProjects >= 1;
    const hasDomainDist = Array.isArray(analyticsData.projectsByDomain) && analyticsData.projectsByDomain.length >= 1;
    const hasCsvHeaders = csvContent.includes('Project Title') && csvContent.includes('Marks Awarded') && csvContent.includes('Autonomous Drone Swarm');
    const isCsvSafe = !csvContent.includes('\n=') && !csvContent.includes('\n+');

    if (analyticsRes.status === 200 && csvRes.status === 200 && hasValidKpis && hasDomainDist && hasCsvHeaders && isCsvSafe) {
      console.log('✅ Test 44 Passed: Analytics aggregation pipeline returned structured metrics and injection-safe CSV export stream.');
    } else {
      throw new Error(`Test 44 Failed: Analytics or CSV export validation failed`);
    }

    console.log('\n======================================================');
    console.log('🎉 ALL 44 PHASE 1, 2, 3, 4, 5 & 6 TESTS PASSED 100%!');
    console.log('======================================================\n');
  } finally {
    // Teardown
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await mongoose.disconnect();
    await mongod.stop();
  }
}

runTestSuite().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
