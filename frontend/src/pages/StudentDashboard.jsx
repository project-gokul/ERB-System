function StudentDashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div style={{ padding: "30px" }}>
            <h1>🎓 Student Dashboard</h1>
            <p>Name: {user?.name}</p>
            <p>Department: {user?.department}</p>
           
        </div>
    );
}

export default StudentDashboard;
