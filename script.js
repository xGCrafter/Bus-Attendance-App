const translations = {
    en: {
        busId: "Bus ID",
        password: "Password",
        login: "Login",
        language: "Language",
        fillAttendance: "Fill Attendance",
        contactParents: "Contact Parents",
        schoolWebsite: "School Website",
        callSchool: "Call School",
        name: "Name",
        present: "Present",
        phone: "Phone No.",
        submitAttendance: "Submit Attendance",
        noStudents: "No students found for this bus.",
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    hi: {
        busId: "बस आईडी",
        password: "पासवर्ड",
        login: "लॉगिन",
        language: "भाषा",
        fillAttendance: "उपस्थिति भरें",
        contactParents: "माता-पिता से संपर्क करें",
        schoolWebsite: "स्कूल वेबसाइट",
        callSchool: "स्कूल को कॉल करें",
        name: "नाम",
        present: "उपस्थित",
        phone: "फोन नंबर",
        submitAttendance: "उपस्थिति जमा करें",
        noStudents: "इस बस के लिए कोई छात्र नहीं मिला।",
        months: ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"]
    },
    kn: {
        busId: "ಬಸ್ ಐಡಿ",
        password: "ಪಾಸ್‌ವರ್ಡ್",
        login: "ಲಾಗಿನ್",
        language: "ಭಾಷೆ",
        fillAttendance: "ಹಾಜರಾತಿ ತುಂಬಿರಿ",
        contactParents: "ಪೋಷಕರನ್ನು ಸಂಪರ್ಕಿಸಿ",
        schoolWebsite: "ಶಾಲೆಯ ವೆಬ್‌ಸೈಟ್",
        callSchool: "ಶಾಲೆಗೆ ಕರೆ ಮಾಡಿ",
        name: "ಹೆಸರು",
        present: "ಹಾಜರು",
        phone: "ಫೋನ್ ಸಂಖ್ಯೆ",
        submitAttendance: "ಹಾಜರಾತಿ ಸಲ್ಲಿಸಿ",
        noStudents: "ಈ ಬಸ್‌ಗೆ ಯಾವುದೇ ವಿದ್ಯಾರ್ಥಿಗಳು ಸಿಗಲಿಲ್ಲ。",
        months: ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"]
    }
};

let currentLanguage = localStorage.getItem('language') || 'en';
const backendUrl = 'http://localhost:3000';

const checkAuth = async () => {
    const busId = localStorage.getItem('loggedInBusId');
    const authToken = localStorage.getItem('authToken');
    const currentPath = window.location.pathname;

    if (currentPath === '/index.html' || currentPath === '/') {
        return true;
    }

    if (!busId || !authToken) {
        window.location.href = 'index.html';
        return false;
    }

    try {
        const response = await fetch(`${backendUrl}/api/verify-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ busId, authToken })
        });
        const data = await response.json();
        if (!response.ok || !data.isAuthenticated) {
            localStorage.removeItem('loggedInBusId');
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    } catch (err) {
        localStorage.removeItem('loggedInBusId');
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
        return false;
    }
};

// Define shared variables and functions for attendance section at a higher scope
let currentDate = new Date(2025, 4, 1); // May 2025
let studentsData = [];
let attendanceDataByDate = {};

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const formatDate = (year, month, day) => `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

const updateMonthDisplay = () => {
    if (!document.getElementById('month-year-header') || !document.getElementById('month-year-title')) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = translations[currentLanguage].months[month];
    const displayText = `${translations[currentLanguage].fillAttendance} - ${monthName} ${year}`;
    document.getElementById('month-year-header').textContent = displayText;
    document.getElementById('month-year-title').textContent = `${monthName} ${year}`;
};

const applySettingsFunctionality = () => {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const languageSelect = document.getElementById('language');

    const applyLanguage = () => {
        document.querySelector('#settings-menu .text-gray-700').textContent = translations[currentLanguage].language;
        if (document.getElementById('dashboard-container')) {
            document.querySelector('a[href="attendance.html"]').textContent = translations[currentLanguage].fillAttendance;
            document.querySelector('a[href="contact.html"]').textContent = translations[currentLanguage].contactParents;
            document.querySelector('a[href="https://www.deensacademy.com/"]').textContent = translations[currentLanguage].schoolWebsite;
            document.querySelector('a[href="tel:"]').textContent = translations[currentLanguage].callSchool;
        }
        if (document.getElementById('monthly-attendance-section')) {
            updateMonthDisplay();
            document.querySelector('#calendar-header th').textContent = translations[currentLanguage].name;
        }
        if (document.getElementById('contact-section')) {
            document.querySelector('#contact-section h2').textContent = translations[currentLanguage].contactParents;
            document.querySelector('#contact-table th:nth-child(1)').textContent = translations[currentLanguage].name;
            document.querySelector('#contact-table th:nth-child(2)').textContent = translations[currentLanguage].phone;
        }
    };

    settingsBtn.addEventListener('click', () => {
        settingsMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            settingsMenu.classList.add('hidden');
        }
    });

    languageSelect.value = currentLanguage;
    languageSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        localStorage.setItem('language', currentLanguage);
        applyLanguage();
    });

    applyLanguage();
};

if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const busId = document.getElementById('bus-id').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        try {
            const response = await fetch(`${backendUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ busId, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            if (data.success) {
                localStorage.setItem('loggedInBusId', busId);
                localStorage.setItem('authToken', data.authToken || 'authenticated');
                window.location.replace('dashboard.html');
            } else {
                throw new Error(data.message || 'Invalid Bus ID or Password');
            }
        } catch (err) {
            alert(`Login failed: ${err.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = translations[currentLanguage].login;
        }
    });
    document.querySelector('label[for="bus-id"]').textContent = translations[currentLanguage].busId;
    document.querySelector('label[for="password"]').textContent = translations[currentLanguage].password;
    document.querySelector('#login-form button').textContent = translations[currentLanguage].login;
}

