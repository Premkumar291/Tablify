import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Home from '../pages/dashboard/Home';
import Convert from '../pages/dashboard/Convert';
import ApiKeys from '../pages/dashboard/ApiKeys';
import Docs from '../pages/dashboard/Docs';
import Usage from '../pages/dashboard/Usage';
import Billing from '../pages/dashboard/Billing';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Home />} />
                <Route path="convert" element={<Convert />} />
                <Route path="api-keys" element={<ApiKeys />} />
                <Route path="docs" element={<Docs />} />
                <Route path="usage" element={<Usage />} />
                <Route path="billing" element={<Billing />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
