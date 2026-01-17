// Student Module
const Student = {
    currentPage: 'overview',

    load() {
        const user = Auth.getCurrentUser();
        document.getElementById('studentName').textContent = user.name;
        
        const navItems = document.querySelectorAll('#studentNav li');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                Student.loadPage(this.dataset.page);
            });
        });

        this.loadPage('overview');
    },

    loadPage(page) {
        this.currentPage = page;
        const content = document.getElementById('studentContent');
        const user = Auth.getCurrentUser();
        
        switch(page) {
            case 'overview':
                content.innerHTML = this.getOverviewHTML(user);
                break;
            case 'profile':
                content.innerHTML = this.getProfileHTML(user);
                break;
            case 'subjects':
                content.innerHTML = this.getSubjectsHTML(user);
                break;
            case 'attendance':
                content.innerHTML = this.getAttendanceHTML(user);
                break;
            case 'marks':
                content.innerHTML = this.getMarksHTML(user);
                break;
            case 'materials':
                content.innerHTML = this.getMaterialsHTML(user);
                this.setupMaterialsHandlers();
                break;
        }
    },

    getOverviewHTML(user) {
        const students = DataStore.get('students');
        const student = students.find(s => s.id === user.studentId);
        
        if (!student) {
            return '<div class="content-header"><h1>Student Profile Not Found</h1></div>';
        }

        const attendance = DataStore.get('attendance').filter(a => a.studentId === student.id);
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const attendancePercent = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : 0;

        const marks = DataStore.get('marks').filter(m => m.studentId === student.id);
        const avgMarks = marks.length > 0 ? (marks.reduce((sum, m) => sum + m.marks, 0) / marks.length).toFixed(1) : 0;

        return `
            <div class="content-header">
                <div>
                    <h1>Student Dashboard</h1>
                    <p>Welcome back, ${user.name}</p>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Attendance</h3>
                    <div class="number">${attendancePercent}%</div>
                </div>
                <div class="stat-card">
                    <h3>Average Marks</h3>
                    <div class="number">${avgMarks}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Classes</h3>
                    <div class="number">${attendance.length}</div>
                </div>
            </div>
        `;
    },

    getProfileHTML(user) {
        const students = DataStore.get('students');
        const student = students.find(s => s.id === user.studentId);
        
        if (!student) {
            return '<div class="content-header"><h1>Student Profile Not Found</h1></div>';
        }

        const classes = DataStore.get('classes');
        const className = classes.find(c => c.id === student.class)?.name || 'N/A';

        return `
            <div class="content-header">
                <div>
                    <h1>My Profile</h1>
                </div>
            </div>
            <div class="card">
                <h2>Personal Information</h2>
                <table>
                    <tr>
                        <th>Name</th>
                        <td>${student.name}</td>
                    </tr>
                    <tr>
                        <th>Roll Number</th>
                        <td>${student.rollNo}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>${student.email}</td>
                    </tr>
                    <tr>
                        <th>Phone</th>
                        <td>${student.phone}</td>
                    </tr>
                    <tr>
                        <th>Date of Birth</th>
                        <td>${student.dob}</td>
                    </tr>
                    <tr>
                        <th>Class</th>
                        <td>${className}</td>
                    </tr>
                </table>
            </div>
        `;
    },

    getSubjectsHTML(user) {
        const students = DataStore.get('students');
        const student = students.find(s => s.id === user.studentId);
        
        if (!student) {
            return '<div class="content-header"><h1>Student Profile Not Found</h1></div>';
        }

        const assignments = DataStore.get('assignments').filter(a => a.classId === student.class);
        const subjects = DataStore.get('subjects');
        const teachers = DataStore.get('teachers');

        let rows = assignments.map(assign => {
            const subject = subjects.find(s => s.id === assign.subjectId);
            const teacher = teachers.find(t => t.id === assign.teacherId);
            
            if (subject && teacher) {
                return `
                    <tr>
                        <td>${subject.code}</td>
                        <td>${subject.name}</td>
                        <td>${teacher.name}</td>
                        <td>${subject.description}</td>
                    </tr>
                `;
            }
            return '';
        }).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>My Subjects</h1>
                </div>
            </div>
            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Teacher</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="4">No subjects assigned</td></tr>'}</tbody>
                </table>
            </div>
        `;
    },

    getAttendanceHTML(user) {
        const students = DataStore.get('students');
        const student = students.find(s => s.id === user.studentId);
        
        if (!student) {
            return '<div class="content-header"><h1>Student Profile Not Found</h1></div>';
        }

        const attendance = DataStore.get('attendance').filter(a => a.studentId === student.id);
        
        let rows = attendance.sort((a, b) => new Date(b.date) - new Date(a.date)).map(record => {
            const bgColor = record.status === 'present' ? '#d4edda' : 
                           record.status === 'absent' ? '#f8d7da' : '#fff3cd';
            const textColor = record.status === 'present' ? '#155724' : 
                             record.status === 'absent' ? '#721c24' : '#856404';
            
            return `
                <tr>
                    <td>${record.date}</td>
                    <td>
                        <span style="padding: 5px 10px; border-radius: 3px; background: ${bgColor}; color: ${textColor};">
                            ${record.status.toUpperCase()}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        const presentCount = attendance.filter(a => a.status === 'present').length;
        const absentCount = attendance.filter(a => a.status === 'absent').length;
        const lateCount = attendance.filter(a => a.status === 'late').length;
        const attendancePercent = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : 0;

        return `
            <div class="content-header">
                <div>
                    <h1>My Attendance</h1>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Attendance %</h3>
                    <div class="number">${attendancePercent}%</div>
                </div>
                <div class="stat-card">
                    <h3>Present</h3>
                    <div class="number" style="color: #28a745;">${presentCount}</div>
                </div>
                <div class="stat-card">
                    <h3>Absent</h3>
                    <div class="number" style="color: #dc3545;">${absentCount}</div>
                </div>
                <div class="stat-card">
                    <h3>Late</h3>
                    <div class="number" style="color: #ffc107;">${lateCount}</div>
                </div>
            </div>
            <div class="card">
                <h2>Attendance Records</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="2">No attendance records</td></tr>'}</tbody>
                </table>
            </div>
        `;
    },

    getMarksHTML(user) {
        const students = DataStore.get('students');
        const student = students.find(s => s.id === user.studentId);
        
        if (!student) {
            return '<div class="content-header"><h1>Student Profile Not Found</h1></div>';
        }

        const marks = DataStore.get('marks').filter(m => m.studentId === student.id);
        const subjects = DataStore.get('subjects');

        let rows = marks.map(record => {
            const subject = subjects.find(s => s.id === record.subjectId);
            const bgColor = record.marks >= 90 ? '#d4edda' : 
                           record.marks >= 75 ? '#d1ecf1' : 
                           record.marks >= 60 ? '#fff3cd' : '#f8d7da';
            const textColor = record.marks >= 90 ? '#155724' : 
                             record.marks >= 75 ? '#0c5460' : 
                             record.marks >= 60 ? '#856404' : '#721c24';
            const grade = record.marks >= 90 ? 'A+' : 
                         record.marks >= 75 ? 'A' : 
                         record.marks >= 60 ? 'B' : 
                         record.marks >= 50 ? 'C' : 'F';
            
            return `
                <tr>
                    <td>${subject?.name || 'N/A'}</td>
                    <td>${record.examType}</td>
                    <td>${record.marks}</td>
                    <td>${record.date}</td>
                    <td>
                        <span style="padding: 5px 10px; border-radius: 3px; background: ${bgColor}; color: ${textColor};">
                            ${grade}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        const avgMarks = marks.length > 0 ? (marks.reduce((sum, m) => sum + m.marks, 0) / marks.length).toFixed(1) : 0;

        return `
            <div class="content-header">
                <div>
                    <h1>My Marks</h1>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Average Marks</h3>
                    <div class="number">${avgMarks}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Exams</h3>
                    <div class="number">${marks.length}</div>
                </div>
            </div>
            <div class="card">
                <h2>Mark Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Exam Type</th>
                            <th>Marks</th>
                            <th>Date</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="5">No marks recorded</td></tr>'}</tbody>
                </table>
            </div>
        `;
    },

    getMaterialsHTML(user) {
        const students = DataStore.get('students');
        const student = students.find(s => s.id === user.studentId);
        
        if (!student) {
            return '<div class="content-header"><h1>Student Profile Not Found</h1></div>';
        }

        const materials = DataStore.get('materials').filter(m => m.classId === student.class);
        const subjects = DataStore.get('subjects');
        const teachers = DataStore.get('teachers');

        let rows = materials.map(material => {
            const subject = subjects.find(s => s.id === material.subjectId);
            const teacher = teachers.find(t => t.id === material.teacherId);
            return `
                <tr>
                    <td>${material.title}</td>
                    <td>${subject?.name || 'N/A'}</td>
                    <td>${teacher?.name || 'N/A'}</td>
                    <td>${material.type}</td>
                    <td>${material.date}</td>
                    <td>
                        <button class="btn btn-small btn-secondary view-material" data-desc="${material.description}">View</button>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>Study Materials</h1>
                </div>
            </div>
            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Subject</th>
                            <th>Teacher</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="6">No materials available</td></tr>'}</tbody>
                </table>
            </div>
        `;
    },

    setupMaterialsHandlers() {
        document.querySelectorAll('.view-material').forEach(btn => {
            btn.addEventListener('click', () => {
                alert('Material Description/Link:\n\n' + btn.dataset.desc);
            });
        });
    }
};