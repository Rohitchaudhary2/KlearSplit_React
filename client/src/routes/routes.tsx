import { createBrowserRouter } from 'react-router-dom';
import UnprotectedRoute from '../components/base/unprotectedRoute';
import HomePage from '../pages/home';
import RegisterPage from "../pages/auth/register"
import LoginPage from '../pages/auth/login/index'
import ProtectedRoute from '../components/base/protectedRoute';
import DashboardPage from '../pages/dashboard/index';
import Friendspage from '../pages/friends-groups/friends/index';
import GroupsPage from '../pages/friends-groups/groups/index';
import Profile from '../pages/profile';
import ForgotPassword from '../pages/auth/forgotPassword';

const router = createBrowserRouter([
    {
        path: '/',
        element: <UnprotectedRoute />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: 'register',
                element: <RegisterPage />
            },
            {
                path: 'login',
                element: <LoginPage />
            },
            {
                path: "forgot-password",
                element: <ForgotPassword />,
            },
        ]
    },
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            {
                path: 'dashboard',
                element: <DashboardPage />
            },
            {
                path: 'friends',
                element: <Friendspage />
            },
            {
                path: 'groups',
                element: <GroupsPage />
            },
            {
                path: 'profile',
                element: <Profile />
            }
        ]
    }
])

export default router;