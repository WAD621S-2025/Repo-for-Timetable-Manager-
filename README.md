 University Timetable Manager

This is a clean and modern web app that helps students and admins manage class timetables.  
Built using **HTML, CSS, and JavaScript**, it features a dark mode with a morden style theme and data saving in your browser.

 Features

Login System 
- Students can log in to view, add, and delete their own classes.  
- Admins can log in to view all student timetables.

Add and Remove Classes  
- Add subjects with day, time, and location.  
- Delete any class you no longer need.

Personalized View
- Students only see their own timetable.  
- Admins can see everyone’s.

Dark Mode 
- Easily switch between light and dark themes for comfort.

Data Saved in Browser 
- Your timetable is stored locally (using LocalStorage).  
- No internet connection required after setup.

 How to Use

1. Open the Project
   - Download or clone the project folder.  
   - Open login.html in your browser.

2. Login
   - Student Enters any username (it will create or load your timetable).  
   - Admin: Use  
     - Username: admin  
     - Password: admin123

3. Add a Class
   - Go to the “Add Class” section.  
   - Fill in:
     - Subject/Title  
     - Day  
     - Start & End Time  
     - Location  
   - Click Add and  your class will appear in the timetable below.

4. Delete a Class
   - Click the Delete button next to any class.

6. Logout
   - Click the **Logout** button in the header to return to the login page.

---

Project Files

 File Description 
 login.html Login page for students and admin 
 dashboard.html Main timetable manager page 
 style.css Styling for all pages (light/dark themes) 
 script.js Main logic for timetable functions 
README.md This file 



 Notes

- Timetables are stored per user in the browser.  
- Clearing your browser storage will delete saved data.  
- You can change the admin password using localStorage (in DevTools console):
  js
  localStorage.setItem('utm_admin_pwd', 'yourNewPassword');
  

