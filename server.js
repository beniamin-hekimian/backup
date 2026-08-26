import express from "express";
import userRoute from './routes/userRoute.js'
import tagRoute from './routes/tagRoute.js'
import mealRoute from './routes/mealRoute.js'
import homeRoute from './routes/homeRoute.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1/users', userRoute);
app.use('/api/v1/tags', tagRoute);
app.use('/api/v1/meals', mealRoute);
app.use('/api/v1/home', homeRoute);

app.use((err, req, res, next) =>
{
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: err.status || 'error',
        message: err.message || 'Something went wrong',
    });
});

app.listen(PORT, () =>
{
    console.log(`Server running on port ${PORT}`);
});


