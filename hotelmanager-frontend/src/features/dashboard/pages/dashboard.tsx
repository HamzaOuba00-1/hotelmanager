import React from 'react';

const Dashboard: React.FC = () => {
    const [items, setItems] = React.useState<string[]>([]);

    const addItem = (item: string) => {
        setItems(prevItems => [...prevItems, item]);
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <button onClick={() => addItem('New Item')}>Add Item</button>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;