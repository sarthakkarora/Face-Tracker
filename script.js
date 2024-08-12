const video = document.getElementById('video');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const captureButton = document.getElementById('captureButton');
const attendanceForm = document.getElementById('attendanceForm');
const attendanceData = document.getElementById('attendanceData');
const recentList = document.getElementById('recentList');
const downloadCsvButton = document.getElementById('downloadCsvButton');

let stream = null;
const recentAttendees = []; 


startButton.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        showFeedback('Camera started successfully.', 'success');
    } catch (error) {
        console.error('Error accessing camera:', error);
        showFeedback('Failed to access camera. Please check your permissions.', 'error');
    }
});


stopButton.addEventListener('click', () => {
    if (stream) {
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        showFeedback('Camera stopped.', 'info');
    } else {
        showFeedback('No camera is currently active.', 'warning');
    }
});


captureButton.addEventListener('click', () => {
    if (!stream) {
        showFeedback('Please start the camera first.', 'warning');
        return;
    }

    const name = attendanceForm.name.value;
    const rollNumber = attendanceForm.rollNumber.value;
    const date = attendanceForm.date.value;
    const status = attendanceForm.status.value;

    
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgSrc = canvas.toDataURL('image/jpeg'); 

  
    const attendee = { name, rollNumber, date, status, imgSrc };
    recentAttendees.unshift(attendee);
    if (recentAttendees.length > 3) {
        recentAttendees.pop(); 
    }
    updateRecentList();
    showFeedback('Attendance captured successfully.', 'success');
});


function updateRecentList() {
    recentList.innerHTML = '';
    recentAttendees.forEach(({ name, rollNumber, date, imgSrc }) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="attendee-details">
                <div><strong>Name:</strong> ${name}</div>
                <div><strong>ID:</strong> ${rollNumber}</div>
                <div><strong>Date:</strong> ${date}</div>
                <div><img src="${imgSrc}" alt="Student Photo" class="attendee-image"></div>
            </div>
        `;
        recentList.appendChild(li);
    });
}


downloadCsvButton.addEventListener('click', () => {
    const csvRows = [
        ['Name', 'Roll Number', 'Date', 'Status', 'Image URL']
    ];

    recentAttendees.forEach(({ name, rollNumber, date, status, imgSrc }) => {
        const base64Image = imgSrc.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
        const escapedBase64Image = `"${base64Image.replace(/"/g, '""')}"`;
        csvRows.push([name, rollNumber, date, status, escapedBase64Image]);
    });

    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'attendance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('CSV file downloaded successfully.', 'success');
});


function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    document.body.appendChild(feedback);
    feedback.style.display = 'block';
    setTimeout(() => {
        feedback.style.display = 'none';
        feedback.remove();
    }, 3000);
}
