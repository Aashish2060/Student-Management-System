// Main Application - Entry Point
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application starting...');
    
    // Initialize DataStore
    DataStore.init();
    
    // Setup login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.getElementById('role').value;

        console.log('Login attempt:', { username, role });

        if (!role) {
            showMessage('loginMessage', 'Please select a role.', 'error');
            return;
        }

        const user = Auth.login(username, password, role);

        if (user) {
            console.log('Login successful, showing dashboard for role:', role);
            showDashboard(role);
        } else {
            showMessage('loginMessage', 'Invalid username, password, or role. Please try again.', 'error');
        }
    });

    // Setup logout buttons
    document.getElementById('adminLogout')?.addEventListener('click', () => Auth.logout());
    document.getElementById('teacherLogout')?.addEventListener('click', () => Auth.logout());
    document.getElementById('studentLogout')?.addEventListener('click', () => Auth.logout());

    // Check if already logged in
    if (Auth.isAuthenticated()) {
        const user = Auth.getCurrentUser();
        console.log('User already logged in:', user);
        showDashboard(user.role);
    } else {
        console.log('No user logged in, showing login page');
    }
});

// Helper function to show messages
function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => el.innerHTML = '', 3000);
}

// Show dashboard based on role
function showDashboard(role) {
    console.log('Showing dashboard for role:', role);
    
    // Hide login page
    document.getElementById('loginPage').style.display = 'none';
    
    // Hide all dashboards
    document.getElementById('adminDashboard').classList.remove('active');
    document.getElementById('teacherDashboard').classList.remove('active');
    document.getElementById('studentDashboard').classList.remove('active');

    // Show appropriate dashboard
    if (role === 'admin') {
        document.getElementById('adminDashboard').classList.add('active');
        Admin.load();
    } else if (role === 'teacher') {
        document.getElementById('teacherDashboard').classList.add('active');
        Teacher.load();
    } else if (role === 'student') {
        document.getElementById('studentDashboard').classList.add('active');
        Student.load();
    }
}