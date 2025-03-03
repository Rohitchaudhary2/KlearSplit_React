import { createBrowserRouter } from 'react-router-dom';
import UnprotectedRoute from '../components/unprotectedRoute';
import HomePage from '../pages/home';
import RegisterPage from "../pages/register"
import LoginPage from '../pages/login'

const router = createBrowserRouter ([
    {
        path: '/',
        element: <UnprotectedRoute />,
        children: [
            {
                index: true,
                element: <HomePage/>
            },
            {
                path: 'register',
                element: <RegisterPage/>
            },
            {
                path: 'login',
                element: <LoginPage/>
            }
        ]
    }
])

export default router;