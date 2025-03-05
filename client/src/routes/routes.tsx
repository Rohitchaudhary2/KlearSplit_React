import { createBrowserRouter } from 'react-router-dom';
import UnprotectedRoute from '../components/base/unprotectedRoute';
import HomePage from '../pages/home';
import RegisterPage from "../pages/register"
import LoginPage from '../pages/login'
import ProtectedRoute from '../components/base/protectedRoute';
import DashboardPage from '../pages/dashboard';

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
    },
    {
        path: '/',
        element: <ProtectedRoute/>,
        children: [
            {
                path: 'dashboard',
                element: <DashboardPage/>
            }
        ]
    }
])

export default router;