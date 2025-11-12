// index.js
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8000;

// Connect to database then start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running on port ${PORT}`);
            console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
            console.log(`📊 Health: http://localhost:${PORT}/api/v1/health`);
        });

        app.on('error', (error) => {
            console.error('❌ Server error:', error);
            throw error;
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err);
        process.exit(1);
    });