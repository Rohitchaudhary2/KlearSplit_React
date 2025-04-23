import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../../store";
import ResponsiveAppBar from "../shared/navbar";

const ProtectedRoute = () => {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    )

    return isAuthenticated ? <ResponsiveAppBar /> : <Navigate to="/login"/>
}

export default ProtectedRoute;