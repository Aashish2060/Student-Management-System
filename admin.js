// Admin Module - All admin related functions
const Admin = {
    currentPage: 'overview',

    // Load admin dashboard
    load() {
        const user = Auth.getCurrentUser();
        document.getElementById('adminName').textContent = user.name;
        
        // Setup navigation
        const navItems = document.querySelectorAll('#adminNav li');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                Admin.loadPage(this.dataset.page);
            });
        });

        this.loadPage('overview');
    },

    // Load specific page
    loadPage(page) {
        this.currentPage = page;
        const content = document.getElementById('adminContent');
        
        switch(page) {
            case 'overview':
                content.innerHTML = this.getOverviewHTML();
                break;
            case 'students':
                content.innerHTML = this.getStudentsHTML();
                this.setupStudentHandlers();
                break;
            case 'teachers':
                content.innerHTML = this.getTeachersHTML();
                this.setupTeacherHandlers();
                break;
            case 'classes':
                content.innerHTML = this.getClassesHTML();
                this.setupClassHandlers();
                break;
            case 'subjects':
                content.innerHTML = this.getSubjectsHTML();
                this.setupSubjectHandlers();
                break;
            case 'users':
                content.innerHTML = this.getUsersHTML();
                this.setupUserHandlers();
                break;
        }
    },

    // Overview Page
    getOverviewHTML() {
        const students = DataStore.get('students');
        const teachers = DataStore.get('teachers');
        const classes = DataStore.get('classes');
        const subjects = DataStore.get('subjects');

        return `
            <div class="content-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Welcome to the Student Management System</p>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Students</h3>
                    <div class="number">${students.length}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Teachers</h3>
                    <div class="number">${teachers.length}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Classes</h3>
                    <div class="number">${classes.length}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Subjects</h3>
                    <div class="number">${subjects.length}</div>
                </div>
            </div>
        `;
    },

    // Students Page
    getStudentsHTML() {
        const students = DataStore.get('students');
        const classes = DataStore.get('classes');

        let rows = students.map(student => {
            const className = classes.find(c => c.id === student.class)?.name || 'N/A';
            return `
                <tr>
                    <td>${student.rollNo}</td>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${className}</td>
                    <td>${student.phone}</td>
                    <td>
                        <button class="btn btn-small btn-secondary edit-student" data-id="${student.id}">Edit</button>
                        <button class="btn btn-small btn-danger delete-student" data-id="${student.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        const classOptions = classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>Student Management</h1>
                </div>
                <button class="btn" id="addStudentBtn">Add New Student</button>
            </div>
            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Class</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="6">No students found</td></tr>'}</tbody>
                </table>
            </div>
            
            <div id="studentModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="studentModalTitle">Add Student</h2>
                        <span class="close-btn" id="closeStudentModal">&times;</span>
                    </div>
                    <form id="studentForm">
                        <input type="hidden" id="studentId">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" id="studentName" required>
                            </div>
                            <div class="form-group">
                                <label>Roll Number</label>
                                <input type="text" id="studentRollNo" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="studentEmail" required>
                            </div>
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" id="studentPhone" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date of Birth</label>
                                <input type="date" id="studentDob" required>
                            </div>
                            <div class="form-group">
                                <label>Class</label>
                                <select id="studentClass" required>
                                    <option value="">Select Class</option>
                                    ${classOptions}
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="btn">Save Student</button>
                    </form>
                </div>
            </div>
        `;
    },

    setupStudentHandlers() {
        // Add button
        document.getElementById('addStudentBtn')?.addEventListener('click', () => {
            document.getElementById('studentModalTitle').textContent = 'Add Student';
            document.getElementById('studentForm').reset();
            document.getElementById('studentId').value = '';
            document.getElementById('studentModal').classList.add('active');
        });

        // Close button
        document.getElementById('closeStudentModal')?.addEventListener('click', () => {
            document.getElementById('studentModal').classList.remove('active');
        });

        // Form submit
        document.getElementById('studentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('studentId').value;
            const student = {
                name: document.getElementById('studentName').value,
                rollNo: document.getElementById('studentRollNo').value,
                email: document.getElementById('studentEmail').value,
                phone: document.getElementById('studentPhone').value,
                dob: document.getElementById('studentDob').value,
                class: parseInt(document.getElementById('studentClass').value)
            };

            if (id) {
                DataStore.update('students', parseInt(id), student);
            } else {
                student.id = DataStore.getNextId('students');
                DataStore.add('students', student);
            }

            document.getElementById('studentModal').classList.remove('active');
            this.loadPage('students');
        });

        // Edit buttons
        document.querySelectorAll('.edit-student').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const student = DataStore.get('students').find(s => s.id === id);
                if (student) {
                    document.getElementById('studentModalTitle').textContent = 'Edit Student';
                    document.getElementById('studentId').value = student.id;
                    document.getElementById('studentName').value = student.name;
                    document.getElementById('studentRollNo').value = student.rollNo;
                    document.getElementById('studentEmail').value = student.email;
                    document.getElementById('studentPhone').value = student.phone;
                    document.getElementById('studentDob').value = student.dob;
                    document.getElementById('studentClass').value = student.class;
                    document.getElementById('studentModal').classList.add('active');
                }
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-student').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this student?')) {
                    DataStore.delete('students', parseInt(btn.dataset.id));
                    this.loadPage('students');
                }
            });
        });
    },

    // Similar structure for Teachers
    getTeachersHTML() {
        const teachers = DataStore.get('teachers');
        const subjects = DataStore.get('subjects');

        let rows = teachers.map(teacher => {
            const subjectName = subjects.find(s => s.id === teacher.subject)?.name || 'N/A';
            return `
                <tr>
                    <td>${teacher.name}</td>
                    <td>${teacher.email}</td>
                    <td>${subjectName}</td>
                    <td>${teacher.qualification}</td>
                    <td>${teacher.phone}</td>
                    <td>
                        <button class="btn btn-small btn-secondary edit-teacher" data-id="${teacher.id}">Edit</button>
                        <button class="btn btn-small btn-danger delete-teacher" data-id="${teacher.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        const subjectOptions = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>Teacher Management</h1>
                </div>
                <button class="btn" id="addTeacherBtn">Add New Teacher</button>
            </div>
            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject</th>
                            <th>Qualification</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="6">No teachers found</td></tr>'}</tbody>
                </table>
            </div>
            
            <div id="teacherModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="teacherModalTitle">Add Teacher</h2>
                        <span class="close-btn" id="closeTeacherModal">&times;</span>
                    </div>
                    <form id="teacherForm">
                        <input type="hidden" id="teacherId">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" id="teacherName" required>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="teacherEmail" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" id="teacherPhone" required>
                            </div>
                            <div class="form-group">
                                <label>Subject</label>
                                <select id="teacherSubject" required>
                                    <option value="">Select Subject</option>
                                    ${subjectOptions}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Qualification</label>
                            <input type="text" id="teacherQualification" required>
                        </div>
                        <button type="submit" class="btn">Save Teacher</button>
                    </form>
                </div>
            </div>
        `;
    },

    setupTeacherHandlers() {
        document.getElementById('addTeacherBtn')?.addEventListener('click', () => {
            document.getElementById('teacherModalTitle').textContent = 'Add Teacher';
            document.getElementById('teacherForm').reset();
            document.getElementById('teacherId').value = '';
            document.getElementById('teacherModal').classList.add('active');
        });

        document.getElementById('closeTeacherModal')?.addEventListener('click', () => {
            document.getElementById('teacherModal').classList.remove('active');
        });

        document.getElementById('teacherForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('teacherId').value;
            const teacher = {
                name: document.getElementById('teacherName').value,
                email: document.getElementById('teacherEmail').value,
                phone: document.getElementById('teacherPhone').value,
                subject: parseInt(document.getElementById('teacherSubject').value),
                qualification: document.getElementById('teacherQualification').value
            };

            if (id) {
                DataStore.update('teachers', parseInt(id), teacher);
            } else {
                teacher.id = DataStore.getNextId('teachers');
                DataStore.add('teachers', teacher);
            }

            document.getElementById('teacherModal').classList.remove('active');
            this.loadPage('teachers');
        });

        document.querySelectorAll('.edit-teacher').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const teacher = DataStore.get('teachers').find(t => t.id === id);
                if (teacher) {
                    document.getElementById('teacherModalTitle').textContent = 'Edit Teacher';
                    document.getElementById('teacherId').value = teacher.id;
                    document.getElementById('teacherName').value = teacher.name;
                    document.getElementById('teacherEmail').value = teacher.email;
                    document.getElementById('teacherPhone').value = teacher.phone;
                    document.getElementById('teacherSubject').value = teacher.subject;
                    document.getElementById('teacherQualification').value = teacher.qualification;
                    document.getElementById('teacherModal').classList.add('active');
                }
            });
        });

        document.querySelectorAll('.delete-teacher').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this teacher?')) {
                    DataStore.delete('teachers', parseInt(btn.dataset.id));
                    this.loadPage('teachers');
                }
            });
        });
    },

    // Classes Management
    getClassesHTML() {
        const classes = DataStore.get('classes');

        let rows = classes.map(cls => `
            <tr>
                <td>${cls.name}</td>
                <td>${cls.grade}</td>
                <td>${cls.section}</td>
                <td>
                    <button class="btn btn-small btn-secondary edit-class" data-id="${cls.id}">Edit</button>
                    <button class="btn btn-small btn-danger delete-class" data-id="${cls.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>Class Management</h1>
                </div>
                <button class="btn" id="addClassBtn">Add New Class</button>
            </div>
            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Class Name</th>
                            <th>Grade</th>
                            <th>Section</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="4">No classes found</td></tr>'}</tbody>
                </table>
            </div>
            
            <div id="classModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="classModalTitle">Add Class</h2>
                        <span class="close-btn" id="closeClassModal">&times;</span>
                    </div>
                    <form id="classForm">
                        <input type="hidden" id="classId">
                        <div class="form-group">
                            <label>Class Name</label>
                            <input type="text" id="className" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Grade</label>
                                <input type="text" id="classGrade" required>
                            </div>
                            <div class="form-group">
                                <label>Section</label>
                                <input type="text" id="classSection" required>
                            </div>
                        </div>
                        <button type="submit" class="btn">Save Class</button>
                    </form>
                </div>
            </div>
        `;
    },

    setupClassHandlers() {
        document.getElementById('addClassBtn')?.addEventListener('click', () => {
            document.getElementById('classModalTitle').textContent = 'Add Class';
            document.getElementById('classForm').reset();
            document.getElementById('classId').value = '';
            document.getElementById('classModal').classList.add('active');
        });

        document.getElementById('closeClassModal')?.addEventListener('click', () => {
            document.getElementById('classModal').classList.remove('active');
        });

        document.getElementById('classForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('classId').value;
            const cls = {
                name: document.getElementById('className').value,
                grade: document.getElementById('classGrade').value,
                section: document.getElementById('classSection').value
            };

            if (id) {
                DataStore.update('classes', parseInt(id), cls);
            } else {
                cls.id = DataStore.getNextId('classes');
                DataStore.add('classes', cls);
            }

            document.getElementById('classModal').classList.remove('active');
            this.loadPage('classes');
        });

        document.querySelectorAll('.edit-class').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const cls = DataStore.get('classes').find(c => c.id === id);
                if (cls) {
                    document.getElementById('classModalTitle').textContent = 'Edit Class';
                    document.getElementById('classId').value = cls.id;
                    document.getElementById('className').value = cls.name;
                    document.getElementById('classGrade').value = cls.grade;
                    document.getElementById('classSection').value = cls.section;
                    document.getElementById('classModal').classList.add('active');
                }
            });
        });

        document.querySelectorAll('.delete-class').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this class?')) {
                    DataStore.delete('classes', parseInt(btn.dataset.id));
                    this.loadPage('classes');
                }
            });
        });
    },

    // Subjects Management
    getSubjectsHTML() {
        const subjects = DataStore.get('subjects');

        let rows = subjects.map(subject => `
            <tr>
                <td>${subject.code}</td>
                <td>${subject.name}</td>
                <td>${subject.description}</td>
                <td>
                    <button class="btn btn-small btn-secondary edit-subject" data-id="${subject.id}">Edit</button>
                    <button class="btn btn-small btn-danger delete-subject" data-id="${subject.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>Subject Management</h1>
                </div>
                <button class="btn" id="addSubjectBtn">Add New Subject</button>
            </div>
            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="4">No subjects found</td></tr>'}</tbody>
                </table>
            </div>
            
            <div id="subjectModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="subjectModalTitle">Add Subject</h2>
                        <span class="close-btn" id="closeSubjectModal">&times;</span>
                    </div>
                    <form id="subjectForm">
                        <input type="hidden" id="subjectId">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Subject Code</label>
                                <input type="text" id="subjectCode" required>
                            </div>
                            <div class="form-group">
                                <label>Subject Name</label>
                                <input type="text" id="subjectName" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="subjectDescription" rows="3" required></textarea>
                        </div>
                        <button type="submit" class="btn">Save Subject</button>
                    </form>
                </div>
            </div>
        `;
    },

    setupSubjectHandlers() {
        document.getElementById('addSubjectBtn')?.addEventListener('click', () => {
            document.getElementById('subjectModalTitle').textContent = 'Add Subject';
            document.getElementById('subjectForm').reset();
            document.getElementById('subjectId').value = '';
            document.getElementById('subjectModal').classList.add('active');
        });

        document.getElementById('closeSubjectModal')?.addEventListener('click', () => {
            document.getElementById('subjectModal').classList.remove('active');
        });

        document.getElementById('subjectForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('subjectId').value;
            const subject = {
                code: document.getElementById('subjectCode').value,
                name: document.getElementById('subjectName').value,
                description: document.getElementById('subjectDescription').value
            };

            if (id) {
                DataStore.update('subjects', parseInt(id), subject);
            } else {
                subject.id = DataStore.getNextId('subjects');
                DataStore.add('subjects', subject);
            }

            document.getElementById('subjectModal').classList.remove('active');
            this.loadPage('subjects');
        });

        document.querySelectorAll('.edit-subject').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const subject = DataStore.get('subjects').find(s => s.id === id);
                if (subject) {
                    document.getElementById('subjectModalTitle').textContent = 'Edit Subject';
                    document.getElementById('subjectId').value = subject.id;
                    document.getElementById('subjectCode').value = subject.code;
                    document.getElementById('subjectName').value = subject.name;
                    document.getElementById('subjectDescription').value = subject.description;
                    document.getElementById('subjectModal').classList.add('active');
                }
            });
        });

        document.querySelectorAll('.delete-subject').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this subject?')) {
                    DataStore.delete('subjects', parseInt(btn.dataset.id));
                    this.loadPage('subjects');
                }
            });
        });
    },

    // User Management
    getUsersHTML() {
        const users = DataStore.get('users');
        const students = DataStore.get('students');
        const teachers = DataStore.get('teachers');

        let rows = users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-small btn-secondary edit-user" data-id="${user.id}">Edit</button>
                    <button class="btn btn-small btn-danger delete-user" data-id="${user.id}" ${user.id === 1 ? 'disabled' : ''}>Delete</button>
                </td>
            </tr>
        `).join('');

        const studentOptions = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        const teacherOptions = teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>User Management</h1>
                </div>
                <button class="btn" id="addUserBtn">Add New User</button>
            </div>
            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="4">No users found</td></tr>'}</tbody>
                </table>
            </div>
            
            <div id="userModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="userModalTitle">Add User</h2>
                        <span class="close-btn" id="closeUserModal">&times;</span>
                    </div>
                    <form id="userForm">
                        <input type="hidden" id="userId">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" id="userUsername" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" id="userPassword" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" id="userName" required>
                            </div>
                            <div class="form-group">
                                <label>Role</label>
                                <select id="userRole" required>
                                    <option value="">Select Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group hidden" id="studentLinkGroup">
                            <label>Link to Student</label>
                            <select id="userStudentId">
                                <option value="">Select Student</option>
                                ${studentOptions}
                            </select>
                        </div>
                        <div class="form-group hidden" id="teacherLinkGroup">
                            <label>Link to Teacher</label>
                            <select id="userTeacherId">
                                <option value="">Select Teacher</option>
                                ${teacherOptions}
                            </select>
                        </div>
                        <button type="submit" class="btn">Save User</button>
                    </form>
                </div>
            </div>
        `;
    },

    setupUserHandlers() {
        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            document.getElementById('userModalTitle').textContent = 'Add User';
            document.getElementById('userForm').reset();
            document.getElementById('userId').value = '';
            document.getElementById('studentLinkGroup').classList.add('hidden');
            document.getElementById('teacherLinkGroup').classList.add('hidden');
            document.getElementById('userModal').classList.add('active');
        });

        document.getElementById('closeUserModal')?.addEventListener('click', () => {
            document.getElementById('userModal').classList.remove('active');
        });

        document.getElementById('userRole')?.addEventListener('change', (e) => {
            const role = e.target.value;
            document.getElementById('studentLinkGroup').classList.add('hidden');
            document.getElementById('teacherLinkGroup').classList.add('hidden');
            
            if (role === 'student') {
                document.getElementById('studentLinkGroup').classList.remove('hidden');
            } else if (role === 'teacher') {
                document.getElementById('teacherLinkGroup').classList.remove('hidden');
            }
        });

        document.getElementById('userForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('userId').value;
            const role = document.getElementById('userRole').value;
            
            const user = {
                username: document.getElementById('userUsername').value,
                password: document.getElementById('userPassword').value,
                name: document.getElementById('userName').value,
                role: role
            };

            if (role === 'student') {
                const studentId = document.getElementById('userStudentId').value;
                if (studentId) user.studentId = parseInt(studentId);
            } else if (role === 'teacher') {
                const teacherId = document.getElementById('userTeacherId').value;
                if (teacherId) user.teacherId = parseInt(teacherId);
            }

            if (id) {
                DataStore.update('users', parseInt(id), user);
            } else {
                user.id = DataStore.getNextId('users');
                DataStore.add('users', user);
            }

            document.getElementById('userModal').classList.remove('active');
            this.loadPage('users');
        });

        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const user = DataStore.get('users').find(u => u.id === id);
                if (user) {
                    document.getElementById('userModalTitle').textContent = 'Edit User';
                    document.getElementById('userId').value = user.id;
                    document.getElementById('userUsername').value = user.username;
                    document.getElementById('userPassword').value = user.password;
                    document.getElementById('userName').value = user.name;
                    document.getElementById('userRole').value = user.role;
                    
                    // Trigger role change to show link groups
                    const event = new Event('change');
                    document.getElementById('userRole').dispatchEvent(event);
                    
                    if (user.studentId) {
                        document.getElementById('userStudentId').value = user.studentId;
                    }
                    if (user.teacherId) {
                        document.getElementById('userTeacherId').value = user.teacherId;
                    }
                    
                    document.getElementById('userModal').classList.add('active');
                }
            });
        });

        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                if (id === 1) {
                    alert('Cannot delete default admin user!');
                    return;
                }
                if (confirm('Are you sure you want to delete this user?')) {
                    DataStore.delete('users', id);
                    this.loadPage('users');
                }
            });
        });
    }
};