if (document.getElementById('dashboard-container')) {
    (async () => {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
            applySettingsFunctionality();
        }
    })();
}

if (document.getElementById('monthly-attendance-section')) {
    (async () => {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
            applySettingsFunctionality();

            const calendarHeader = document.getElementById('calendar-header');
            const attendanceTableBody = document.getElementById('attendance-table-body');
            const prevMonthBtn = document.getElementById('prev-month-btn');
            const nextMonthBtn = document.getElementById('next-month-btn');

            const fetchAttendanceForMonth = async () => {
                const busId = localStorage.getItem('loggedInBusId');
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const daysInMonth = getDaysInMonth(year, month);
                attendanceDataByDate = {};
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = formatDate(year, month, day);
                    const attendanceResponse = await fetch(`${backendUrl}/api/attendance/${busId}/${date}`);
                    const attendanceResult = await attendanceResponse.json();
                    if (attendanceResponse.ok) {
                        attendanceDataByDate[date] = attendanceResult.attendance || [];
                    }
                }
            };

            const populateCalendarHeader = () => {
                calendarHeader.innerHTML = '<th class="p-3 text-left sticky sticky-top text-lg">Students List</th>';
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const daysInMonth = getDaysInMonth(year, month);
                for (let day = 1; day <= daysInMonth; day++) {
                    const th = document.createElement('th');
                    th.className = 'p-3 text-left text-lg';
                    th.textContent = `${translations[currentLanguage].months[month]} ${day}`;
                    calendarHeader.appendChild(th);
                }
            };

            const populateAttendanceTable = () => {
            attendanceTableBody.innerHTML = '';
            if (!studentsData || studentsData.length === 0) {
                const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="${daysInMonth + 1}" class="text-center p-3 text-lg">${translations[currentLanguage].noStudents}</td>`;
                attendanceTableBody.appendChild(row);
                return;
            }
              studentsData.sort((a, b) => a.name.localeCompare(b.name));

            studentsData.forEach(student => {
                const row = document.createElement('tr');
                const cells = [];
                cells.push(`<td class="p-3 sticky bg-white text-lg">${student.name}</td>`);
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const daysInMonth = getDaysInMonth(year, month);
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = formatDate(year, month, day);
                    const dayAttendance = attendanceDataByDate[date] || [];
                    const attendance = dayAttendance.find(a => a.studentId === student.id);
                    const isPresent = attendance ? attendance.present === 1 : null;
                    const tickDisabled = isPresent === true;
                    const crossDisabled = isPresent === false;
                    cells.push(`
                        <td class="p-3">
                            <div class="flex justify-center space-x-2">
                                <button class="tick-btn bg-green-500 text-white px-3 py-1 rounded btn ${tickDisabled ? 'opacity-50 cursor-not-allowed' : ''}" data-student-id="${student.id}" data-date="${date}" ${tickDisabled ? 'disabled' : ''}>✔</button>
                                <button class="cross-btn bg-red-500 text-white px-3 py-1 rounded btn ${crossDisabled ? 'opacity-50 cursor-not-allowed' : ''}" data-student-id="${student.id}" data-date="${date}" ${crossDisabled ? 'disabled' : ''}>✘</button>
                            </div>
                        </td>
                    `);
                }
                row.innerHTML = cells.join('');
                attendanceTableBody.appendChild(row);
            });

                document.querySelectorAll('.tick-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (btn.disabled) return;
                        btn.disabled = true;
                        const studentId = btn.getAttribute('data-student-id');
                        const date = btn.getAttribute('data-date');
                        await submitAttendance(studentId, date, true);
                        btn.classList.add('opacity-50', 'cursor-not-allowed');
                        btn.parentElement.querySelector('.cross-btn').disabled = false;
                        btn.parentElement.querySelector('.cross-btn').classList.remove('opacity-50', 'cursor-not-allowed');
                    });
                });
                document.querySelectorAll('.cross-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        if (btn.disabled) return;
                        btn.disabled = true;
                        const studentId = btn.getAttribute('data-student-id');
                        const date = btn.getAttribute('data-date');
                        await submitAttendance(studentId, date, false);
                        btn.classList.add('opacity-50', 'cursor-not-allowed');
                        btn.parentElement.querySelector('.tick-btn').disabled = false;
                        btn.parentElement.querySelector('.tick-btn').classList.remove('opacity-50', 'cursor-not-allowed');
                    });
                });
            };

            const submitAttendance = async (studentId, date, present) => {
                const busId = localStorage.getItem('loggedInBusId');
                try {
                    const response = await fetch(`${backendUrl}/api/attendance`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ busId, date, attendance: [{ studentId: parseInt(studentId), present }] })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || 'Failed to submit attendance');
                    if (!data.success) throw new Error(data.message || 'Submission failed');
                    let dayAttendance = attendanceDataByDate[date] || [];
                    const existing = dayAttendance.find(a => a.studentId === parseInt(studentId));
                    if (existing) {
                        existing.present = present ? 1 : 0;
                    } else {
                        dayAttendance.push({ studentId: parseInt(studentId), present: present ? 1 : 0 });
                    }
                    attendanceDataByDate[date] = dayAttendance;
                } catch (err) {
                    alert(`Failed to submit attendance: ${err.message}`);
                }
            };

            const loadData = async () => {
                const busId = localStorage.getItem('loggedInBusId');
                if (!busId) {
                    window.location.href = 'index.html';
                    return;
                }
                try {
                    const studentsResponse = await fetch(`${backendUrl}/api/students/${busId}`);
                    const studentsResult = await studentsResponse.json();
                    console.log('Fetched students:', studentsResult); // Debug log
                    if (!studentsResponse.ok) throw new Error(studentsResult.message || 'Failed to fetch students');
                    studentsData = studentsResult.students || [];
                    console.log('Students data assigned:', studentsData); // Debug log
                    await new Promise(resolve => setTimeout(resolve, 500)); // Ensure DOM readiness
                    await fetchAttendanceForMonth();
                    updateMonthDisplay();
                    populateCalendarHeader();
                    populateAttendanceTable();
                } catch (err) {
                    alert(`Error loading data: ${err.message}`);
                }
            };

            prevMonthBtn.addEventListener('click', async () => {
                prevMonthBtn.disabled = true;
                currentDate.setMonth(currentDate.getMonth() - 1);
                await fetchAttendanceForMonth();
                updateMonthDisplay();
                populateCalendarHeader();
                populateAttendanceTable();
                prevMonthBtn.disabled = false;
            });

            nextMonthBtn.addEventListener('click', async () => {
                nextMonthBtn.disabled = true;
                currentDate.setMonth(currentDate.getMonth() + 1);
                await fetchAttendanceForMonth();
                updateMonthDisplay();
                populateCalendarHeader();
                populateAttendanceTable();
                nextMonthBtn.disabled = false;
            });

            loadData();
        }
    })();
}

if (document.getElementById('contact-section')) {
    (async () => {
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
            applySettingsFunctionality();
            const contactTableBody = document.getElementById('contact-table-body');
            let studentsData = [];
            const loadData = async () => {
                const busId = localStorage.getItem('loggedInBusId');
                if (!busId) {
                    window.location.href = 'index.html';
                    return;
                }
                try {
                    const studentsResponse = await fetch(`${backendUrl}/api/students/${busId}`);
                    const studentsResult = await studentsResponse.json();
                    if (!studentsResponse.ok) throw new Error(studentsResult.message || 'Failed to fetch students');
                    studentsData = studentsResult.students || [];
                    populateContactTable();
                } catch (err) {
                    alert(`Error loading data: ${err.message}`);
                }
            };
            const populateContactTable = () => {
                contactTableBody.innerHTML = '';
                if (!studentsData || studentsData.length === 0) {
                    contactTableBody.innerHTML = `<tr><td colspan="2" class="text-center p-3 text-lg">${translations[currentLanguage].noStudents}</td></tr>`;
                    return;
                }
                studentsData.forEach((student) => {
                    const row = document.createElement('tr');
                    const phone = "123-456-7890";
                    row.innerHTML = `
                        <td class="p-3 text-lg">${student.name}</td>
                        <td class="p-3 text-lg"><a href="tel:${phone}" class="text-blue-600 hover:underline">${phone}</a></td>
                    `;
                    contactTableBody.appendChild(row);
                });
            };
            loadData();
        }
    })();
}