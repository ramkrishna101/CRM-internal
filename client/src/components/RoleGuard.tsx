import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface RoleGuardProps {
    children: React.ReactNode;
    roles: string[];
}

const RoleGuard = ({ children, roles }: RoleGuardProps) => {
    const { user } = useSelector((state: RootState) => state.auth);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
