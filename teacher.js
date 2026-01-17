// Teacher Module
const Teacher = {
    currentPage: 'overview',

    load() {
        const user = Auth.getCurrentUser();
        document.getElementById('teacherName').textContent = user.name;
        
        const navItems = document.querySelectorAll('#teacherNav li');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                Teacher.loadPage(this.dataset.page);
            });
        });

        this.loadPage('overview');
    },

    loadPage(page) {
        this.currentPage = page;
        const content = document.getElementById('teacherContent');
        const user = Auth.getCurrentUser();
        
        switch(page) {
            case 'overview':
                content.innerHTML = this.getOverviewHTML(user);
                break;
            case 'my-classes':
                content.innerHTML = this.getMyClassesHTML(user);
                this.setupMyClassesHandlers();
                break;
            case 'attendance':
                content.innerHTML = this.getAttendanceHTML(user);
                this.setupAttendanceHandlers();
                break;
            case 'marks':
                content.innerHTML = this.getMarksHTML(user);
                this.setupMarksHandlers();
                break;
            case 'materials':
                content.innerHTML = this.getMaterialsHTML(user);
                this.setupMaterialsHandlers();
                break;
        }
    },

    getOverviewHTML(user) {
        const assignments = DataStore.get('assignments').filter(a => a.teacherId === user.teacherId);
        const students = DataStore.get('students');
        
        return `
            <div class="content-header">
                <div>
                    <h1>Teacher Dashboard</h1>
                    <p>Welcome back, ${user.name}</p>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Assigned Classes</h3>
                    <div class="number">${assignments.length}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Students</h3>
                    <div class="number">${students.length}</div>
                </div>
            </div>
        `;
    },

    getMyClassesHTML(user) {
        const assignments = DataStore.get('assignments').filter(a => a.teacherId === user.teacherId);
        const classes = DataStore.get('classes');
        const subjects = DataStore.get('subjects');

        let rows = assignments.map(assign => {
            const className = classes.find(c => c.id === assign.classId)?.name || 'N/A';
            const subjectName = subjects.find(s => s.id === assign.subjectId)?.name || 'N/A';
            return `
                <tr>
                    <td>${className}</td>
                    <td>${subjectName}</td>
                    <td>
                        <button class="btn btn-small btn-secondary view-students" data-class-id="${assign.classId}">View Students</button>
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>My Classes</h1>
                </div>
            </div>
            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Class</th>
                            <th>Subject</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="3">No classes assigned</td></tr>'}</tbody>
                </table>
            </div>
        `;
    },

    setupMyClassesHandlers() {
        document.querySelectorAll('.view-students').forEach(btn => {
            btn.addEventListener('click', () => {
                const classId = parseInt(btn.dataset.classId);
                this.showClassStudents(classId);
            });
        });
    },

    showClassStudents(classId) {
        const students = DataStore.get('students').filter(s => s.class === classId);
        const className = DataStore.get('classes').find(c => c.id === classId)?.name;
        
        let rows = students.map(student => `
            <tr>
                <td>${student.rollNo}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
            </tr>
        `).join('');

        const html = `
            <div class="content-header">
                <div>
                    <h1>Students in ${className}</h1>
                </div>
                <button class="btn" id="backToClasses">Back to My Classes</button>
            </div>
            <div class="card">
                <table>
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
        
        document.getElementById('teacherContent').innerHTML = html;
        
        document.getElementById('backToClasses')?.addEventListener('click', () => {
            this.loadPage('my-classes');
        });
    },

    getAttendanceHTML(user) {
        const assignments = DataStore.get('assignments').filter(a => a.teacherId === user.teacherId);
        const classes = DataStore.get('classes');
        
        let classOptions = assignments.map(assign => {
            const className = classes.find(c => c.id === assign.classId)?.name;
            return className ? `<option value="${assign.classId}">${className}</option>` : '';
        }).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>Mark Attendance</h1>
                </div>
            </div>
            <div class="card">
                <div class="form-row">
                    <div class="form-group">
                        <label>Select Class</label>
                        <select id="attendanceClass">
                            <option value="">Select Class</option>
                            ${classOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="attendanceDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div id="attendanceStudentList"></div>
            </div>
        `;
    },

    setupAttendanceHandlers() {
        document.getElementById('attendanceClass')?.addEventListener('change', () => this.loadAttendanceStudents());
        document.getElementById('attendanceDate')?.addEventListener('change', () => this.loadAttendanceStudents());
    },

    loadAttendanceStudents() {
        const classId = parseInt(document.getElementById('attendanceClass').value);
        const date = document.getElementById('attendanceDate').value;
        
        if (!classId || !date) return;

        const students = DataStore.get('students').filter(s => s.class === classId);
        const attendance = DataStore.get('attendance');
        
        let html = '<table><thead><tr><th>Roll No</th><th>Name</th><th>Status</th></tr></thead><tbody>';
        
        students.forEach(student => {
            const record = attendance.find(a => 
                a.studentId === student.id && 
                a.date === date
            );
            const status = record ? record.status : 'present';
            
            html += `
                <tr>
                    <td>${student.rollNo}</td>
                    <td>${student.name}</td>
                    <td>
                        <select class="attendance-status" data-student-id="${student.id}">
                            <option value="present" ${status === 'present' ? 'selected' : ''}>Present</option>
                            <option value="absent" ${status === 'absent' ? 'selected' : ''}>Absent</option>
                            <option value="late" ${status === 'late' ? 'selected' : ''}>Late</option>
                        </select>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        html += '<button class="btn" style="margin-top: 20px;" id="saveAttendanceBtn">Save Attendance</button>';
        
        document.getElementById('attendanceStudentList').innerHTML = html;
        
        document.getElementById('saveAttendanceBtn')?.addEventListener('click', () => this.saveAttendance());
    },

    saveAttendance() {
        const classId = parseInt(document.getElementById('attendanceClass').value);
        const date = document.getElementById('attendanceDate').value;
        const statuses = document.querySelectorAll('.attendance-status');
        
        const attendance = DataStore.get('attendance');
        
        statuses.forEach(select => {
            const studentId = parseInt(select.dataset.studentId);
            const status = select.value;
            
            const existingIndex = attendance.findIndex(a => 
                a.studentId === studentId && a.date === date
            );
            
            const record = {
                id: existingIndex >= 0 ? attendance[existingIndex].id : DataStore.getNextId('attendance'),
                studentId: studentId,
                date: date,
                status: status,
                classId: classId
            };
            
            if (existingIndex >= 0) {
                attendance[existingIndex] = record;
            } else {
                attendance.push(record);
            }
        });
        
        DataStore.set('attendance', attendance);
        alert('Attendance saved successfully!');
    },

    getMarksHTML(user) {
        const assignments = DataStore.get('assignments').filter(a => a.teacherId === user.teacherId);
        const classes = DataStore.get('classes');
        const subjects = DataStore.get('subjects');
        
        let classOptions = assignments.map(assign => {
            const className = classes.find(c => c.id === assign.classId)?.name;
            const subjectName = subjects.find(s => s.id === assign.subjectId)?.name;
            return (className && subjectName) ? `<option value="${assign.classId}-${assign.subjectId}">${className} - ${subjectName}</option>` : '';
        }).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>Marks Entry</h1>
                </div>
            </div>
            <div class="card">
                <div class="form-row">
                    <div class="form-group">
                        <label>Select Class & Subject</label>
                        <select id="marksClass">
                            <option value="">Select Class & Subject</option>
                            ${classOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Exam Type</label>
                        <select id="examType">
                            <option value="midterm">Midterm</option>
                            <option value="final">Final</option>
                            <option value="quiz">Quiz</option>
                            <option value="assignment">Assignment</option>
                        </select>
                    </div>
                </div>
                <div id="marksStudentList"></div>
            </div>
        `;
    },

    setupMarksHandlers() {
        document.getElementById('marksClass')?.addEventListener('change', () => this.loadMarksStudents());
        document.getElementById('examType')?.addEventListener('change', () => this.loadMarksStudents());
    },

    loadMarksStudents() {
        const selection = document.getElementById('marksClass').value;
        const examType = document.getElementById('examType').value;
        
        if (!selection) return;

        const [classId, subjectId] = selection.split('-').map(Number);
        const students = DataStore.get('students').filter(s => s.class === classId);
        const marks = DataStore.get('marks');
        
        let html = '<table><thead><tr><th>Roll No</th><th>Name</th><th>Marks (out of 100)</th></tr></thead><tbody>';
        
        students.forEach(student => {
            const record = marks.find(m => 
                m.studentId === student.id && 
                m.subjectId === subjectId &&
                m.examType === examType
            );
            const mark = record ? record.marks : '';
            
            html += `
                <tr>
                    <td>${student.rollNo}</td>
                    <td>${student.name}</td>
                    <td>
                        <input type="number" class="marks-input" data-student-id="${student.id}" 
                               value="${mark}" min="0" max="100" style="width: 100px; padding: 8px;">
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        html += '<button class="btn" style="margin-top: 20px;" id="saveMarksBtn">Save Marks</button>';
        
        document.getElementById('marksStudentList').innerHTML = html;
        
        document.getElementById('saveMarksBtn')?.addEventListener('click', () => this.saveMarks());
    },

    saveMarks() {
        const selection = document.getElementById('marksClass').value;
        const examType = document.getElementById('examType').value;
        const [classId, subjectId] = selection.split('-').map(Number);
        const inputs = document.querySelectorAll('.marks-input');
        
        const marks = DataStore.get('marks');
        
        inputs.forEach(input => {
            const studentId = parseInt(input.dataset.studentId);
            const marksValue = parseFloat(input.value);
            
            if (!isNaN(marksValue) && marksValue >= 0) {
                const existingIndex = marks.findIndex(m => 
                    m.studentId === studentId && 
                    m.subjectId === subjectId &&
                    m.examType === examType
                );
                
                const record = {
                    id: existingIndex >= 0 ? marks[existingIndex].id : DataStore.getNextId('marks'),
                    studentId: studentId,
                    subjectId: subjectId,
                    examType: examType,
                    marks: marksValue,
                    classId: classId,
                    date: new Date().toISOString().split('T')[0]
                };
                
                if (existingIndex >= 0) {
                    marks[existingIndex] = record;
                } else {
                    marks.push(record);
                }
            }
        });
        
        DataStore.set('marks', marks);
        alert('Marks saved successfully!');
    },

    getMaterialsHTML(user) {
        const materials = DataStore.get('materials').filter(m => m.teacherId === user.teacherId);
        const subjects = DataStore.get('subjects');
        const classes = DataStore.get('classes');

        let rows = materials.map(material => {
            const subjectName = subjects.find(s => s.id === material.subjectId)?.name || 'N/A';
            const className = classes.find(c => c.id === material.classId)?.name || 'N/A';
            return `
                <tr>
                    <td>${material.title}</td>
                    <td>${className}</td>
                    <td>${subjectName}</td>
                    <td>${material.type}</td>
                    <td>${material.date}</td>
                    <td>
                        <button class="btn btn-small btn-danger delete-material" data-id="${material.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        const assignments = DataStore.get('assignments').filter(a => a.teacherId === user.teacherId);
        let classOptions = assignments.map(assign => {
            const className = classes.find(c => c.id === assign.classId)?.name;
            return className ? `<option value="${assign.classId}-${assign.subjectId}">${className}</option>` : '';
        }).join('');

        return `
            <div class="content-header">
                <div>
                    <h1>Study Materials</h1>
                </div>
            </div>
            <div class="card">
                <h2>Upload New Material</h2>
                <form id="materialForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="materialTitle" required>
                        </div>
                        <div class="form-group">
                            <label>Class</label>
                            <select id="materialClass" required>
                                <option value="">Select Class</option>
                                ${classOptions}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Type</label>
                            <select id="materialType" required>
                                <option value="notes">Notes</option>
                                <option value="assignment">Assignment</option>
                                <option value="reference">Reference</option>
                                <option value="video">Video Link</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Description/Link</label>
                            <input type="text" id="materialDescription" required>
                        </div>
                    </div>
                    <button type="submit" class="btn">Upload Material</button>
                </form>
            </div>
            <div class="card">
                <h2>Uploaded Materials</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Class</th>
                            <th>Subject</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="6">No materials uploaded</td></tr>'}</tbody>
                </table>
            </div>
        `;
    },

    setupMaterialsHandlers() {
        document.getElementById('materialForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMaterial();
        });

        document.querySelectorAll('.delete-material').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this material?')) {
                    DataStore.delete('materials', parseInt(btn.dataset.id));
                    this.loadPage('materials');
                }
            });
        });
    },

    saveMaterial() {
        const user = Auth.getCurrentUser();
        const selection = document.getElementById('materialClass').value;
        const [classId, subjectId] = selection.split('-').map(Number);
        
        const material = {
            id: DataStore.getNextId('materials'),
            title: document.getElementById('materialTitle').value,
            classId: classId,
            subjectId: subjectId,
            type: document.getElementById('materialType').value,
            description: document.getElementById('materialDescription').value,
            teacherId: user.teacherId,
            date: new Date().toISOString().split('T')[0]
        };

        DataStore.add('materials', material);
        this.loadPage('materials');
    }
};