// Authentication Manager
const Auth = {
    // Login function
    login(username, password, role) {
        console.log('Attempting login:', { username, role });
        
        const users = DataStore.get('users');
        console.log('Available users:', users);
        
        const user = users.find(u => 
            u.username === username && 
            u.password === password && 
            u.role === role
        );

        if (user) {
            console.log('Login successful:', user);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        }
        
        console.log('Login failed: Invalid credentials');
        return null;
    },

    // Logout function
    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.reload();
    },

    // Get current logged in user
    getCurrentUser() {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }
};