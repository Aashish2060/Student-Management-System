// Data Store Manager - Handles all LocalStorage operations
const DataStore = {
    // Initialize default data if not exists
    init() {
        console.log('Initializing DataStore...');
        
        // Initialize Users
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
                { id: 2, username: 'teacher1', password: 'teacher123', role: 'teacher', name: 'John Smith', teacherId: 1 },
                { id: 3, username: 'student1', password: 'student123', role: 'student', name: 'Alice Johnson', studentId: 1 }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
            console.log('Default users created');
        }

        // Initialize Students
        if (!localStorage.getItem('students')) {
            const defaultStudents = [
                { id: 1, name: 'Alice Johnson', email: 'alice@school.com', phone: '1234567890', class: 1, rollNo: '001', dob: '2005-05-15' },
                { id: 2, name: 'Bob Williams', email: 'bob@school.com', phone: '1234567891', class: 1, rollNo: '002', dob: '2005-06-20' }
            ];
            localStorage.setItem('students', JSON.stringify(defaultStudents));
        }

        // Initialize Teachers
        if (!localStorage.getItem('teachers')) {
            const defaultTeachers = [
                { id: 1, name: 'John Smith', email: 'john@school.com', phone: '9876543210', subject: 1, qualification: 'M.Sc.' },
                { id: 2, name: 'Mary Davis', email: 'mary@school.com', phone: '9876543211', subject: 2, qualification: 'M.A.' }
            ];
            localStorage.setItem('teachers', JSON.stringify(defaultTeachers));
        }

        // Initialize Classes
        if (!localStorage.getItem('classes')) {
            const defaultClasses = [
                { id: 1, name: 'Class 10-A', grade: '10', section: 'A' },
                { id: 2, name: 'Class 10-B', grade: '10', section: 'B' }
            ];
            localStorage.setItem('classes', JSON.stringify(defaultClasses));
        }

        // Initialize Subjects
        if (!localStorage.getItem('subjects')) {
            const defaultSubjects = [
                { id: 1, name: 'Mathematics', code: 'MATH101', description: 'Advanced Mathematics' },
                { id: 2, name: 'English', code: 'ENG101', description: 'English Literature' },
                { id: 3, name: 'Science', code: 'SCI101', description: 'General Science' }
            ];
            localStorage.setItem('subjects', JSON.stringify(defaultSubjects));
        }

        // Initialize empty arrays for other data
        if (!localStorage.getItem('attendance')) {
            localStorage.setItem('attendance', JSON.stringify([]));
        }
        if (!localStorage.getItem('marks')) {
            localStorage.setItem('marks', JSON.stringify([]));
        }
        if (!localStorage.getItem('materials')) {
            localStorage.setItem('materials', JSON.stringify([]));
        }
        if (!localStorage.getItem('assignments')) {
            const defaultAssignments = [
                { id: 1, classId: 1, subjectId: 1, teacherId: 1 },
                { id: 2, classId: 1, subjectId: 2, teacherId: 2 }
            ];
            localStorage.setItem('assignments', JSON.stringify(defaultAssignments));
        }

        console.log('DataStore initialization complete');
    },

    // Get data from localStorage
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return [];
        }
    },

    // Set data to localStorage
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },

    // Add new item
    add(key, item) {
        const data = this.get(key);
        data.push(item);
        return this.set(key, data);
    },

    // Update existing item
    update(key, id, updates) {
        const data = this.get(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            return this.set(key, data);
        }
        return false;
    },

    // Delete item
    delete(key, id) {
        const data = this.get(key);
        const filtered = data.filter(item => item.id !== id);
        return this.set(key, filtered);
    },

    // Get next available ID
    getNextId(key) {
        const data = this.get(key);
        if (data.length === 0) return 1;
        return Math.max(...data.map(item => item.id)) + 1;
    },

    // Clear all data (for testing/reset)
    clearAll() {
        localStorage.clear();
        this.init();
    }
};