import React, { useState } from 'react';

interface Attendance {
    id: string;
    employeeName: string;
    date: string;
    checkIn: string;
    checkOut: string;
}

export const PointagePage: React.FC = () => {
    const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
    const [employeeName, setEmployeeName] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const handleAddAttendance = () => {
        const newAttendance: Attendance = {
            id: Date.now().toString(),
            employeeName,
            date: new Date().toISOString().split('T')[0],
            checkIn,
            checkOut,
        };

        setAttendanceList([...attendanceList, newAttendance]);
        setEmployeeName('');
        setCheckIn('');
        setCheckOut('');
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Pointage</h1>

            <div className="mb-6 space-y-4">
                <input
                    type="text"
                    placeholder="Employee Name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                />
                <input
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                    placeholder="Check In"
                />
                <input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                    placeholder="Check Out"
                />
                <button
                    onClick={handleAddAttendance}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Add Attendance
                </button>
            </div>

            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Employee</th>
                        <th className="border p-2">Date</th>
                        <th className="border p-2">Check In</th>
                        <th className="border p-2">Check Out</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceList.map((record) => (
                        <tr key={record.id}>
                            <td className="border p-2">{record.employeeName}</td>
                            <td className="border p-2">{record.date}</td>
                            <td className="border p-2">{record.checkIn}</td>
                            <td className="border p-2">{record.checkOut}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};