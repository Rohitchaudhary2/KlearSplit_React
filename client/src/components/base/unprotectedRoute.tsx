import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../store";

const UnprotectedRoute = () => {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    )

    return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard"/>
}

export default UnprotectedRoute;