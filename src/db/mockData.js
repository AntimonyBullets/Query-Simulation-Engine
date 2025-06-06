const mockData = {
    users: [
        { id: 1, name: "alice", email: "alice@example.com", age: 25, join_date: "2024-02-15" },
        { id: 2, name: "bob", email: "bob@example.com", age: 30, join_date: "2024-03-01" },
        { id: 3, name: "charlie", email: "charlie@example.com", age: 35, join_date: "2023-12-20" },
        { id: 4, name: "david", email: "david@example.com", age: 28, join_date: "2024-01-10" },
        { id: 5, name: "emma", email: "emma@example.com", age: 22, join_date: "2024-02-28" },
    ],
    
    products: [
        { id: 101, name: "laptop", category: "electronics", price: 1200, stock: 10 },
        { id: 102, name: "phone", category: "electronics", price: 800, stock: 5 },
        { id: 103, name: "tablet", category: "electronics", price: 500, stock: 7 },
        { id: 104, name: "keyboard", category: "accessories", price: 50, stock: 20 },
        { id: 105, name: "mouse", category: "accessories", price: 25, stock: 15 },
    ],

    orders: [
        { id: 1001, user_id: 1, product_id: 101, quantity: 1, order_date: "2024-03-05" },
        { id: 1002, user_id: 2, product_id: 102, quantity: 2, order_date: "2024-03-10" },
        { id: 1003, user_id: 3, product_id: 103, quantity: 1, order_date: "2024-02-25" },
        { id: 1004, user_id: 4, product_id: 104, quantity: 3, order_date: "2024-01-15" },
        { id: 1005, user_id: 5, product_id: 105, quantity: 5, order_date: "2024-02-28" },
    ],
};

export default mockData
