import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import React from 'react';

interface AuthGuardProps {
    children: React.ReactElement;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
